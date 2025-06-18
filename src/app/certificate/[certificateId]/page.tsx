'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CertificateGenerator } from '@/components/learn/certificate-generator'
import { Button } from '@/components/ui/button'
import { Trophy, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react'

interface PublicCertificatePageProps {
  params: Promise<{
    certificateId: string
  }>
}

interface CertificateData {
  id: string
  student: {
    name: string
  }
  course: {
    id: string
    title: string
    instructor: {
      name: string
    }
  }
  completionDate: string
  isValid: boolean
  completedLessons: number
  totalLessons: number
}

export default function PublicCertificatePage({ params }: PublicCertificatePageProps) {
  const router = useRouter()
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificateId, setCertificateId] = useState<string>('')

  useEffect(() => {
    params.then(({ certificateId }) => {
      setCertificateId(certificateId)
      fetchCertificateData(certificateId)
    })
  }, [params])

  const fetchCertificateData = async (id: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/public/certificate/${id}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Certificado no encontrado o inválido')
        } else if (response.status === 403) {
          throw new Error('Curso no completado, certificado no disponible')
        } else {
          throw new Error('Error al cargar el certificado')
        }
      }

      const data = await response.json()
      setCertificateData(data)
    } catch (error) {
      console.error('Error fetching certificate:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando certificado...</p>
        </div>
      </div>
    )
  }

  if (error || !certificateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Certificado no válido</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Este certificado no existe o no es válido.'}
          </p>
          <div className="space-y-3">
            <Button onClick={() => window.location.reload()} className="w-full">
              Intentar de nuevo
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header público */}
        <div className="no-print mb-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-indigo-100 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Certificado Verificado
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Este es un certificado oficial que verifica la finalización exitosa del curso. 
              Puedes verificar su autenticidad con el ID: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{certificateId}</code>
            </p>
          </div>

          {/* Información de verificación */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 max-w-xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium text-green-800">Certificado Verificado</span>
            </div>
            <p className="text-sm text-green-700">
              El estudiante completó {certificateData.completedLessons} de {certificateData.totalLessons} lecciones
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button onClick={() => router.push('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Explorar cursos
            </Button>
            <Button onClick={() => window.open('/', '_blank')} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              Visitar plataforma
            </Button>
          </div>
        </div>        {/* Certificado */}
        <CertificateGenerator
          course={{
            id: certificateData.course.id,
            title: certificateData.course.title,
            instructor: {
              name: certificateData.course.instructor.name
            }
          }}
          student={{
            name: certificateData.student.name,
            userId: '' // En vista pública no tenemos userId
          }}
          completionDate={new Date(certificateData.completionDate)}
        />

        {/* Footer informativo */}
        <div className="no-print mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">Acerca de este certificado</h3>
            <p className="text-sm text-blue-800 mb-4">
              Este certificado es emitido automáticamente al completar todos los módulos y lecciones del curso. 
              La autenticidad puede ser verificada usando el ID único del certificado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-blue-700">
              <div>
                <strong>Verificación:</strong> Automática
              </div>
              <div>
                <strong>Validez:</strong> Permanente
              </div>
              <div>
                <strong>ID:</strong> {certificateId.substring(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
