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

// Schema para actualizar módulo
const updateModuleSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(300).optional(),
  order: z.number().min(1).optional()
})

// GET /api/courses/[id]/modules/[moduleId] - Obtener módulo específico
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

    const moduleData = await db.module.findUnique({
      where: { 
        id: resolvedParams.moduleId,
        courseId: resolvedParams.id
      },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ module: moduleData })

  } catch (error) {
    console.error("Error obteniendo módulo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// PUT /api/courses/[id]/modules/[moduleId] - Actualizar módulo
export async function PUT(
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

    // Verificar que el módulo existe
    const existingModule = await db.module.findUnique({
      where: { 
        id: resolvedParams.moduleId,
        courseId: resolvedParams.id
      }
    })

    if (!existingModule) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateModuleSchema.parse(body)

    // Si se está actualizando el orden, verificar que no existe otro módulo con el mismo orden
    if (validatedData.order && validatedData.order !== existingModule.order) {
      const conflictingModule = await db.module.findFirst({
        where: {
          courseId: resolvedParams.id,
          order: validatedData.order,
          NOT: { id: resolvedParams.moduleId }
        }
      })

      if (conflictingModule) {
        return NextResponse.json(
          { error: "Ya existe un módulo con ese orden" },
          { status: 400 }
        )
      }
    }

    const updatedModule = await db.module.update({
      where: { id: resolvedParams.moduleId },
      data: validatedData,
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      message: "Módulo actualizado exitosamente",
      module: updatedModule
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error actualizando módulo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// DELETE /api/courses/[id]/modules/[moduleId] - Eliminar módulo
export async function DELETE(
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

    // Verificar que el módulo existe
    const moduleData = await db.module.findUnique({
      where: { 
        id: resolvedParams.moduleId,
        courseId: resolvedParams.id
      },
      include: {
        lessons: true
      }
    })

    if (!moduleData) {
      return NextResponse.json(
        { error: "Módulo no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar el módulo (las lecciones se eliminan en cascada según el schema)
    await db.module.delete({
      where: { id: resolvedParams.moduleId }
    })

    return NextResponse.json({
      message: "Módulo eliminado exitosamente"
    })

  } catch (error) {
    console.error("Error eliminando módulo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

