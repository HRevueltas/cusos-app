"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CourseHeader } from "@/components/courses/course-header"
import { CourseContent } from "@/components/courses/course-content"
import { InstructorCard } from "@/components/courses/instructor-card"
import { ReviewsSection } from "@/components/courses/reviews-section"
import { RelatedCourses } from "@/components/courses/related-courses"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

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

interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  user: {
    id: string
    name: string
  }
}

interface Course {
  id: string
  title: string
  description: string
  image?: string | null
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  price: number
  isFree: boolean
  createdAt: string
  instructor: {
    id: string
    name: string
    email: string
  }
  modules: Module[]
  reviews: Review[]
  _count: {
    enrollments: number
    reviews: number
  }
  averageRating: number
  totalLessons: number
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const courseId = params.slug as string

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/courses/${courseId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError("Curso no encontrado")
          } else {
            setError("Error al cargar el curso")
          }
          return
        }

        const courseData = await response.json()
        setCourse(courseData)
      } catch (err) {
        setError("Error al cargar el curso")
        console.error("Error fetching course:", err)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  // Check enrollment status
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session?.user?.id || !courseId) return

      try {
        const response = await fetch(`/api/student/enrollments?courseId=${courseId}`)
        if (response.ok) {
          const data = await response.json()
          setIsEnrolled(data.isEnrolled || false)
        }
      } catch (err) {
        console.error("Error checking enrollment:", err)
      }
    }

    checkEnrollment()
  }, [session, courseId])

  const handleEnroll = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    if (isEnrolled) {
      // Redirect to course learning page
      router.push(`/learn/${courseId}`)
      return
    }

    try {
      setEnrolling(true)
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST"
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al inscribirse")
      }

      setIsEnrolled(true)
      
      // Redirect to learning page
      router.push(`/learn/${courseId}`)
    } catch (err) {
      console.error("Enrollment error:", err)
      alert(err instanceof Error ? err.message : "Error al inscribirse")
    } finally {
      setEnrolling(false)
    }
  }
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <PublicNavbar />
        
        {/* Loading skeleton */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded w-64"></div>
                <div className="h-12 bg-white/20 rounded"></div>
                <div className="h-6 bg-white/20 rounded w-3/4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="aspect-video bg-gray-200 animate-pulse"></div>
                <div className="p-6 space-y-4 animate-pulse">
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <PublicNavbar />
        
        <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Curso no encontrado"}
          </h1>
          <p className="text-gray-600 mb-6">
            El curso que buscas no existe o no está disponible.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/courses">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al catálogo
              </Link>
            </Button>
          </div>
        </div>
        </div>
      </div>
    )

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <PublicNavbar />
      
      {/* Course Header */}
      <CourseHeader
        course={course}
        onEnroll={handleEnroll}
        isEnrolled={isEnrolled}
        loading={enrolling}
      />

      {/* Course Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course modules and lessons */}
            <CourseContent modules={course.modules} isEnrolled={isEnrolled} />            {/* Reviews */}
            <ReviewsSection
              courseId={course.id}
              courseTitle={course.title}
              reviews={course.reviews}
              averageRating={course.averageRating}
              totalReviews={course._count.reviews}
              isEnrolled={isEnrolled}
              onReviewAdded={(newReview) => {
                setCourse(prev => prev ? {
                  ...prev,
                  reviews: [newReview, ...prev.reviews],
                  _count: {
                    ...prev._count,
                    reviews: prev._count.reviews + 1
                  },
                  averageRating: ((prev.averageRating * prev._count.reviews) + newReview.rating) / (prev._count.reviews + 1)
                } : null)
              }}
              onReviewUpdated={(updatedReview) => {
                setCourse(prev => prev ? {
                  ...prev,
                  reviews: prev.reviews.map(r => r.id === updatedReview.id ? updatedReview : r)
                } : null)
              }}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Instructor info */}
            <InstructorCard
              instructor={course.instructor}
              stats={{
                totalCourses: 1, // This could be fetched from API
                totalStudents: course._count.enrollments,
                averageRating: course.averageRating,
                totalReviews: course._count.reviews
              }}
            />
          </div>
        </div>

        {/* Related Courses */}
        <div className="mt-12">
          <RelatedCourses
            currentCourseId={course.id}
            category={course.category}
            instructorId={course.instructor.id}
          />
        </div>
      </div>
    </div>
  )
}

