'use client'

import { Button } from '@/components/ui/button'
import { CheckCircle, FileText, Download, ExternalLink } from 'lucide-react'
import { QuizPlayer } from './quiz-player'

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    content: string
    type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'
    fileUrl: string | null
    questions?: {
      id: string
      question: string
      order: number
      options: {
        id: string
        text: string
        isCorrect: boolean
        order: number
      }[]
    }[]
  }
  enrollmentId?: string
  userAnswers?: {
    questionId: string
    optionId: string
    answeredAt: Date
  }[]
  onComplete: () => void
  isCompleted: boolean
}

export function LessonContent({ 
  lesson, 
  enrollmentId,
  userAnswers = [],
  onComplete, 
  isCompleted 
}: LessonContentProps) {
  
  const renderContent = () => {
    switch (lesson.type) {
      case 'PDF':
        return (
          <div className="space-y-6">
            {/* PDF Viewer */}
            {lesson.fileUrl && (
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Documento PDF
                </h3>
                <p className="text-gray-600 mb-4">
                  Haz clic para ver o descargar el documento
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => window.open(lesson.fileUrl!, '_blank')}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = lesson.fileUrl!
                      link.download = `${lesson.title}.pdf`
                      link.click()
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Descargar
                  </Button>
                </div>
              </div>
            )}
              {/* Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )

      case 'QUIZ':
        // Si es un quiz, usar el QuizPlayer
        if (lesson.questions && enrollmentId) {
          return (
            <QuizPlayer
              lessonId={lesson.id}
              title={lesson.title}
              questions={lesson.questions}
              enrollmentId={enrollmentId}
              userAnswers={userAnswers}
              onComplete={onComplete}
              isCompleted={isCompleted}
            />
          )
        }
        
        // Fallback si no hay preguntas o enrollmentId
        return (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-purple-900 mb-2">
                📝 Quiz de la lección
              </h3>
              <p className="text-purple-700">
                Esta funcionalidad estará disponible próximamente.
              </p>
            </div>
            
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )

      default: // TEXT
        return (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        )
    }  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {lesson.title}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                lesson.type === 'VIDEO' 
                  ? 'bg-red-100 text-red-700'
                  : lesson.type === 'PDF'
                  ? 'bg-orange-100 text-orange-700'
                  : lesson.type === 'QUIZ'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {lesson.type === 'VIDEO' ? 'Video' :
                 lesson.type === 'PDF' ? 'PDF' :
                 lesson.type === 'QUIZ' ? 'Quiz' : 'Texto'}
              </span>
              
              {isCompleted && (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Completado
                </span>
              )}
            </div>
          </div>          {!isCompleted && lesson.type !== 'QUIZ' && (
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como completado
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {renderContent()}
      </div>

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t">
        <div className="flex items-center justify-between">          <div className="text-sm text-gray-600">
            {isCompleted ? (
              <span className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Has completado esta lección
              </span>
            ) : lesson.type === 'QUIZ' ? (
              <span>
                Completa el quiz para marcar esta lección como completada
              </span>
            ) : (
              <span>
                Marca esta lección como completada cuando hayas terminado
              </span>
            )}
          </div>

          {!isCompleted && lesson.type !== 'QUIZ' && (
            <Button
              onClick={onComplete}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar lección
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
