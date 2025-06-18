import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { CoursePlayer } from '@/components/learn/course-player'

interface LessonPageProps {
  params: Promise<{
    courseId: string
    lessonId: string
  }>
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }
  // Verificar que el usuario está inscrito en el curso
  const enrollment = await db.enrollment.findFirst({
    where: {
      courseId: courseId,
      studentId: session.user.id
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
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
              }
            },
            orderBy: { order: 'asc' }
          },
          instructor: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      },
      progress: {
        include: {
          lesson: true
        }
      },
      answers: {
        where: {
          question: {
            lessonId: lessonId
          }
        },
        include: {
          question: true,
          option: true
        }
      }
    }
  })
  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  // Buscar la lección actual
  const currentLesson = enrollment.course.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === lessonId)

  if (!currentLesson) {
    redirect(`/learn/${courseId}`)
  }
  // Obtener el progreso de la lección actual
  const lessonProgress = enrollment.progress.find(p => p.lessonId === lessonId)

  // Preparar las respuestas del usuario para el quiz
  const userAnswers = enrollment.answers.map(answer => ({
    questionId: answer.question.id,
    optionId: answer.option.id,
    answeredAt: answer.answeredAt
  }))

  return (
    <CoursePlayer
      course={enrollment.course}
      currentLessonId={lessonId}
      enrollment={enrollment}
      progress={enrollment.progress}
      lessonProgress={lessonProgress}
      userAnswers={userAnswers}
    />
  )
}
