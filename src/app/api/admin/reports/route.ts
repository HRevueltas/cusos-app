import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calcular fechas para comparación
    const now = new Date()
    let startDate = new Date()
    let previousStartDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(now.getDate() - 14)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(now.getDate() - 60)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        previousStartDate.setDate(now.getDate() - 180)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        previousStartDate.setFullYear(now.getFullYear() - 2)
        break
      default:
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(now.getDate() - 60)
    }

    // Estadísticas generales
    const totalUsers = await db.user.count()
    const totalCourses = await db.course.count()
    const totalEnrollments = await db.enrollment.count()

    // Calcular ingresos totales
    const courses = await db.course.findMany({
      where: { isFree: false },
      include: { enrollments: true }
    })
    const totalRevenue = courses.reduce((acc, course) => 
      acc + (course.price * course.enrollments.length), 0
    )

    // Métricas del período actual
    const currentUsers = await db.user.count({
      where: { createdAt: { gte: startDate } }
    })
    const currentCourses = await db.course.count({
      where: { createdAt: { gte: startDate } }
    })
    const currentEnrollments = await db.enrollment.count({
      where: { enrolledAt: { gte: startDate } }
    })
    const currentRevenue = courses.reduce((acc, course) => {
      const currentEnrollmentsCount = course.enrollments.filter(e => 
        new Date(e.enrolledAt) >= startDate
      ).length
      return acc + (course.price * currentEnrollmentsCount)
    }, 0)

    // Métricas del período anterior para comparación
    const previousUsers = await db.user.count({
      where: { 
        createdAt: { 
          gte: previousStartDate,
          lt: startDate
        } 
      }
    })
    const previousCourses = await db.course.count({
      where: { 
        createdAt: { 
          gte: previousStartDate,
          lt: startDate
        } 
      }
    })
    const previousEnrollments = await db.enrollment.count({
      where: { 
        enrolledAt: { 
          gte: previousStartDate,
          lt: startDate
        } 
      }
    })
    const previousRevenue = courses.reduce((acc, course) => {
      const previousEnrollmentsCount = course.enrollments.filter(e => {
        const enrollDate = new Date(e.enrolledAt)
        return enrollDate >= previousStartDate && enrollDate < startDate
      }).length
      return acc + (course.price * previousEnrollmentsCount)
    }, 0)

    // Calcular porcentajes de crecimiento
    const growthMetrics = {
      usersGrowth: previousUsers > 0 ? Math.round(((currentUsers - previousUsers) / previousUsers) * 100) : 0,
      coursesGrowth: previousCourses > 0 ? Math.round(((currentCourses - previousCourses) / previousCourses) * 100) : 0,
      revenueGrowth: previousRevenue > 0 ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 0,
      enrollmentsGrowth: previousEnrollments > 0 ? Math.round(((currentEnrollments - previousEnrollments) / previousEnrollments) * 100) : 0
    }

    // Análisis de cursos
    const courseAnalytics = await db.course.findMany({
      include: {
        instructor: { select: { name: true } },
        enrollments: true,
        reviews: true
      },
      orderBy: {
        enrollments: {
          _count: 'desc'
        }
      },
      take: 20
    })

    const courseAnalyticsData = courseAnalytics.map(course => ({
      courseId: course.id,
      title: course.title,
      instructor: course.instructor.name,
      enrollments: course.enrollments.length,
      revenue: course.isFree ? 0 : course.price * course.enrollments.length,
      rating: course.reviews.length > 0 
        ? course.reviews.reduce((acc, review) => acc + review.rating, 0) / course.reviews.length
        : 0,
      category: course.category
    }))

    // Categorías más populares
    const categoryStats: { [key: string]: { courses: number, enrollments: number, revenue: number } } = {}
    
    courseAnalytics.forEach(course => {
      if (!categoryStats[course.category]) {
        categoryStats[course.category] = { courses: 0, enrollments: 0, revenue: 0 }
      }
      categoryStats[course.category].courses++
      categoryStats[course.category].enrollments += course.enrollments.length
      categoryStats[course.category].revenue += course.isFree ? 0 : course.price * course.enrollments.length
    })

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        coursesCount: stats.courses,
        enrollmentsCount: stats.enrollments,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.enrollmentsCount - a.enrollmentsCount)
      .slice(0, 6)

    return NextResponse.json({
      summary: {
        totalUsers,
        totalCourses,
        totalRevenue,
        totalEnrollments,
        growthMetrics
      },
      courseAnalytics: courseAnalyticsData,
      topCategories
    })

  } catch (error) {
    console.error("Error obteniendo reportes del admin:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
