import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ModuleForm } from "@/components/courses/module-form"

interface EditModulePageProps {
  params: {
    id: string
    moduleId: string
  }
}

export const metadata: Metadata = {
  title: "Editar Módulo",
  description: "Edita la información del módulo"
}

export default async function EditModulePage({ params }: EditModulePageProps) {
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
  // Buscar el módulo específico
  const moduleData = await db.module.findUnique({
    where: {
      id: resolvedParams.moduleId,
      courseId: resolvedParams.id
    }
  })

  if (!moduleData) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar Módulo</h1>
        <p className="text-gray-600">
          Curso: <span className="font-medium">{course.title}</span>
        </p>
      </div>
      
      <ModuleForm 
        courseId={resolvedParams.id}
        moduleId={moduleData.id}
        mode="edit"
        initialData={{
          title: moduleData.title,
          description: moduleData.description || "",
          order: moduleData.order
        }}
        existingModules={course.modules}
      />
    </div>
  )
}
