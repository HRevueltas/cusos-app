'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CertificateGenerator } from './certificate-generator'
import { Button } from '@/components/ui/button'
import { Trophy, Lock, CheckCircle, ArrowLeft } from 'lucide-react'

interface CertificateViewerProps {
  courseId: string
}

interface CourseData {
  id: string
  title: string
  instructor: {
    name: string
  }
  isCompleted: boolean
  completionDate?: Date
  progressPercentage: number
}

export function CertificateViewer({ courseId }: CertificateViewerProps) {
  const router = useRouter()
  
  const [courseData, setCourseData] = useState<CourseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [student, setStudent] = useState<{ name: string } | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course data
        const courseResponse = await fetch(`/api/student/progress?courseId=${courseId}`)
        if (courseResponse.ok) {
          const courseDataResponse = await courseResponse.json()
          
          if (!courseDataResponse.stats || !courseDataResponse.enrollment) {
            throw new Error('Datos de progreso no disponibles')
          }
          
          const isCompleted = courseDataResponse.stats.progressPercentage === 100
          
          setCourseData({
            id: courseDataResponse.enrollment.course.id,
            title: courseDataResponse.enrollment.course.title,
            instructor: {
              name: courseDataResponse.enrollment.course.instructor?.name || 'Instructor'
            },
            isCompleted,
            completionDate: isCompleted ? new Date() : undefined,
            progressPercentage: courseDataResponse.stats.progressPercentage
          })
        } else {
          throw new Error('Error al cargar datos del curso')
        }

        // Fetch student data
        const sessionResponse = await fetch('/api/auth/session')
        if (sessionResponse.ok) {
          const session = await sessionResponse.json()
          setStudent({ 
            name: session.user?.name || 'Estudiante'
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('No se pudo cargar la información del curso.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [courseId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del certificado...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Intentar de nuevo
            </Button>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!courseData || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar la información del curso.</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header - Hidden in PDF */}
        <div className="no-print mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => router.back()} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
                Certificado del Curso
              </h1>
              <p className="text-gray-600">{courseData.title}</p>
            </div>
          </div>

          {/* Progress Status */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Progreso del curso</p>
                <p className="text-sm text-gray-600">
                  {courseData.progressPercentage}% completado
                </p>
              </div>
              <div className="flex items-center gap-2">
                {courseData.isCompleted ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Curso completado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Lock className="h-5 w-5" />
                    <span className="font-medium">Curso en progreso</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${courseData.progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Content */}
        {courseData.isCompleted && courseData.completionDate ? (
          <CertificateGenerator
            course={courseData}
            student={student}
            completionDate={courseData.completionDate}
          />
        ) : (
          <div className="no-print bg-white rounded-lg p-8 text-center border border-gray-200">
            <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Certificado no disponible
            </h2>
            <p className="text-gray-600 mb-6">
              Para obtener tu certificado, debes completar todas las lecciones del curso.
            </p>
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                Progreso actual: {courseData.progressPercentage}% 
                ({100 - courseData.progressPercentage}% restante)
              </p>
              <Button onClick={() => router.back()} className="bg-indigo-600 hover:bg-indigo-700">
                Continuar aprendiendo
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
