import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { LessonForm } from "@/components/courses/lesson-form"

interface CreateLessonPageProps {
  params: Promise<{
    id: string
    moduleId: string
  }>
}

export const metadata: Metadata = {
  title: "Crear Lección",
  description: "Añade una nueva lección al módulo"
}

export default async function CreateLessonPage({ params }: CreateLessonPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard")
  }

  // Await params before using its properties (Next.js 15 requirement)
  const resolvedParams = await params

  // Verificar que el módulo pertenece a un curso del instructor
  const module = await db.module.findFirst({
    where: {
      id: resolvedParams.moduleId,
      course: {
        id: resolvedParams.id,
        instructorId: session.user.id
      }
    },
    include: {
      course: {
        select: {
          id: true,
          title: true
        }
      },
      lessons: {
        select: {
          id: true,
          title: true,
          order: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!module) {
    notFound()
  }
  return (
    <div className="container mx-auto py-6">
      <LessonForm 
        courseId={resolvedParams.id}
        moduleId={resolvedParams.moduleId}
        mode="create"
        existingLessons={module.lessons}
        courseName={module.course.title}
        moduleName={module.title}
      />
    </div>
  )
}
