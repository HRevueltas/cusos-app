"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  FileText,
  Video,
  Download,
  HelpCircle,
  ExternalLink
} from "lucide-react"

interface LessonPreviewProps {
  course: {
    id: string
    title: string
  }
  module: {
    id: string
    title: string
  }
  lesson: {
    id: string
    title: string
    content: string
    type: string
    videoUrl?: string | null
    fileUrl?: string | null
    order: number
    questions?: Array<{
      id: string
      question: string
      order: number
      options: Array<{
        id: string
        text: string
        isCorrect: boolean
        order: number
      }>
    }>
  }
}

const lessonTypeIcons = {
  VIDEO: Video,
  TEXT: FileText,
  PDF: Download,
  QUIZ: HelpCircle
}

const lessonTypeLabels = {
  VIDEO: "Video",
  TEXT: "Texto",
  PDF: "PDF",
  QUIZ: "Quiz"
}

// Función para convertir URLs de YouTube a formato embebido
const getYouTubeEmbedUrl = (url: string): string => {
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  const match = url.match(youtubeRegex)
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }
  return url
}

// Función para convertir URLs de Vimeo a formato embebido
const getVimeoEmbedUrl = (url: string): string => {
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/
  const match = url.match(vimeoRegex)
  if (match) {
    return `https://player.vimeo.com/video/${match[1]}`
  }
  return url
}

// Función para detectar el tipo de video y obtener la URL embebida
const getEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return getYouTubeEmbedUrl(url)
  } else if (url.includes('vimeo.com')) {
    return getVimeoEmbedUrl(url)
  }  // Para otros proveedores o videos directos, intentar usar la URL tal como está
  return url
}

const lessonTypeColors = {
  VIDEO: "bg-red-100 text-red-800",
  TEXT: "bg-blue-100 text-blue-800", 
  PDF: "bg-green-100 text-green-800",
  QUIZ: "bg-purple-100 text-purple-800"
}

export function LessonPreview({ course, module, lesson }: LessonPreviewProps) {
  const IconComponent = lessonTypeIcons[lesson.type as keyof typeof lessonTypeIcons] || FileText

  const renderLessonContent = () => {
    switch (lesson.type) {      case "VIDEO":
        return (
          <div className="space-y-4">
            {lesson.videoUrl && (
              <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={getEmbedUrl(lesson.videoUrl)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={lesson.title}
                />
              </div>
            )}
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )

      case "PDF":
        return (
          <div className="space-y-4">
            {lesson.fileUrl && (
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <Download className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-700 mb-4">Archivo PDF</p>
                <a 
                  href={lesson.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  Descargar PDF <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )

      case "QUIZ":
        return (
          <div className="space-y-6">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
            
            {lesson.questions && lesson.questions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Preguntas del Quiz</h3>
                {lesson.questions.map((question, index) => (
                  <Card key={question.id} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">
                        {index + 1}. {question.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {question.options.map((option) => (
                          <div 
                            key={option.id}
                            className={`p-3 rounded-lg border ${
                              option.isCorrect 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded-full border-2 ${
                                option.isCorrect 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-gray-300'
                              }`}>
                                {option.isCorrect && (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                              <span className={option.isCorrect ? 'font-medium' : ''}>
                                {option.text}
                              </span>
                              {option.isCorrect && (
                                <Badge variant="outline" className="text-green-700 border-green-300">
                                  Correcta
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      default:
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Módulo
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <IconComponent className="h-6 w-6" />
            {lesson.title}
          </h1>
          <p className="text-gray-600">
            {course.title} / {module.title}
          </p>
        </div>
      </div>

      {/* Lesson Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Vista Previa de la Lección</CardTitle>
              <Badge className={lessonTypeColors[lesson.type as keyof typeof lessonTypeColors]}>
                {lessonTypeLabels[lesson.type as keyof typeof lessonTypeLabels] || lesson.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Lección {lesson.order}</Badge>
              <Link href={`/dashboard/instructor/courses/${course.id}/modules/${module.id}/lessons/${lesson.id}/edit`}>
                <Button size="sm" variant="outline">
                  Editar Lección
                </Button>
              </Link>
            </div>
          </div>
          <CardDescription>
            Así es como se verá esta lección para los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderLessonContent()}
        </CardContent>
      </Card>
    </div>
  )
}
