"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  ChevronUp, 
  BookOpen, 
  User, 
  Star, 
  ArrowLeft,
  Menu,
  X
} from "lucide-react"

interface FloatingNavProps {
  courseTitle: string
  sections: Array<{
    id: string
    title: string
    icon: React.ElementType
  }>
  onSectionClick: (sectionId: string) => void
  onBackClick: () => void
}

export function FloatingNav({ 
  courseTitle, 
  sections, 
  onSectionClick, 
  onBackClick 
}: FloatingNavProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState<string>("")

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 400) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setIsExpanded(false)
      }
    }

    const updateActiveSection = () => {
      const sectionElements = sections.map(section => 
        document.getElementById(section.id)
      ).filter(Boolean)

      let currentSection = ""
      
      for (const element of sectionElements) {
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= 100) {
            currentSection = element.id
          }
        }
      }
      
      setActiveSection(currentSection)
    }

    window.addEventListener("scroll", toggleVisibility)
    window.addEventListener("scroll", updateActiveSection)
    
    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      window.removeEventListener("scroll", updateActiveSection)
    }
  }, [sections])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {/* Expanded Navigation Menu */}
      {isExpanded && (
        <Card className="w-64 shadow-lg border-0 bg-white/95 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
                {courseTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {sections.map((section) => {
                const IconComponent = section.icon
                const isActive = activeSection === section.id
                
                return (
                  <Button
                    key={section.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      onSectionClick(section.id)
                      setIsExpanded(false)
                    }}
                    className={`w-full justify-start text-left ${
                      isActive 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </Button>
                )
              })}
              
              <hr className="my-2" />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onBackClick}
                className="w-full justify-start text-left hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al catálogo
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Floating Action Buttons */}
      <div className="flex flex-col space-y-2">
        {/* Scroll to Top */}
        <Button
          onClick={scrollToTop}
          size="sm"
          className="h-12 w-12 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700 text-white"
        >
          <ChevronUp className="h-5 w-5" />
        </Button>

        {/* Navigation Menu Toggle */}
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          className="h-12 w-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
