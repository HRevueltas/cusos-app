'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Trophy, Calendar, User, Award } from 'lucide-react'
import { generateCertificatePDF } from '@/lib/pdf-generator'

interface CertificateGeneratorProps {
  course: {
    id: string
    title: string
    instructor: {
      name: string
    }
  }
  student: {
    name: string
    userId?: string // Opcional para compatibilidad
  }
  completionDate: Date
}

export function CertificateGenerator({
  course,
  student,
  completionDate
}: CertificateGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
  setIsGenerating(true)
  try {
    const pdfBlob = await generateCertificatePDF({
      studentName: student.name,
      courseName: course.title,
      instructorName: course.instructor.name,
      completionDate,
      certificateId: course.id.slice(0, 8).toUpperCase()
    })

    // Crear un enlace temporal para descargar el PDF
    const url = URL.createObjectURL(pdfBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificado-${student.name}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error al generar el PDF. Por favor, intenta de nuevo.')
  } finally {
    setIsGenerating(false)
  }
}


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Certificate Preview */}
      <div 
        id="certificate-content"
        ref={certificateRef}
        className="relative bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-8 mb-6"
      >
        {/* Decorative Border */}
        <div className="absolute inset-2 border-2 border-indigo-300 rounded-lg opacity-50"></div>
        
        {/* Content */}
        <div className="relative text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
            <h1 className="text-2xl font-bold text-indigo-900">
              Certificado de Finalización
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          {/* Student Name */}
          <div className="space-y-2">
            <p className="text-lg text-gray-700">Se certifica que</p>
            <h2 className="text-3xl font-bold text-indigo-900">
              {student.name}
            </h2>
            <p className="text-lg text-gray-700">ha completado exitosamente el curso</p>
          </div>

          {/* Course Title */}
          <div className="bg-white/70 rounded-lg p-4 border border-indigo-200">
            <h3 className="text-xl font-semibold text-indigo-800">
              {course.title}
            </h3>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Completado el {formatDate(completionDate)}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <User className="h-4 w-4" />
              <span>Instructor: {course.instructor.name}</span>
            </div>
          </div>

          {/* Signature Area */}
          <div className="pt-8 border-t border-indigo-200 flex justify-between items-end">
            <div className="text-center">
              <div className="h-12 border-b-2 border-gray-400 w-32 mb-2"></div>
              <p className="text-xs text-gray-600">Firma del Instructor</p>
            </div>
            
            <div className="flex items-center gap-2 text-indigo-600">
              <Award className="h-6 w-6" />
              <div className="text-xs">
                <p className="font-bold">Certificado Verificado</p>
                <p>ID: {course.id.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions - Hidden in PDF */}
      <div className="no-print space-y-3">
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? 'Generando PDF...' : 'Descargar PDF'}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="w-full"
          >
            Imprimir Certificado
          </Button>
        </div>
      </div>

      {/* Info - Hidden in PDF */}
      <div className="no-print mt-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>📋 Información:</strong> Este certificado verifica que has completado 
          todas las lecciones del curso. Puedes descargarlo en PDF o imprimirlo para 
          tus registros profesionales.
        </p>
      </div>
    </div>
  )
}
