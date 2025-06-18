import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
// import { CoursePlayer } from '@/components/learn/course-player'

interface CourseLearnPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseLearnPage({ params }: CourseLearnPageProps) {
  const { courseId } = await params
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
      }
    }
  })
  if (!enrollment) {
    redirect(`/courses/${courseId}`)
  }

  // Encontrar la primera lección no completada o la primera lección
  const firstIncompleteLesson = enrollment.course.modules
    .flatMap(module => module.lessons)
    .find(lesson => 
      !enrollment.progress.some(p => p.lessonId === lesson.id && p.completed)
    )
  const firstLesson = enrollment.course.modules[0]?.lessons[0]
  const targetLesson = firstIncompleteLesson || firstLesson

  if (targetLesson) {
    redirect(`/learn/${courseId}/lesson/${targetLesson.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {enrollment.course.title}
          </h1>
          <p className="text-gray-600 mb-8">
            Este curso no tiene lecciones disponibles.
          </p>          <a
            href={`/courses/${courseId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver al curso
          </a>
        </div>
      </div>
    </div>
  )
}
