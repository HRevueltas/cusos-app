import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ModuleForm } from "@/components/courses/module-form"

interface CreateModulePageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Crear Módulo",
  description: "Añade un nuevo módulo a tu curso"
}

export default async function CreateModulePage({ params }: CreateModulePageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard")
  }

  // Await params before using its properties (Next.js 15 requirement)
  const resolvedParams = await params

  // Verificar que el curso pertenece al instructor
  const course = await db.course.findUnique({
    where: {
      id: resolvedParams.id,
      instructorId: session.user.id
    },
    include: {
      modules: {
        select: {
          id: true,
          title: true,
          order: true
        },
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!course) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Crear Nuevo Módulo</h1>
        <p className="text-gray-600">
          Curso: <span className="font-medium">{course.title}</span>
        </p>
      </div>
        <ModuleForm 
        courseId={resolvedParams.id}
        mode="create"
        existingModules={course.modules}
      />
    </div>
  )
}
