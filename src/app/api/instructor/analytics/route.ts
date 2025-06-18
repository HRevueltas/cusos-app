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

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calcular fecha de inicio basada en el período
    const startDate = new Date()
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    // Obtener cursos del instructor
    const courses = await db.course.findMany({
      where: { instructorId: session.user.id },
      include: {
        enrollments: {
          include: {
            student: true,
            progress: true
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
    const totalStudents = new Set(courses.flatMap(c => c.enrollments.map(e => e.studentId))).size
    const totalRevenue = courses.reduce((acc, course) => {
      if (!course.isFree) {
        return acc + (course.price * course.enrollments.length)
      }
      return acc
    }, 0)

    // Calcular rating promedio
    const allReviews = courses.flatMap(course => course.reviews)
    const averageRating = allReviews.length > 0 
      ? allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length
      : 0

    // Datos detallados de cada curso
    const coursesData = courses.map(course => {
      const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
      
      // Calcular tasa de finalización
      let totalCompletionRate = 0
      if (course.enrollments.length > 0) {
        const completionRates = course.enrollments.map(enrollment => {
          const completedLessons = enrollment.progress.filter(p => p.completed).length
          return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
        })
        totalCompletionRate = completionRates.reduce((acc, rate) => acc + rate, 0) / completionRates.length
      }

      // Calcular inscripciones del período
      const enrollmentsInPeriod = course.enrollments.filter(e => 
        new Date(e.enrolledAt) >= startDate
      ).length

      // Rating del curso
      const courseRating = course.reviews.length > 0
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
        : 0

      return {
        courseId: course.id,
        title: course.title,
        studentsCount: course.enrollments.length,
        revenue: course.isFree ? 0 : course.price * course.enrollments.length,
        averageRating: courseRating,
        completionRate: totalCompletionRate,
        viewsCount: Math.floor(Math.random() * 1000) + course.enrollments.length * 5, // Simulated
        enrollmentsThisMonth: enrollmentsInPeriod
      }
    })

    // Cursos con mejor rendimiento
    const topPerformingCourses = [
      ...coursesData
        .sort((a, b) => b.studentsCount - a.studentsCount)
        .slice(0, 3)
        .map(course => ({
          courseId: course.courseId,
          title: course.title,
          metric: course.studentsCount,
          metricType: 'students' as const
        })),
      ...coursesData
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 2)
        .map(course => ({
          courseId: course.courseId,
          title: course.title,
          metric: course.revenue,
          metricType: 'revenue' as const
        })),
      ...coursesData
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 2)
        .map(course => ({
          courseId: course.courseId,
          title: course.title,
          metric: course.averageRating,
          metricType: 'rating' as const
        }))
    ].slice(0, 5) // Limitar a 5 cursos

    return NextResponse.json({
      totalCourses,
      totalStudents,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      coursesData,
      topPerformingCourses
    })

  } catch (error) {
    console.error("Error obteniendo analytics del instructor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
