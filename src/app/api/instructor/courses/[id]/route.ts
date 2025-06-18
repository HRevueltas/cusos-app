import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const courseId = params.id

    if (!courseId) {
      return NextResponse.json(
        { error: "ID de curso requerido" },
        { status: 400 }
      )
    }

    // Verificar que el curso pertenece al instructor
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id
      }
    })

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado" },
        { status: 404 }
      )
    }

    // Eliminar el curso y todos sus datos relacionados
    await db.course.delete({
      where: { id: courseId }
    })

    return NextResponse.json({ 
      success: true,
      message: "Curso eliminado correctamente" 
    })

  } catch (error) {
    console.error("Error eliminando curso:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
