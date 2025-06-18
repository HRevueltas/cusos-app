"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronDown, 
  ChevronRight, 
  BookOpen,
  User,
  Star,
  MessageSquare,
  Grid3X3,
  Eye
} from "lucide-react"

interface TableOfContentsProps {
  sections: Array<{
    id: string
    title: string
    description?: string
    icon: React.ElementType
    badge?: string
  }>
  activeSection?: string
  onSectionClick: (sectionId: string) => void
}

export function TableOfContents({ 
  sections, 
  activeSection, 
  onSectionClick 
}: TableOfContentsProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Grid3X3 className="w-5 h-5 mr-2 text-blue-600" />
            Contenido del curso
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {sections.map((section, index) => {
              const IconComponent = section.icon
              const isActive = activeSection === section.id
              
              return (
                <div key={section.id}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => onSectionClick(section.id)}
                    className={`w-full justify-start text-left h-auto p-3 ${
                      isActive 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <div className={`mt-0.5 ${isActive ? "text-blue-100" : "text-gray-500"}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">
                            {section.title}
                          </span>
                          {section.badge && (
                            <Badge 
                              variant={isActive ? "secondary" : "outline"}
                              className={`ml-2 text-xs ${
                                isActive 
                                  ? "bg-blue-100 text-blue-800 border-blue-200" 
                                  : ""
                              }`}
                            >
                              {section.badge}
                            </Badge>
                          )}
                        </div>
                        
                        {section.description && (
                          <p className={`text-xs mt-1 ${
                            isActive ? "text-blue-100" : "text-gray-500"
                          }`}>
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                  
                  {index < sections.length - 1 && (
                    <div className="h-px bg-gray-200 mx-3" />
                  )}
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              <Eye className="w-3 h-3 inline mr-1" />
              Haz clic en cualquier sección para navegar rápidamente
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
