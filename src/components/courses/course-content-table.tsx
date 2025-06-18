"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Lock
} from "lucide-react"
import { useState } from "react"

interface Module {
  id: string
  title: string
  description?: string | null
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: "TEXT" | "VIDEO" | "PDF" | "QUIZ"
  order: number
}

interface CourseContentTableProps {
  modules: Module[]
  isEnrolled: boolean
  completedLessons?: string[]
  currentLesson?: string
  onLessonClick?: (lessonId: string, moduleId: string) => void
}

const lessonTypeIcons = {
  TEXT: FileText,
  VIDEO: Play,
  PDF: FileText,
  QUIZ: HelpCircle
}

const lessonTypeColors = {
  TEXT: "bg-blue-100 text-blue-800",
  VIDEO: "bg-red-100 text-red-800",
  PDF: "bg-green-100 text-green-800",
  QUIZ: "bg-purple-100 text-purple-800"
}

const lessonTypeLabels = {
  TEXT: "Texto",
  VIDEO: "Video", 
  PDF: "PDF",
  QUIZ: "Quiz"
}

export function CourseContentTable({ 
  modules, 
  isEnrolled, 
  completedLessons = [],
  currentLesson,
  onLessonClick 
}: CourseContentTableProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>(
    modules.length > 0 ? [modules[0].id] : []
  )

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)
  const completedCount = completedLessons.length
  const progressPercentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  return (
    <Card id="course-content">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Contenido del curso</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {modules.length} módulos • {totalLessons} lecciones
          </Badge>
        </div>
        
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Progreso general</span>
              <span>{completedCount}/{totalLessons}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {modules
            .sort((a, b) => a.order - b.order)
            .map((module, moduleIndex) => {
              const isExpanded = expandedModules.includes(module.id)
              const moduleCompletedLessons = module.lessons.filter(lesson => 
                completedLessons.includes(lesson.id)
              ).length
              const moduleProgress = module.lessons.length > 0 
                ? (moduleCompletedLessons / module.lessons.length) * 100 
                : 0

              return (
                <div key={module.id} className="border-b border-gray-100 last:border-b-0">
                  {/* Module Header */}
                  <Button
                    variant="ghost"
                    onClick={() => toggleModule(module.id)}
                    className="w-full justify-start p-4 h-auto text-left hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900 truncate">
                              {moduleIndex + 1}. {module.title}
                            </p>
                            <div className="flex items-center space-x-3 mt-1">
                              <span className="text-xs text-gray-500">
                                {module.lessons.length} lecciones
                              </span>
                              {isEnrolled && (
                                <span className="text-xs text-gray-500">
                                  {moduleCompletedLessons}/{module.lessons.length} completadas
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {isEnrolled && (
                            <div className="flex-shrink-0 ml-2">
                              {moduleProgress === 100 ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full border-2 border-gray-200">
                                    <div 
                                      className="absolute inset-0 rounded-full border-2 border-green-600 transition-all duration-300"
                                      style={{
                                        clipPath: `inset(0 ${100 - moduleProgress}% 0 0)`
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Button>

                  {/* Module Lessons */}
                  {isExpanded && (
                    <div className="pb-2">
                      {module.lessons
                        .sort((a, b) => a.order - b.order)
                        .map((lesson, lessonIndex) => {
                          const isCompleted = completedLessons.includes(lesson.id)
                          const isCurrent = currentLesson === lesson.id
                          const IconComponent = lessonTypeIcons[lesson.type]

                          return (
                            <div 
                              key={lesson.id} 
                              className={`mx-4 mb-1 rounded-lg border transition-all duration-200 ${
                                isCurrent 
                                  ? "border-blue-500 bg-blue-50" 
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <Button
                                variant="ghost"
                                onClick={() => onLessonClick?.(lesson.id, module.id)}
                                disabled={!isEnrolled}
                                className={`w-full justify-start p-3 h-auto text-left ${
                                  isCurrent 
                                    ? "hover:bg-blue-100" 
                                    : "hover:bg-gray-50"
                                } ${!isEnrolled ? "cursor-default" : ""}`}
                              >
                                <div className="flex items-center space-x-3 w-full">
                                  <div className="flex-shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    ) : !isEnrolled ? (
                                      <Lock className="h-4 w-4 text-gray-400" />
                                    ) : (
                                      <IconComponent className="h-4 w-4 text-gray-500" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${
                                      isCurrent 
                                        ? "font-medium text-blue-900" 
                                        : isCompleted 
                                          ? "text-gray-700"
                                          : "text-gray-900"
                                    }`}>
                                      {lessonIndex + 1}. {lesson.title}
                                    </p>
                                    
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge 
                                        variant="secondary" 
                                        className={`text-xs ${lessonTypeColors[lesson.type]}`}
                                      >
                                        {lessonTypeLabels[lesson.type]}
                                      </Badge>
                                      
                                      <div className="flex items-center text-xs text-gray-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {lesson.type === "VIDEO" ? "15 min" : "5 min"}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )
            })}
        </div>

        {!isEnrolled && (
          <div className="p-4 bg-gray-50 text-center">
            <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Inscríbete en el curso para acceder a todo el contenido
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
