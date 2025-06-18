'use client'

import { Button } from '@/components/ui/button'
import { Trophy, Star, Download, Share2, ArrowRight, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CourseCompletionSummaryProps {
  course: {
    id: string
    title: string
    instructor: {
      name: string
      avatar: string | null
    }
  }
  stats: {
    totalLessons: number
    completedLessons: number
    timeSpent?: string
    completionDate: Date
  }
  onGoToCertificate: () => void
  onWriteReview?: () => void
  onShareCompletion?: () => void
}

export function CourseCompletionSummary({
  course,
  stats,
  onGoToCertificate,
  onWriteReview,
  onShareCompletion
}: CourseCompletionSummaryProps) {
  const router = useRouter()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-white text-center">
        <div className="mb-4">
          <Trophy className="h-16 w-16 mx-auto text-yellow-300" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          ¡Felicitaciones! 🎉
        </h1>
        <p className="text-green-100 text-lg">
          Has completado exitosamente el curso
        </p>
      </div>

      {/* Course Info */}
      <div className="px-6 py-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {course.title}
          </h2>
          <p className="text-gray-600">
            Instructor: {course.instructor.name}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">
              {stats.completedLessons}
            </div>
            <div className="text-sm text-gray-600">
              Lecciones completadas
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              100%
            </div>
            <div className="text-sm text-gray-600">
              Progreso
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.timeSpent || '---'}
            </div>
            <div className="text-sm text-gray-600">
              Tiempo dedicado
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">
              {formatDate(stats.completionDate).split(' ')[0]}
            </div>
            <div className="text-sm text-gray-600">
              Fecha de finalización
            </div>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Logros obtenidos
          </h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <CheckCircle className="h-4 w-4" />
              Curso completado
            </div>
            <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              <Trophy className="h-4 w-4" />
              Certificado obtenido
            </div>
            {stats.completedLessons >= 10 && (
              <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <Star className="h-4 w-4" />
                Dedicación excepcional
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onGoToCertificate}
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            size="lg"
          >
            <Download className="h-5 w-5 mr-2" />
            Descargar certificado
          </Button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {onWriteReview && (
              <Button
                onClick={onWriteReview}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                <Star className="h-4 w-4 mr-2" />
                Escribir reseña
              </Button>
            )}
            
            {onShareCompletion && (
              <Button
                onClick={onShareCompletion}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartir logro
              </Button>
            )}
          </div>

          <Button
            onClick={() => router.push('/dashboard/student')}
            variant="ghost"
            className="w-full"
          >
            Ir al dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">
            ¿Qué sigue ahora?
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Descarga tu certificado para agregarlo a tu perfil profesional</li>
            <li>• Comparte tu experiencia escribiendo una reseña</li>
            <li>• Explora más cursos para continuar aprendiendo</li>
            <li>• Aplica lo aprendido en proyectos reales</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
