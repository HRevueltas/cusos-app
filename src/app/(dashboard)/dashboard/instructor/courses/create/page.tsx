import { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { CourseForm } from "@/components/courses/course-form"

export const metadata: Metadata = {
  title: "Crear Curso",
  description: "Crea un nuevo curso en la plataforma"
}

export default async function CreateCoursePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-6">
      <CourseForm mode="create" />
    </div>
  )
}
