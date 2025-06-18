import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from 'xlsx'

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
    const type = searchParams.get('type') || 'general'
    const period = searchParams.get('period') || '30d'

    // Calcular fechas
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    let data: any[] = []
    let filename = ""

    switch (type) {
      case 'users':
        data = await db.user.findMany({
          where: {
            createdAt: {
              gte: startDate
            }
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            _count: {
              select: {
                enrollments: true,
                coursesCreated: true
              }
            }
          }
        })
        filename = `usuarios_${period}.xlsx`
        break

      case 'courses':
        data = await db.course.findMany({
          where: {
            createdAt: {
              gte: startDate
            }
          },
          include: {
            instructor: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                enrollments: true,
                reviews: true
              }
            }
          }
        })
        filename = `cursos_${period}.xlsx`
        break

      case 'enrollments':
        data = await db.enrollment.findMany({
          where: {
            enrolledAt: {
              gte: startDate
            }
          },
          include: {
            student: {
              select: {
                name: true,
                email: true
              }
            },
            course: {
              select: {
                title: true,
                price: true,
                instructor: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        })
        filename = `inscripciones_${period}.xlsx`
        break

      case 'reviews':
        data = await db.review.findMany({
          where: {
            createdAt: {
              gte: startDate
            }
          },
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            course: {
              select: {
                title: true,
                instructor: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        })
        filename = `resenas_${period}.xlsx`
        break

      default:
        // Reporte general
        const users = await db.user.count({
          where: { createdAt: { gte: startDate } }
        })
        const courses = await db.course.count({
          where: { createdAt: { gte: startDate } }
        })
        const enrollments = await db.enrollment.count({
          where: { enrolledAt: { gte: startDate } }
        })

        data = [{
          'Período': period,
          'Fecha Inicio': startDate.toLocaleDateString(),
          'Fecha Fin': now.toLocaleDateString(),
          'Nuevos Usuarios': users,
          'Nuevos Cursos': courses,
          'Nuevas Inscripciones': enrollments,
          'Generado el': new Date().toLocaleString()
        }]
        filename = `reporte_general_${period}.xlsx`
        break
    }

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new()
    
    // Formatear datos según el tipo
    let formattedData = data
    if (type === 'users') {
      formattedData = data.map((user: any) => ({
        'ID': user.id,
        'Nombre': user.name,
        'Email': user.email,
        'Rol': user.role,
        'Inscripciones': user._count.enrollments,
        'Cursos Creados': user._count.coursesCreated,
        'Fecha Registro': new Date(user.createdAt).toLocaleDateString()
      }))
    } else if (type === 'courses') {
      formattedData = data.map((course: any) => ({
        'ID': course.id,
        'Título': course.title,
        'Instructor': course.instructor.name,
        'Email Instructor': course.instructor.email,
        'Categoría': course.category || 'Sin categoría',
        'Precio': course.price,
        'Publicado': course.isPublished ? 'Sí' : 'No',
        'Inscripciones': course._count.enrollments,
        'Reseñas': course._count.reviews,
        'Fecha Creación': new Date(course.createdAt).toLocaleDateString()
      }))
    } else if (type === 'enrollments') {
      formattedData = data.map((enrollment: any) => ({
        'ID': enrollment.id,
        'Estudiante': enrollment.student.name,
        'Email': enrollment.student.email,
        'Curso': enrollment.course.title,
        'Instructor': enrollment.course.instructor.name,
        'Precio': enrollment.course.price,
        'Fecha Inscripción': new Date(enrollment.enrolledAt).toLocaleDateString()
      }))
    } else if (type === 'reviews') {
      formattedData = data.map((review: any) => ({
        'ID': review.id,
        'Usuario': review.user.name,
        'Email': review.user.email,
        'Curso': review.course.title,
        'Instructor': review.course.instructor.name,
        'Calificación': review.rating,
        'Comentario': review.comment,
        'Fecha': new Date(review.createdAt).toLocaleDateString()
      }))
    }

    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos')

    // Generar archivo Excel
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Log de la acción
    await db.activityLog.create({
      data: {
        userId: session.user.id,
        action: "REPORT_EXPORTED",
        details: `Reporte exportado: ${type} (${period})`,
        metadata: {
          adminId: session.user.id,
          reportType: type,
          period: period,
          recordCount: data.length,
          timestamp: new Date().toISOString()
        }
      }
    })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error exporting report:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
