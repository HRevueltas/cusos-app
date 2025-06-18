import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

// Schema de validación para opciones de pregunta
const optionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "El texto de la opción es obligatorio"),
  isCorrect: z.boolean(),
  order: z.number().min(1)
})

// Schema de validación para preguntas
const questionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, "La pregunta es obligatoria"),
  order: z.number().min(1),
  options: z.array(optionSchema).min(2, "Cada pregunta debe tener al menos 2 opciones")
}).refine(data => data.options.some(option => option.isCorrect), {
  message: "Cada pregunta debe tener al menos una respuesta correcta"
})

// Schema de validación para actualizar lección
const updateLessonSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  content: z.string().min(1, "El contenido es obligatorio"),
  type: z.enum(["TEXT", "VIDEO", "PDF", "QUIZ"]),
  videoUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  order: z.number().int().min(1),
  questions: z.array(questionSchema).optional()
}).refine(data => {
  if (data.type === "QUIZ") {
    return data.questions && data.questions.length > 0
  }
  return true
}, {
  message: "Las lecciones de tipo QUIZ deben tener al menos una pregunta"
})

interface RouteParams {
  params: Promise<{
    id: string
    moduleId: string
    lessonId: string
  }>
}

// GET /api/courses/[id]/modules/[moduleId]/lessons/[lessonId] - Obtener lección específica
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }    // Obtener la lección
    const lesson = await db.lesson.findUnique({
      where: {
        id: resolvedParams.lessonId,
        moduleId: resolvedParams.moduleId
      },
      include: {
        module: {
          select: {
            id: true,
            title: true,
            courseId: true
          }
        },
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!lesson) {
      return NextResponse.json(
        { error: "Lección no encontrada" },
        { status: 404 }
      )
    }

    // Verificar que la lección pertenece al curso del instructor
    if (lesson.module.courseId !== resolvedParams.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    return NextResponse.json({ lesson })

  } catch (error) {
    console.error("Error obteniendo lección:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id]/modules/[moduleId]/lessons/[lessonId] - Actualizar lección
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log("Update lesson body:", body)

    // Validar datos
    const validatedData = updateLessonSchema.parse(body)
    console.log("Validated lesson data:", validatedData)

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que la lección existe y pertenece al módulo
    const existingLesson = await db.lesson.findUnique({
      where: {
        id: resolvedParams.lessonId,
        moduleId: resolvedParams.moduleId
      },
      include: {
        module: {
          select: {
            courseId: true
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lección no encontrada" },
        { status: 404 }
      )
    }

    if (existingLesson.module.courseId !== resolvedParams.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }    // Actualizar la lección usando una transacción para manejar preguntas
    const updatedLesson = await db.$transaction(async (tx) => {
      // Actualizar la lección
      const lesson = await tx.lesson.update({
        where: { id: resolvedParams.lessonId },
        data: {
          title: validatedData.title,
          content: validatedData.content,
          type: validatedData.type,
          order: validatedData.order,
          videoUrl: validatedData.videoUrl || null,
          fileUrl: validatedData.fileUrl || null
        }
      })

      // Si es un quiz, manejar las preguntas
      if (validatedData.type === "QUIZ" && validatedData.questions) {
        // Eliminar preguntas existentes (esto también eliminará las opciones por cascade)
        await tx.question.deleteMany({
          where: { lessonId: resolvedParams.lessonId }
        })

        // Crear las nuevas preguntas
        for (const questionData of validatedData.questions) {
          const question = await tx.question.create({
            data: {
              question: questionData.question,
              order: questionData.order,
              lessonId: resolvedParams.lessonId
            }
          })

          // Crear las opciones de la pregunta
          for (const optionData of questionData.options) {
            await tx.option.create({
              data: {
                text: optionData.text,
                isCorrect: optionData.isCorrect,
                order: optionData.order,
                questionId: question.id
              }
            })
          }
        }
      } else if (validatedData.type !== "QUIZ") {
        // Si cambió de QUIZ a otro tipo, eliminar todas las preguntas
        await tx.question.deleteMany({
          where: { lessonId: resolvedParams.lessonId }
        })
      }

      // Retornar la lección actualizada con sus preguntas
      return await tx.lesson.findUnique({
        where: { id: resolvedParams.lessonId },
        include: {
          module: {
            select: {
              id: true,
              title: true
            }
          },
          questions: {
            include: {
              options: {
                orderBy: { order: 'asc' }
              }
            },
            orderBy: { order: 'asc' }
          }
        }
      })
    })

    return NextResponse.json({
      message: "Lección actualizada exitosamente",
      lesson: updatedLesson
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error actualizando lección:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id]/modules/[moduleId]/lessons/[lessonId] - Eliminar lección
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findUnique({
      where: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que la lección existe y pertenece al módulo
    const existingLesson = await db.lesson.findUnique({
      where: {
        id: resolvedParams.lessonId,
        moduleId: resolvedParams.moduleId
      },
      include: {
        module: {
          select: {
            courseId: true
          }
        }
      }
    })

    if (!existingLesson) {
      return NextResponse.json(
        { error: "Lección no encontrada" },
        { status: 404 }
      )
    }

    if (existingLesson.module.courseId !== resolvedParams.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // Eliminar la lección
    await db.lesson.delete({
      where: { id: resolvedParams.lessonId }
    })

    return NextResponse.json({
      message: "Lección eliminada exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando lección:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
