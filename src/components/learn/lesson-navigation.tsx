'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, CheckCircle, PlayCircle } from 'lucide-react'

interface LessonNavigationProps {
  previousLesson?: {
    id: string
    title: string
    moduleTitle: string
  } | null
  nextLesson?: {
    id: string
    title: string
    moduleTitle: string
  } | null
  onPreviousClick: () => void
  onNextClick: () => void
  isCurrentLessonCompleted: boolean
  onMarkComplete: () => void
  lessonPosition: {
    current: number
    total: number
    percentage: number
  }
  currentLessonType?: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'
}

export function LessonNavigation({
  previousLesson,
  nextLesson,
  onPreviousClick,
  onNextClick,
  isCurrentLessonCompleted,
  onMarkComplete,
  lessonPosition,
  currentLessonType
}: LessonNavigationProps) {
  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
            <span>Lección {lessonPosition.current} de {lessonPosition.total}</span>
            <span>{Math.round(lessonPosition.percentage)}% del curso</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${lessonPosition.percentage}%` }}
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          {/* Previous Lesson */}
          <div className="flex-1">
            {previousLesson ? (
              <Button
                variant="outline"
                onClick={onPreviousClick}
                className="h-auto p-3 text-left justify-start max-w-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-gray-500 mb-1">Anterior</div>
                  <div className="font-medium truncate">{previousLesson.title}</div>
                  <div className="text-xs text-gray-500 truncate">{previousLesson.moduleTitle}</div>
                </div>
              </Button>
            ) : (
              <div /> // Spacer
            )}
          </div>

          {/* Mark Complete / Completed */}
          <div className="mx-4">
            {isCurrentLessonCompleted ? (
              <div className="flex items-center gap-2 text-green-600 px-4 py-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Completado</span>
              </div>
            ) : currentLessonType === 'QUIZ' ? (
              <div className="flex items-center gap-2 text-purple-600 px-4 py-2 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium">Completa el quiz para continuar</span>
              </div>
            ) : (
              <Button
                onClick={onMarkComplete}
                className="bg-green-600 hover:bg-green-700 px-6"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar completado
              </Button>
            )}
          </div>

          {/* Next Lesson */}
          <div className="flex-1 flex justify-end">
            {nextLesson ? (
              <Button
                variant={isCurrentLessonCompleted ? "default" : "outline"}
                onClick={onNextClick}
                className={`h-auto p-3 text-right justify-end max-w-xs ${
                  isCurrentLessonCompleted 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : ""
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs opacity-70 mb-1">Siguiente</div>
                  <div className="font-medium truncate">{nextLesson.title}</div>
                  <div className="text-xs opacity-70 truncate">{nextLesson.moduleTitle}</div>
                </div>
                <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 px-4 py-2">
                <span className="text-sm">¡Último tema!</span>
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        {/* Auto-advance notification */}
        {isCurrentLessonCompleted && nextLesson && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-800">
                <PlayCircle className="h-4 w-4" />
                <span className="text-sm">
                  ¡Lección completada! Continúa con <strong>{nextLesson.title}</strong>
                </span>
              </div>
              <Button
                size="sm"
                onClick={onNextClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
