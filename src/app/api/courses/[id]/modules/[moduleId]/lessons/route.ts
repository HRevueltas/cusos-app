import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

interface RouteParams {
  params: {
    id: string
    moduleId: string
  }
}

// Schema de validación para opciones de pregunta
const optionSchema = z.object({
  text: z.string().min(1, "El texto de la opción es obligatorio"),
  isCorrect: z.boolean(),
  order: z.number().min(1)
})

// Schema de validación para preguntas
const questionSchema = z.object({
  question: z.string().min(1, "La pregunta es obligatoria"),
  order: z.number().min(1),
  options: z.array(optionSchema).min(2, "Cada pregunta debe tener al menos 2 opciones")
}).refine(data => data.options.some(option => option.isCorrect), {
  message: "Cada pregunta debe tener al menos una respuesta correcta"
})

// Schema de validación para crear lección
const createLessonSchema = z.object({
  title: z.string().min(1, "El título es obligatorio").max(100, "Máximo 100 caracteres"),
  content: z.string().min(1, "El contenido es obligatorio"),
  type: z.enum(["TEXT", "VIDEO", "PDF", "QUIZ"]),
  videoUrl: z.string().url().optional().or(z.literal("")),
  fileUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().min(1, "El orden debe ser mayor a 0"),
  questions: z.array(questionSchema).optional()
}).refine(data => {
  if (data.type === "QUIZ") {
    return data.questions && data.questions.length > 0
  }
  return true
}, {
  message: "Las lecciones de tipo QUIZ deben tener al menos una pregunta"
})

// GET /api/courses/[id]/modules/[moduleId]/lessons - Obtener lecciones de un módulo
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params

    // Verificar que el módulo pertenece a un curso del instructor
    const courseModule = await db.module.findFirst({
      where: {
        id: resolvedParams.moduleId,
        course: {
          id: resolvedParams.id,
          instructorId: session.user.id
        }
      }
    })

    if (!courseModule) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      )    }

    const lessons = await db.lesson.findMany({
      where: { moduleId: resolvedParams.moduleId },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ lessons })

  } catch (error) {
    console.error("Error obteniendo lecciones:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// POST /api/courses/[id]/modules/[moduleId]/lessons - Crear lección
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Await params before using its properties (Next.js 15 requirement)
    const resolvedParams = await params    // Verificar que el módulo pertenece a un curso del instructor
    const courseModule = await db.module.findFirst({
      where: {
        id: resolvedParams.moduleId,
        course: {
          id: resolvedParams.id,
          instructorId: session.user.id
        }
      }
    })

    if (!courseModule) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createLessonSchema.parse(body)

    // Verificar que no existe otra lección con el mismo orden
    const existingLesson = await db.lesson.findFirst({
      where: {
        moduleId: resolvedParams.moduleId,
        order: validatedData.order
      }
    })

    if (existingLesson) {
      return NextResponse.json(
        { error: "Ya existe una lección con ese orden" },
        { status: 400 }
      )
    }    const lesson = await db.lesson.create({
      data: {
        title: validatedData.title,
        content: validatedData.content,
        type: validatedData.type,
        order: validatedData.order,
        moduleId: resolvedParams.moduleId,
        videoUrl: validatedData.videoUrl || null,
        fileUrl: validatedData.fileUrl || null
      }
    })

    // Si es un quiz, crear las preguntas
    if (validatedData.type === "QUIZ" && validatedData.questions) {
      for (const questionData of validatedData.questions) {
        const question = await db.question.create({
          data: {
            question: questionData.question,
            order: questionData.order,
            lessonId: lesson.id
          }
        })

        // Crear las opciones de la pregunta
        for (const optionData of questionData.options) {
          await db.option.create({
            data: {
              text: optionData.text,
              isCorrect: optionData.isCorrect,
              order: optionData.order,
              questionId: question.id
            }
          })
        }
      }
    }

    return NextResponse.json({
      message: "Lección creada exitosamente",
      lesson
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando lección:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
