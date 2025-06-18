"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Award, Download,  Calendar, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  courseLevel: string
  instructorName: string
  completedAt: string
  certificateUrl?: string
  skills: string[]
}

export default function StudentCertificatesPage() {
  const { data: session } = useSession()
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role === "STUDENT") {
      fetchCertificates()
    }
  }, [session])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/student/certificates")
      if (response.ok) {
        const data = await response.json()
        setCertificates(data.certificates || [])
      }
    } catch (error) {
      console.error("Error fetching certificates:", error)
    } finally {
      setLoading(false)
    }
  }
  const getLevelBadgeVariant = (level: string): "default" | "success" | "destructive" | "outline" | "secondary" => {
    switch (level) {
      case "BEGINNER": return "secondary"
      case "INTERMEDIATE": return "default"
      case "ADVANCED": return "destructive"
      default: return "outline"
    }
  }

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "BEGINNER": return "Principiante"
      case "INTERMEDIATE": return "Intermedio"
      case "ADVANCED": return "Avanzado"
      default: return level
    }
  }
  const handleDownload = (certificate: Certificate) => {
    // Redirigir a la página de certificado para descargar
    window.open(`/learn/${certificate.courseId}/certificate`, '_blank')
  }

  // const handleShare = async (certificate: Certificate) => {
  //   const certificateUrl = `${window.location.origin}/learn/${certificate.courseId}/certificate`
    
  //   try {
  //     if (navigator.share) {
  //       await navigator.share({
  //         title: `Certificado - ${certificate.courseTitle}`,
  //         text: `¡He completado el curso "${certificate.courseTitle}"!`,
  //         url: certificateUrl
  //       })
  //     } else {
  //       // Fallback: copiar enlace
  //       await navigator.clipboard.writeText(certificateUrl)
  //       alert('¡Enlace del certificado copiado al portapapeles!')
  //     }
  //   } catch (error) {
  //     console.error('Error sharing certificate:', error)
  //     // Fallback: abrir en nueva pestaña
  //     window.open(certificateUrl, '_blank')
  //   }
  // }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Certificados</h1>
        <p className="text-muted-foreground">
          Todos los certificados que has obtenido al completar cursos
        </p>
      </div>

      {/* Estadísticas de Certificados */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{certificates.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {certificates.filter(cert => {
                const completedDate = new Date(cert.completedAt)
                const thisMonth = new Date()
                thisMonth.setDate(1)
                return completedDate >= thisMonth
              }).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Habilidades Adquiridas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {new Set(certificates.flatMap(cert => cert.skills)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Certificados */}
      <div className="grid gap-6">
        {certificates.length > 0 ? (
          certificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{certificate.courseTitle}</h3>
                      <p className="text-muted-foreground mb-3">
                        Instructor: {certificate.instructorName}
                      </p>
                        <div className="flex items-center gap-4 mb-4">
                        <Badge variant={getLevelBadgeVariant(certificate.courseLevel)}>
                          {getLevelLabel(certificate.courseLevel)}
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Completado: {new Date(certificate.completedAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {certificate.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Habilidades adquiridas:</p>
                          <div className="flex flex-wrap gap-1">
                            {certificate.skills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <button
                      onClick={() => handleDownload(certificate)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                    
                    {/* <button
                      onClick={() => handleShare(certificate)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartir
                    </button> */}
                    
                    <Link href={`/learn/${certificate.courseId}`}>
                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Ver Curso
                      </button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No tienes certificados aún
                </h3>
                <p className="text-gray-500 mb-6">
                  Completa un curso para obtener tu primer certificado
                </p>
                <Link href="/dashboard/student/courses">
                  <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                    Ver Mis Cursos
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
