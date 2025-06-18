import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener inscripciones del estudiante
    const enrollments = await db.enrollment.findMany({
      where: { studentId: session.user.id },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true
              }
            },
            instructor: {
              select: { name: true }
            }
          }
        },
        progress: true
      }
    })

    const certificates = []

    for (const enrollment of enrollments) {
      const totalLessons = enrollment.course.modules.reduce((acc, module) => 
        acc + module.lessons.length, 0
      )
      const completedLessons = enrollment.progress.filter(p => p.completed).length
      
      // Solo incluir cursos completados al 100%
      if (totalLessons > 0 && completedLessons === totalLessons) {
        // Obtener la fecha de finalización (última lección completada)
        const lastCompletedProgress = enrollment.progress
          .filter(p => p.completed && p.completedAt)
          .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())[0]

        const completedAt = lastCompletedProgress?.completedAt || new Date()

        // Generar habilidades basadas en el curso (simulado)
        const skills = generateSkillsForCourse(enrollment.course.title, enrollment.course.level)

        certificates.push({
          id: `cert-${enrollment.id}`,
          courseId: enrollment.course.id,
          courseTitle: enrollment.course.title,
          courseLevel: enrollment.course.level,
          instructorName: enrollment.course.instructor.name,
          completedAt,
          certificateUrl: null, // TODO: Implementar generación de PDF
          skills
        })
      }
    }

    // Ordenar por fecha de finalización más reciente
    certificates.sort((a, b) => 
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )

    return NextResponse.json({
      certificates
    })

  } catch (error) {
    console.error("Error obteniendo certificados:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función helper para generar habilidades basadas en el curso
function generateSkillsForCourse(courseTitle: string, level: string): string[] {
  const baseSkills: { [key: string]: string[] } = {
    'javascript': ['JavaScript', 'ES6+', 'DOM Manipulation', 'Async Programming'],
    'react': ['React', 'JSX', 'Components', 'State Management', 'Hooks'],
    'python': ['Python', 'Data Structures', 'Object-Oriented Programming'],
    'web': ['HTML', 'CSS', 'Responsive Design', 'Web Development'],
    'database': ['SQL', 'Database Design', 'Query Optimization'],
    'api': ['REST APIs', 'HTTP Methods', 'API Integration'],
    'design': ['UI/UX Design', 'Design Principles', 'User Experience']
  }

  const title = courseTitle.toLowerCase()
  let skills: string[] = []

  // Detectar habilidades basadas en el título del curso
  Object.entries(baseSkills).forEach(([key, skillList]) => {
    if (title.includes(key)) {
      skills = [...skills, ...skillList]
    }
  })

  // Si no se detectaron habilidades específicas, usar habilidades generales
  if (skills.length === 0) {
    skills = ['Problem Solving', 'Critical Thinking', 'Self-Learning']
  }

  // Agregar habilidades basadas en el nivel
  switch (level) {
    case 'BEGINNER':
      skills.push('Fundamentals')
      break
    case 'INTERMEDIATE':
      skills.push('Intermediate Concepts', 'Practical Application')
      break
    case 'ADVANCED':
      skills.push('Advanced Techniques', 'Expert Level', 'Leadership')
      break
  }

  // Remover duplicados y limitar a 6 habilidades
  return [...new Set(skills)].slice(0, 6)
}
