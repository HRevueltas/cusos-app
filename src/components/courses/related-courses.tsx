"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseCard } from "./course-card"
import { BookOpen } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  image?: string | null
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  price: number
  isFree: boolean
  isPublished: boolean
  instructor: {
    name: string
  }
  _count: {
    enrollments: number
    modules: number
  }
  averageRating: number
}

interface RelatedCoursesProps {
  currentCourseId: string
  category: string
  instructorId: string
}

export function RelatedCourses({ currentCourseId, category, instructorId }: RelatedCoursesProps) {
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedCourses = async () => {
      try {
        setLoading(true)
        
        // First try to get courses from the same category
        const response = await fetch(
          `/api/courses?category=${encodeURIComponent(category)}&limit=6`
        )
        
        if (response.ok) {
          const data = await response.json()
          // Filter out current course and limit to 3
          const filtered = data.courses
            .filter((course: Course) => course.id !== currentCourseId)
            .slice(0, 3)
          setRelatedCourses(filtered)
        }
      } catch (error) {
        console.error('Error fetching related courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRelatedCourses()
  }, [currentCourseId, category, instructorId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cursos relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (relatedCourses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cursos relacionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay cursos relacionados
            </h3>
            <p className="text-gray-600">
              Explora nuestro catálogo completo para encontrar más cursos.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cursos relacionados</CardTitle>
        <p className="text-sm text-gray-600">
          Otros cursos que podrían interesarte
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
