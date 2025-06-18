import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateCertificatePDF } from '@/lib/pdf-generator'

export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const courseId = params.courseId

    // Verificar que el usuario está inscrito en el curso
    const enrollment = await db.enrollment.findFirst({
      where: {
        courseId: courseId,
        studentId: session.user.id
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            },
            instructor: {
              select: {
                name: true
              }
            }
          }
        },
        progress: {
          where: {
            completed: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 404 }
      )
    }

    // Verificar que el curso está 100% completado
    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    )
    const completedLessons = enrollment.progress.length

    if (completedLessons < totalLessons) {
      return NextResponse.json(
        { 
          error: 'Debes completar todas las lecciones para obtener el certificado',
          progress: {
            completed: completedLessons,
            total: totalLessons,
            percentage: Math.round((completedLessons / totalLessons) * 100)
          }
        },
        { status: 400 }
      )    }

    // Encontrar la fecha de finalización (última lección completada)
    const lastCompletedProgress = enrollment.progress
      .filter(p => p.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]

    const completionDate = lastCompletedProgress?.completedAt || new Date()

    // Generar el PDF del certificado usando nuestra utilidad
    const pdfBlob = await generateCertificatePDF({
      studentName: session.user.name || 'Estudiante',
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor.name,
      completionDate,
      certificateId: courseId.slice(0, 8).toUpperCase()
    })

    // Convertir blob a buffer para NextJS
    const arrayBuffer = await pdfBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificado-${enrollment.course.title.replace(/\s+/g, '-')}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating certificate:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const courseId = params.courseId

    // Obtener información del certificado para este curso
    const enrollment = await db.enrollment.findFirst({
      where: {
        courseId: courseId,
        studentId: session.user.id
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            },
            instructor: {
              select: {
                name: true
              }
            }
          }
        },
        progress: {
          where: {
            completed: true
          }
        }
      }
    })

    if (!enrollment) {
      return NextResponse.json(
        { error: 'No estás inscrito en este curso' },
        { status: 404 }
      )
    }

    const totalLessons = enrollment.course.modules.reduce(
      (total, module) => total + module.lessons.length, 
      0
    )
    const completedLessons = enrollment.progress.length
    const isCompleted = completedLessons === totalLessons

    return NextResponse.json({
      isEligible: isCompleted,
      progress: {
        completed: completedLessons,
        total: totalLessons,
        percentage: Math.round((completedLessons / totalLessons) * 100)
      },
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        instructor: enrollment.course.instructor.name
      },
      student: {
        name: session.user.name
      },
      completionDate: isCompleted ? new Date().toISOString() : null
    })

  } catch (error) {
    console.error('Error fetching certificate data:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
