"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  BookOpen,
  Award,
  ChevronRight
} from "lucide-react"

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: "TEXT" | "VIDEO" | "PDF" | "QUIZ"
}

interface CourseProgressProps {
  modules: Module[]
  isEnrolled: boolean
  completedLessons?: string[]
  currentLesson?: string
  estimatedDuration?: number
  onStartCourse?: () => void
  onContinueCourse?: () => void
}

export function CourseProgress({ 
  modules, 
  isEnrolled, 
  completedLessons = [],
  currentLesson,
  estimatedDuration = 0,
  onStartCourse,
  onContinueCourse
}: CourseProgressProps) {
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)
  const completedCount = completedLessons.length
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (!isEnrolled) {
    return (
      <Card className="sticky top-4">
        <div className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Comienza tu aprendizaje
              </h3>
              <p className="text-sm text-gray-600">
                Inscríbete en este curso para acceder a todo el contenido y realizar un seguimiento de tu progreso.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Total de lecciones:</span>
                <span className="font-medium">{totalLessons}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Módulos:</span>
                <span className="font-medium">{modules.length}</span>
              </div>
              
              {estimatedDuration > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duración estimada:</span>
                  <span className="font-medium">{formatDuration(estimatedDuration)}</span>
                </div>
              )}
            </div>

            <Button 
              onClick={onStartCourse}
              className="w-full"
              size="lg"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              Inscribirse y comenzar
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="sticky top-4">
      <div className="p-6">
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              {progressPercentage === 100 ? (
                <Award className="w-8 h-8 text-green-600" />
              ) : (
                <BookOpen className="w-8 h-8 text-green-600" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {progressPercentage === 100 ? "¡Curso completado!" : "Tu progreso"}
            </h3>
            
            <p className="text-sm text-gray-600">
              {completedCount} de {totalLessons} lecciones completadas
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{Math.round(progressPercentage)}% completado</span>
              <span>{totalLessons - completedCount} restantes</span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Lecciones completadas:</span>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-medium">{completedCount}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tiempo estimado restante:</span>
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-gray-500 mr-1" />
                <span className="font-medium">
                  {formatDuration(Math.max(0, estimatedDuration - (completedCount * 15)))}
                </span>
              </div>
            </div>
          </div>

          {/* Current Status */}
          {currentLesson && progressPercentage < 100 && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                    Continuar aprendiendo
                  </p>
                  <p className="text-sm text-blue-900 font-medium mt-1">
                    Lección actual
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  En progreso
                </Badge>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={progressPercentage === 100 ? undefined : onContinueCourse}
            className="w-full"
            size="lg"
            variant={progressPercentage === 100 ? "outline" : "default"}
          >
            {progressPercentage === 100 ? (
              <>
                <Award className="w-4 h-4 mr-2" />
                Repasar curso
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 mr-2" />
                {completedCount === 0 ? "Comenzar curso" : "Continuar aprendiendo"}
              </>
            )}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>

          {progressPercentage === 100 && (
            <p className="text-xs text-center text-gray-500 mt-2">
              ¡Felicidades! Has completado todo el contenido del curso.
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
