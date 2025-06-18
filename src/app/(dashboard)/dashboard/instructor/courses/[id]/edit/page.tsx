import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CourseForm } from "@/components/courses/course-form"

interface EditCoursePageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Editar Curso",
  description: "Edita la información de tu curso"
}

export default async function EditCoursePage({ params }: EditCoursePageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard")
  }

  // Await params before using its properties (Next.js 15 requirement)
  const resolvedParams = await params

  // Buscar el curso y verificar que pertenece al instructor
  const course = await db.course.findUnique({
    where: {
      id: resolvedParams.id,
      instructorId: session.user.id // Solo permite editar sus propios cursos
    }
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <CourseForm 
        mode="edit" 
        courseId={course.id}
        initialData={{
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          isFree: course.isFree,
          image: course.image || undefined
        }}
      />
    </div>
  )
}
