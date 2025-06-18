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

    // Obtener estadísticas generales
    const totalUsers = await db.user.count()
    const totalStudents = await db.user.count({ where: { role: "STUDENT" } })
    const totalInstructors = await db.user.count({ where: { role: "INSTRUCTOR" } })
    const totalCourses = await db.course.count()
    const publishedCourses = await db.course.count({ where: { isPublished: true } })
    const totalEnrollments = await db.enrollment.count()

    // Obtener ingresos totales
    const courses = await db.course.findMany({
      where: { isFree: false },
      include: { enrollments: true }
    })

    const totalRevenue = courses.reduce((acc, course) => {
      return acc + (course.price * course.enrollments.length)
    }, 0)

    // Usuarios registrados hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const usersToday = await db.user.count({
      where: {
        createdAt: {
          gte: today
        }
      }
    })

    // Usuarios recientes (últimos 5)
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    // Cursos recientes (últimos 5)
    const recentCourses = await db.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: { name: true }
        },
        enrollments: true
      }
    })

    return NextResponse.json({
      totalUsers,
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalRevenue,
      usersToday,
      recentUsers,
      recentCourses: recentCourses.map(course => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor.name,
        studentsCount: course.enrollments.length,
        isPublished: course.isPublished,
        createdAt: course.createdAt
      }))
    })

  } catch (error) {
    console.error("Error obteniendo estadísticas del admin:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
