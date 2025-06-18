import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function generateCertificateId(userId: string, courseId: string): string {
  const data = `${userId}-${courseId}-certificate`
  
  // Función hash simple que coincida con el frontend
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convertir a string hexadecimal y tomar los primeros 16 caracteres
  return Math.abs(hash).toString(16).padStart(8, '0').substring(0, 16)
}

// Función para verificar si un certificado es válido
function verifyCertificateId(certificateId: string, userId: string, courseId: string): boolean {
  const expectedId = generateCertificateId(userId, courseId)
  return certificateId === expectedId
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    if (!certificateId) {
      return NextResponse.json(
        { error: 'ID de certificado requerido' },
        { status: 400 }
      )
    }    // Buscar enrollment que coincida con el certificateId
    const enrollments = await db.enrollment.findMany({
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            },
            modules: {
              include: {
                lessons: {
                  select: {
                    id: true
                  }
                }
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

    // Verificar qué enrollment coincide con el certificateId
    let validEnrollment = null
    for (const enrollment of enrollments) {
      if (verifyCertificateId(certificateId, enrollment.student.id, enrollment.course.id)) {
        validEnrollment = enrollment
        break
      }
    }

    if (!validEnrollment) {
      return NextResponse.json(
        { error: 'Certificado no encontrado o inválido' },
        { status: 404 }
      )
    }

    // Calcular total de lecciones y lecciones completadas
    const totalLessons = validEnrollment.course.modules.reduce((total, module) => total + module.lessons.length, 0)
    const completedLessons = validEnrollment.progress.length
    const isCompleted = totalLessons > 0 && completedLessons === totalLessons

    if (!isCompleted) {
      return NextResponse.json(
        { error: 'Curso no completado, certificado no disponible' },
        { status: 403 }
      )
    }

    // Calcular fecha de finalización (fecha del último progreso de lección)
    const lastProgressDate = validEnrollment.progress
      .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())[0]
      ?.completedAt || validEnrollment.enrolledAt

    // Devolver datos del certificado
    const certificateData = {
      id: certificateId,
      student: {
        name: validEnrollment.student.name
      },
      course: {
        id: validEnrollment.course.id,
        title: validEnrollment.course.title,
        instructor: {
          name: validEnrollment.course.instructor?.name || 'Instructor'
        }
      },
      completionDate: lastProgressDate,
      isValid: true,
      completedLessons,
      totalLessons
    }

    return NextResponse.json(certificateData)

  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
