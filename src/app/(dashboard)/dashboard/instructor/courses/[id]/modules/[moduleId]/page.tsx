import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { ModuleManagement } from "@/components/courses/module-management"

interface ModulePageProps {
  params: {
    id: string
    moduleId: string
  }
}

export const metadata: Metadata = {
  title: "Gestión de Módulo",
  description: "Gestiona las lecciones y contenido del módulo"
}

export default async function ModulePage({ params }: ModulePageProps) {
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
    }
  })

  if (!course) {
    notFound()
  }
  // Buscar el módulo con sus lecciones
  const moduleData = await db.module.findUnique({
    where: {
      id: resolvedParams.moduleId,
      courseId: resolvedParams.id
    },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!moduleData) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <ModuleManagement 
        course={{ id: course.id, title: course.title }}
        module={moduleData}
      />
    </div>
  )
}
