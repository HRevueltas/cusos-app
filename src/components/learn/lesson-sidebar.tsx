'use client'

import { CheckCircle, PlayCircle, FileText, Video, FileIcon, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LessonSidebarProps {
  course: {
    id: string
    title: string
    modules: Array<{
      id: string
      title: string
      order: number
      lessons: Array<{
        id: string
        title: string
        type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'
        order: number
      }>
    }>
    instructor: {
      name: string
      avatar: string | null
    }
  }
  currentLessonId: string
  progress: Array<{
    lessonId: string
    completed: boolean
  }>
  onLessonSelect: (lessonId: string) => void
}

export function LessonSidebar({
  course,
  currentLessonId,
  progress,
  onLessonSelect
}: LessonSidebarProps) {
  
  const isLessonCompleted = (lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.completed)
  }

  const getLessonIcon = (type: string, isCompleted: boolean, isCurrent: boolean) => {
    const iconClass = cn(
      "h-4 w-4",
      isCompleted ? "text-green-600" : isCurrent ? "text-blue-600" : "text-gray-400"
    )

    switch (type) {
      case 'VIDEO':
        return <Video className={iconClass} />
      case 'PDF':
        return <FileIcon className={iconClass} />
      case 'QUIZ':
        return <Brain className={iconClass} />
      default:
        return <FileText className={iconClass} />
    }
  }

  // Calcular progreso total
  const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0)
  const completedLessons = progress.filter(p => p.completed).length
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header del curso */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {course.title}
        </h2>
        <div className="text-sm text-gray-600 mb-3">
          Por {course.instructor.name}
        </div>
        
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Progreso del curso</span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {completedLessons} de {totalLessons} lecciones completadas
          </div>
        </div>
      </div>

      {/* Lista de módulos y lecciones */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="pb-4">
          {course.modules.map((module) => (
            <div key={module.id} className="border-b border-gray-100 last:border-b-0">              {/* Título del módulo */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 sticky top-0 z-10 shadow-sm">
                <h3 className="font-medium text-gray-900 text-sm">
                  {module.title}
                </h3>
                <div className="text-xs text-gray-500 mt-1">
                  {module.lessons.filter(lesson => 
                    isLessonCompleted(lesson.id)
                  ).length} de {module.lessons.length} lecciones
                </div>
              </div>

              {/* Lista de lecciones */}
              <div className="space-y-0">
                {module.lessons.map((lesson) => {
                  const isCompleted = isLessonCompleted(lesson.id)
                  const isCurrent = lesson.id === currentLessonId
                  
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => onLessonSelect(lesson.id)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-gray-50 transition-colors border-l-4",
                        isCurrent 
                          ? "bg-blue-50 border-l-blue-600" 
                          : isCompleted
                          ? "border-l-green-600"
                          : "border-l-transparent"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            getLessonIcon(lesson.type, isCompleted, isCurrent)
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium line-clamp-2",
                            isCurrent 
                              ? "text-blue-900" 
                              : isCompleted 
                              ? "text-gray-900"
                              : "text-gray-700"
                          )}>
                            {lesson.title}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              lesson.type === 'VIDEO' 
                                ? "bg-red-100 text-red-700"
                                : lesson.type === 'PDF'
                                ? "bg-orange-100 text-orange-700"
                                : lesson.type === 'QUIZ'
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-100 text-gray-700"
                            )}>
                              {lesson.type === 'VIDEO' ? 'Video' :
                               lesson.type === 'PDF' ? 'PDF' :
                               lesson.type === 'QUIZ' ? 'Quiz' : 'Texto'}
                            </span>
                            
                            {isCompleted && (
                              <span className="text-xs text-green-600 font-medium">
                                Completada
                              </span>
                            )}
                            
                            {isCurrent && !isCompleted && (
                              <span className="text-xs text-blue-600 font-medium">
                                Actual
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
