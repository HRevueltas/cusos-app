"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ChevronDown, 
  ChevronRight, 
  Play, 
  FileText, 
  HelpCircle,
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

interface CourseContentProps {
  modules: Module[]
  isEnrolled: boolean
}

const lessonTypeIcons = {
  TEXT: FileText,
  VIDEO: Play,
  PDF: FileText,
  QUIZ: HelpCircle
}

const lessonTypeLabels = {
  TEXT: "Texto",
  VIDEO: "Video",
  PDF: "PDF",
  QUIZ: "Quiz"
}

const lessonTypeColors = {
  TEXT: "bg-blue-100 text-blue-800",
  VIDEO: "bg-red-100 text-red-800",
  PDF: "bg-green-100 text-green-800",
  QUIZ: "bg-purple-100 text-purple-800"
}

export function CourseContent({ modules, isEnrolled }: CourseContentProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const totalLessons = modules.reduce((acc, module) => acc + module.lessons.length, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contenido del Curso</CardTitle>
        <p className="text-sm text-gray-600">
          {modules.length} módulos • {totalLessons} lecciones
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id)
            const Icon = lessonTypeIcons
            
            return (
              <div key={module.id} className="border rounded-lg overflow-hidden">
                {/* Module header */}
                <Button
                  variant="ghost"
                  className="w-full p-4 h-auto justify-between hover:bg-gray-50"
                  onClick={() => toggleModule(module.id)}
                >
                  <div className="flex items-start gap-3 text-left">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-800 mt-0.5">
                      {moduleIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        {module.lessons.length} lecciones
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </Button>

                {/* Module content */}
                {isExpanded && (
                  <div className="border-t bg-gray-50">
                    <div className="divide-y divide-gray-200">
                      {module.lessons.map((lesson, lessonIndex) => {
                        const LessonIcon = lessonTypeIcons[lesson.type]
                        
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white transition-colors"
                          >
                            <div className="flex-shrink-0">
                              <LessonIcon className="w-4 h-4 text-gray-500" />
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {lessonIndex + 1}. {lesson.title}
                              </h4>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${lessonTypeColors[lesson.type]}`}
                              >
                                {lessonTypeLabels[lesson.type]}
                              </Badge>
                              
                              {!isEnrolled && (
                                <Lock className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {modules.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Contenido próximamente
            </h3>
            <p className="text-gray-600">
              El instructor está preparando el contenido de este curso.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
