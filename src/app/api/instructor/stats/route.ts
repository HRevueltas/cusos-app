import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener cursos del instructor
    const courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        enrollments: {
          include: {
            student: true
          }
        },
        reviews: true,
        modules: {
          include: {
            lessons: true
          }
        }
      }
    })

    const totalCourses = courses.length
    const publishedCourses = courses.filter(course => course.isPublished).length
    const totalStudents = courses.reduce((acc, course) => acc + course.enrollments.length, 0)
    
    // Calcular ingresos (solo cursos de pago)
    const totalRevenue = courses.reduce((acc, course) => {
      if (!course.isFree) {
        return acc + (course.price * course.enrollments.length)
      }
      return acc
    }, 0)

    // Calcular valoración promedio
    const allReviews = courses.flatMap(course => course.reviews)
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length
      : 0

    // Estudiantes únicos
    const uniqueStudents = new Set(
      courses.flatMap(course => course.enrollments.map(e => e.studentId))
    ).size

    return NextResponse.json({
      totalCourses,
      publishedCourses,
      totalStudents: uniqueStudents,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        price: course.price,
        isFree: course.isFree,
        isPublished: course.isPublished,
        studentsCount: course.enrollments.length,
        lessonsCount: course.modules.reduce((acc, module) => acc + module.lessons.length, 0),
        rating: course.reviews.length > 0 
          ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
          : 0,
        createdAt: course.createdAt
      }))
    })

  } catch (error) {
    console.error("Error obteniendo estadísticas del instructor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
