import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LessonPreview } from "@/components/courses/lesson-preview"

interface PreviewLessonPageProps {
  params: Promise<{
    id: string
    moduleId: string
    lessonId: string
  }>
}

export default async function PreviewLessonPage({ params }: PreviewLessonPageProps) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    notFound()
  }

  // Obtener el curso y verificar permisos
  const course = await db.course.findUnique({
    where: {
      id: resolvedParams.id,
      instructorId: session.user.id
    },
    select: {
      id: true,
      title: true
    }
  })

  if (!course) {
    notFound()
  }

  // Obtener el módulo
  const module = await db.module.findUnique({
    where: {
      id: resolvedParams.moduleId,
      courseId: resolvedParams.id
    },
    select: {
      id: true,
      title: true
    }
  })

  if (!module) {
    notFound()
  }

  // Obtener la lección a previsualizar
  const lesson = await db.lesson.findUnique({
    where: {
      id: resolvedParams.lessonId,
      moduleId: resolvedParams.moduleId
    },
    include: {
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
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <LessonPreview 
        course={course}
        module={module}
        lesson={lesson}
      />
    </div>
  )
}
