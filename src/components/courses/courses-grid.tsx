"use client"

import { CourseCard } from "./course-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

interface Pagination {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

interface CoursesGridProps {
  courses: Course[]
  pagination: Pagination
  onPageChange: (page: number) => void
}

export function CoursesGrid({ courses, pagination, onPageChange }: CoursesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-gray-600">
            Intenta ajustar tus filtros de búsqueda o explora diferentes categorías.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.totalCount)} de {pagination.totalCount} cursos
        </p>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>

          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNumber
              if (pagination.totalPages <= 5) {
                pageNumber = i + 1
              } else if (pagination.page <= 3) {
                pageNumber = i + 1
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNumber = pagination.totalPages - 4 + i
              } else {
                pageNumber = pagination.page - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={pagination.page === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNumber)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
