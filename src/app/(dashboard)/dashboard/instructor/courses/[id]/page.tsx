import { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CourseDetails } from "@/components/courses/course-details"

interface CourseDetailPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Detalle del Curso",
  description: "Gestiona tu curso y su contenido"
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "INSTRUCTOR") {
    redirect("/dashboard")
  }

  // Await params before using its properties (Next.js 15 requirement)
  const resolvedParams = await params

  // Buscar el curso con toda la información
  const course = await db.course.findUnique({
    where: {
      id: resolvedParams.id,
      instructorId: session.user.id
    },
    include: {
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      },
      _count: {
        select: {
          enrollments: true,
          reviews: true
        }
      },        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: { id: 'desc' }, // Changed from createdAt to id
          take: 5
        }
    }
  })

  if (!course) {
    notFound()
  }

  // Calcular estadísticas
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
  const averageRating = course.reviews.length > 0 
    ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
    : 0

  return (
    <div className="container mx-auto py-6">
      <CourseDetails 
        course={{
          ...course,
          totalLessons,
          averageRating
        }}
      />
    </div>
  )
}
