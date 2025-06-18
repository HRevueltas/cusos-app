"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Users, 
  BookOpen, 
  Clock,
  Calendar,
  Globe
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CourseHeaderProps {
  course: {
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
    _count: {
      enrollments: number
      modules: number
    }
    averageRating: number
  }
  onEnroll: () => void
  isEnrolled?: boolean
  loading?: boolean
}

const levelLabels = {
  BEGINNER: "Principiante",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado"
}

const levelColors = {
  BEGINNER: "bg-green-100 text-green-800",
  INTERMEDIATE: "bg-yellow-100 text-yellow-800",
  ADVANCED: "bg-red-100 text-red-800"
}

export function CourseHeader({ course, onEnroll, isEnrolled = false, loading = false }: CourseHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Course info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Breadcrumb */}
            <nav className="text-blue-200 text-sm">
              <span>Cursos</span>
              <span className="mx-2">/</span>
              <span>{course.category}</span>
              <span className="mx-2">/</span>
              <span className="text-white">{course.title}</span>
            </nav>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              {course.title}
            </h1>

            {/* Description */}
            <p className="text-xl text-blue-100 leading-relaxed">
              {course.description}
            </p>

            {/* Course meta */}
            <div className="flex flex-wrap items-center gap-4 text-blue-100">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-medium text-white">{course.averageRating.toFixed(1)}</span>
                <span>({course._count.enrollments} estudiantes)</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-5 h-5" />
                <span>{course._count.modules} módulos</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>Acceso de por vida</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-5 h-5" />
                <span>Español</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold">
                  {course.instructor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Instructor</p>
                <p className="text-white font-medium">{course.instructor.name}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge className={levelColors[course.level]}>
                {levelLabels[course.level]}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-100">
                {course.category}
              </Badge>
              <Badge variant="outline" className="border-blue-300 text-blue-100">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(course.createdAt).getFullYear()}
              </Badge>
            </div>
          </div>

          {/* Course image and enrollment */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              {/* Course image */}
              <div className="aspect-video bg-gray-200 relative">
                {course.image ? (
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                    <BookOpen className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Enrollment section */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {course.isFree ? "Gratuito" : formatPrice(course.price)}
                  </div>
                  {!course.isFree && (
                    <p className="text-sm text-gray-600">Acceso completo de por vida</p>
                  )}
                </div>

                <Button 
                  className="w-full text-lg py-6" 
                  onClick={onEnroll}
                  disabled={loading}
                >
                  {loading ? (
                    "Procesando..."
                  ) : isEnrolled ? (
                    "Ir al curso"
                  ) : (
                    course.isFree ? "Inscribirse gratis" : "Comprar curso"
                  )}
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  30 días de garantía de devolución de dinero
                </p>

                {/* Course includes */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Este curso incluye:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      {course._count.modules} módulos de contenido
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-600" />
                      Acceso de por vida
                    </li>
                    <li className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Comunidad de estudiantes
                    </li>
                    <li className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      Acceso en móvil y desktop
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
