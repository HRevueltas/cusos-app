import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LessonForm } from "@/components/courses/lesson-form"

interface EditLessonPageProps {
  params: Promise<{
    id: string
    moduleId: string
    lessonId: string
  }>
}

export default async function EditLessonPage({ params }: EditLessonPageProps) {
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
  // Obtener la lección a editar
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
    <div className="container mx-auto py-6">      <LessonForm 
        mode="edit"
        courseId={course.id}
        moduleId={module.id}
        lessonId={lesson.id}
        initialData={{
          title: lesson.title,
          content: lesson.content,
          type: lesson.type,
          videoUrl: lesson.videoUrl || "",
          fileUrl: lesson.fileUrl || "",
          order: lesson.order,
          questions: lesson.questions.map(question => ({
            id: question.id,
            question: question.question,
            order: question.order,
            options: question.options.map(option => ({
              id: option.id,
              text: option.text,
              isCorrect: option.isCorrect,
              order: option.order
            }))
          }))
        }}
        courseName={course.title}
        moduleName={module.title}
      />
    </div>
  )
}
