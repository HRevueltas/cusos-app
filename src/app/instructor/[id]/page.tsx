import { notFound } from "next/navigation"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { InstructorProfile } from "@/components/courses/instructor-profile"
import { db } from "@/lib/db"

interface InstructorPageProps {
  params: {
    id: string
  }
}

async function getInstructorProfile(id: string) {
  try {
    const instructor = await db.user.findUnique({
      where: {
        id,
        role: "INSTRUCTOR",
      },
      include: {
        coursesCreated: {
          where: {
            isPublished: true,
          },
          include: {
            _count: {
              select: {
                enrollments: true,
                modules: true,
              },
            },
            reviews: {
              select: {
                rating: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            coursesCreated: {
              where: {
                isPublished: true,
              },
            },
          },
        },
      },
    })

    if (!instructor) {
      return null
    }

    // Calcular estadísticas
    const totalStudents = instructor.coursesCreated.reduce(
      (total, course) => total + course._count.enrollments,
      0
    )

    const allRatings = instructor.coursesCreated.flatMap(course => 
      course.reviews.map(review => review.rating)
    )
    
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length
      : 0

    const coursesWithRating = instructor.coursesCreated.map(course => ({
      ...course,
      averageRating: course.reviews.length > 0
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
        : 0,
    }))

    return {
      ...instructor,
      coursesCreated: coursesWithRating,
      stats: {
        totalCourses: instructor._count.coursesCreated,
        totalStudents,
        averageRating,
        totalReviews: allRatings.length,
      },
    }
  } catch (error) {
    console.error("Error fetching instructor profile:", error)
    return null
  }
}

export default async function InstructorPage({ params }: InstructorPageProps) {
  const instructor = await getInstructorProfile(params.id)

  if (!instructor) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      <div className="container mx-auto px-4 py-8">
        <InstructorProfile instructor={instructor} />
      </div>
      <PublicFooter />
    </div>
  )
}
