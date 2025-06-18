import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { CourseCompletionWrapper } from '@/components/learn/course-completion-wrapper'

interface CourseCompletedPageProps {
  params: Promise<{
    courseId: string
  }>
}

export default async function CourseCompletedPage({ params }: CourseCompletedPageProps) {
  const { courseId } = await params
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/login')
  }

  // Verificar que el usuario está inscrito y ha completado el curso
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
              lessons: true
            }
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
        where: {
          completed: true
        }
      }
    }
  })

  if (!enrollment) {
    redirect(`/courses/${params.courseId}`)
  }

  const totalLessons = enrollment.course.modules.reduce(
    (total, module) => total + module.lessons.length, 
    0
  )
  const completedLessons = enrollment.progress.length

  // Si no está 100% completado, redirigir al curso
  if (completedLessons < totalLessons) {
    redirect(`/learn/${params.courseId}`)
  }

  // Encontrar la fecha de finalización (última lección completada)
  const lastCompletedProgress = enrollment.progress
    .filter(p => p.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]

  const completionDate = lastCompletedProgress?.completedAt || new Date()
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <CourseCompletionWrapper
          course={{
            id: enrollment.course.id,
            title: enrollment.course.title,
            instructor: {
              name: enrollment.course.instructor.name,
              avatar: enrollment.course.instructor.avatar
            }
          }}
          stats={{
            totalLessons,
            completedLessons,
            completionDate,
            timeSpent: undefined // Calcular en implementación real
          }}
        />
      </div>
    </div>
  )
}
