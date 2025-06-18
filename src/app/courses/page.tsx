"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { PublicFooter } from "@/components/layout/public-footer"
import { SearchBar } from "@/components/courses/search-bar"
import { FilterSidebar } from "@/components/courses/filter-sidebar"
import { CoursesGrid } from "@/components/courses/courses-grid"

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

interface CoursesResponse {
  courses: Course[]
  pagination: Pagination
}

// Componente separado que usa useSearchParams
function CoursesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [courses, setCourses] = useState<Course[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 9,
    totalCount: 0,
    totalPages: 0
  })
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(searchParams.toString())
      if (!params.get('limit')) {
        params.set('limit', '9')
      }

      const response = await fetch(`/api/courses?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Error al cargar los cursos')
      }

      const data: CoursesResponse = await response.json()
      setCourses(data.courses)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  // Fetch categories for filters
  const fetchCategories = async () => {
    try {
      // Usar categorías predefinidas en lugar de extraerlas de cursos existentes
      const predefinedCategories = [
        "Programación",
        "Diseño",
        "Marketing",
        "Fotografía", 
        "Música",
        "Idiomas",
        "Negocios",
        "Cocina",
        "Fitness",
        "Arte"
      ]
      setCategories(predefinedCategories)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }
  
  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  useEffect(() => {
    fetchCategories()
  }, [])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`/courses?${params.toString()}`)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error al cargar los cursos
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicNavbar />
      
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Explora Nuestros Cursos
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Descubre cursos de alta calidad para acelerar tu aprendizaje
            </p>
            <div className="max-w-2xl mx-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FilterSidebar categories={categories} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="space-y-8">
                {/* Skeleton loading */}
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border overflow-hidden animate-pulse">
                      <div className="aspect-video bg-gray-200"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <CoursesGrid
                courses={courses}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
      
      <PublicFooter />
    </div>
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  )
}
