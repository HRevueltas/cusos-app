import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { lessonId } = await params
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { enrollmentId } = await request.json()

    // Verificar que el usuario tiene acceso a esta inscripción
    const enrollment = await db.enrollment.findFirst({
      where: {
        id: enrollmentId,
        studentId: session.user.id
      }
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Inscripción no encontrada' }, { status: 404 })
    }

    // Eliminar todas las respuestas del quiz
    await db.answer.deleteMany({
      where: {
        enrollmentId,
        question: {
          lessonId
        }
      }
    })

    // Marcar la lección como no completada
    await db.progress.updateMany({
      where: {
        enrollmentId,
        lessonId
      },
      data: {
        completed: false,
        completedAt: null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error resetting quiz:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
