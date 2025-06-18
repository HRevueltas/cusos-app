"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Users, 
  BookOpen, 
  Award
} from "lucide-react"

interface InstructorCardProps {
  instructor: {
    id: string
    name: string
    email: string
  }
  stats?: {
    totalCourses: number
    totalStudents: number
    averageRating: number
    totalReviews: number
  }
  showFullDetails?: boolean
}

export function InstructorCard({ instructor, stats, showFullDetails = false }: InstructorCardProps) {
  const CardWrapper = showFullDetails ? "div" : Card
  const HeaderWrapper = showFullDetails ? "div" : CardHeader
  const ContentWrapper = showFullDetails ? "div" : CardContent

  return (
    <CardWrapper className={showFullDetails ? "" : undefined}>
      {!showFullDetails && (
        <HeaderWrapper>
          <CardTitle>Instructor</CardTitle>
        </HeaderWrapper>
      )}
      <ContentWrapper className={showFullDetails ? "" : undefined}>
        <div className="space-y-4">
          {/* Instructor info */}
          <div className="flex items-start gap-4">
            <div className={`${showFullDetails ? "w-20 h-20" : "w-16 h-16"} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white ${showFullDetails ? "text-2xl" : "text-xl"} font-bold flex-shrink-0`}>
              {instructor.name.charAt(0).toUpperCase()}
            </div>            
            <div className="flex-1">
              <Link href={`/instructor/${instructor.id}`}>
                <h3 className={`${showFullDetails ? "text-xl" : "text-lg"} font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer`}>
                  {instructor.name}
                </h3>
              </Link>
              <p className={`${showFullDetails ? "text-base" : "text-sm"} text-gray-600`}>{instructor.email}</p>
              
              {showFullDetails && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Instructor experimentado comprometido con brindar educación de alta calidad 
                    y ayudar a los estudiantes a alcanzar sus objetivos de aprendizaje.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className={`grid ${showFullDetails ? "grid-cols-4" : "grid-cols-2"} gap-4 pt-4 border-t border-gray-200`}>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <BookOpen className="w-4 h-4 text-blue-600 mr-1" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{stats.totalCourses}</div>
                <div className="text-xs text-gray-600">Cursos</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-green-600 mr-1" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{stats.totalStudents}</div>
                <div className="text-xs text-gray-600">Estudiantes</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{stats.averageRating.toFixed(1)}</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Award className="w-4 h-4 text-purple-600 mr-1" />
                </div>
                <div className="text-lg font-semibold text-gray-900">{stats.totalReviews}</div>
                <div className="text-xs text-gray-600">Reseñas</div>
              </div>
            </div>
          )}

          {/* Bio placeholder - only show if not full details (to avoid duplication) */}
          {!showFullDetails && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 leading-relaxed">
                Instructor experimentado comprometido con brindar educación de alta calidad 
                y ayudar a los estudiantes a alcanzar sus objetivos de aprendizaje.
              </p>
            </div>
          )}

          {/* Contact button */}
          <div className={showFullDetails ? "pt-4" : ""}>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/instructor/${instructor.id}`}>
                Ver perfil completo del instructor
              </Link>
            </Button>
          </div>
        </div>
      </ContentWrapper>
    </CardWrapper>
  )
}
