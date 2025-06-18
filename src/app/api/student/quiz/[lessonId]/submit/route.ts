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

    const { enrollmentId, answers } = await request.json()

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

    // Verificar que la lección existe y pertenece al curso
    const lesson = await db.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          courseId: enrollment.courseId
        }
      }
    })

    if (!lesson) {
      return NextResponse.json({ error: 'Lección no encontrada' }, { status: 404 })
    }

    // Eliminar respuestas anteriores si existen
    await db.answer.deleteMany({
      where: {
        enrollmentId,
        question: {
          lessonId
        }
      }
    })

    // Crear nuevas respuestas
    const answerPromises = answers.map((answer: { questionId: string; optionId: string }) =>
      db.answer.create({
        data: {
          enrollmentId,
          questionId: answer.questionId,
          optionId: answer.optionId
        }
      })
    )

    await Promise.all(answerPromises)

    // Verificar si el quiz fue aprobado (70% o más)
    const questions = await db.question.findMany({
      where: { lessonId },
      include: {
        options: true,
        answers: {
          where: { enrollmentId }
        }
      }
    })

    const totalQuestions = questions.length
    let correctAnswers = 0

    questions.forEach(question => {
      const userAnswer = question.answers[0]
      if (userAnswer) {
        const selectedOption = question.options.find(opt => opt.id === userAnswer.optionId)
        if (selectedOption?.isCorrect) {
          correctAnswers++
        }
      }
    })

    const percentage = (correctAnswers / totalQuestions) * 100
    const passed = percentage >= 70

    // Si el quiz fue aprobado, marcar la lección como completada
    if (passed) {
      await db.progress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId,
            lessonId
          }
        },
        create: {
          enrollmentId,
          lessonId,
          completed: true,
          completedAt: new Date()
        },
        update: {
          completed: true,
          completedAt: new Date()
        }
      })
    }

    return NextResponse.json({
      success: true,
      percentage,
      passed,
      correctAnswers,
      totalQuestions
    })

  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
