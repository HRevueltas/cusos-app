'use client'

// import { Button } from '@/components/ui/button'
import { CheckCircle,  } from 'lucide-react'

interface ProgressTrackerProps {
  courseProgress: number
  lessonCompleted: boolean
  onMarkComplete: () => void
}

export function ProgressTracker({
  courseProgress,
  lessonCompleted,
//   onMarkComplete
}: ProgressTrackerProps) {
  
//   const isNearCompletion = courseProgress >= 90
//   const progressColor = courseProgress >= 75 ? 'bg-green-500' : courseProgress >= 50 ? 'bg-yellow-500' : 'bg-blue-500'
  
  return (
    <div className="flex items-center gap-4">
      {/* Progress Circle */}
      <div className="flex items-center gap-3">
        <div className="relative w-12 h-12">
          {/* Background Circle */}
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
              strokeDasharray="100, 100"
              strokeWidth="3"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Progress Circle */}
            <path
              className={`transition-all duration-500 ${
                courseProgress >= 75 ? 'text-green-500' : 
                courseProgress >= 50 ? 'text-yellow-500' : 'text-blue-500'
              }`}
              strokeDasharray={`${courseProgress}, 100`}
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              stroke="currentColor"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          
          {/* Progress Text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-gray-700">
              {Math.round(courseProgress)}%
            </span>
          </div>
        </div>

        <div className="hidden sm:block text-sm">
          <div className="font-medium text-gray-900">
            Progreso del curso
          </div>
          <div className="text-gray-600">
            {Math.round(courseProgress)}% completado
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      {/* {isNearCompletion && (
        <div className="hidden md:flex items-center gap-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
          <Trophy className="h-4 w-4" />
          ¡Casi terminas!
        </div>
      )} */}

      {/* Mark Complete Button */}
      {/* {!lessonCompleted && (
        <Button
          onClick={onMarkComplete}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Marcar completado</span>
          <span className="sm:hidden">Completar</span>
        </Button>
      )} */}

      {/* Completed Badge */}
      {lessonCompleted && (
        <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Lección completada</span>
          <span className="sm:hidden">Completado</span>
        </div>
      )}
    </div>
  )
}
