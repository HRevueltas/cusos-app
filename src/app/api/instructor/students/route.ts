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

    // Obtener todos los estudiantes inscritos en cursos del instructor
    const enrollments = await db.enrollment.findMany({
      where: {
        course: {
          instructorId: session.user.id
        }
      },
      include: {
        student: true,
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            }
          }
        },
        progress: true
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    })

    const students = enrollments.map(enrollment => {
      const totalLessons = enrollment.course.modules.reduce((acc, module) => 
        acc + module.lessons.length, 0
      )
      const completedLessons = enrollment.progress.filter(p => p.completed).length
      const progressPercentage = totalLessons > 0 
        ? (completedLessons / totalLessons) * 100 
        : 0

      // Determinar estado del estudiante
      let status: 'active' | 'inactive' | 'completed'
      if (progressPercentage === 100) {
        status = 'completed'
      } else {
        // Verificar actividad reciente (últimos 7 días)
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        const recentActivity = enrollment.progress.some(p => 
          p.completedAt && new Date(p.completedAt) >= oneWeekAgo
        )
        
        status = recentActivity ? 'active' : 'inactive'
      }

      // Obtener última actividad
      const lastProgress = enrollment.progress
        .filter(p => p.completedAt)
        .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]
      
      const lastActivity = lastProgress?.completedAt || enrollment.enrolledAt

      return {
        id: enrollment.student.id,
        name: enrollment.student.name,
        email: enrollment.student.email,
        enrolledAt: enrollment.enrolledAt,
        courseName: enrollment.course.title,
        courseId: enrollment.course.id,
        progress: {
          completed: completedLessons,
          total: totalLessons,
          percentage: progressPercentage
        },
        lastActivity,
        status
      }
    })

    return NextResponse.json({
      students
    })

  } catch (error) {
    console.error("Error obteniendo estudiantes del instructor:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
