"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BookOpen, 
  Users, 
  Star, 
  MessageSquare, 
  Calendar,
  Mail
} from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  image?: string | null
  category: string
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  price: number
  isFree: boolean
  createdAt: Date
  _count: {
    enrollments: number
    modules: number
  }
  averageRating: number
}

interface InstructorStats {
  totalCourses: number
  totalStudents: number
  averageRating: number
  totalReviews: number
}

interface Instructor {
  id: string
  name: string
  email: string
  avatar?: string | null
  createdAt: Date
  coursesCreated: Course[]
  stats: InstructorStats
}

interface InstructorProfileProps {
  instructor: Instructor
}

export function InstructorProfile({ instructor }: InstructorProfileProps) {
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header del Instructor */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-32"></div>
        <CardContent className="relative pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
                {instructor.avatar ? (
                  <Image
                    src={instructor.avatar}
                    alt={instructor.name}
                    width={120}
                    height={120}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    {instructor.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Información básica */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {instructor.name}
                </h1>
                <p className="text-lg text-gray-600">Instructor</p>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructor.stats.totalCourses}
                  </p>
                  <p className="text-sm text-gray-600">Cursos</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructor.stats.totalStudents}
                  </p>
                  <p className="text-sm text-gray-600">Estudiantes</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructor.stats.averageRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">Calificación</p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {instructor.stats.totalReviews}
                  </p>
                  <p className="text-sm text-gray-600">Reseñas</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contactar
              </Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Miembro desde {new Date(instructor.createdAt).getFullYear()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cursos del Instructor */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Cursos de {instructor.name}
          </h2>
          <Badge variant="secondary" className="text-sm">
            {instructor.stats.totalCourses} cursos
          </Badge>
        </div>

        {instructor.coursesCreated.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin cursos aún
              </h3>
              <p className="text-gray-600">
                Este instructor aún no ha publicado ningún curso.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instructor.coursesCreated.map((course) => (
              <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  {course.image ? (
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white" />
                    </div>
                  )}
                  
                  {/* Badge de precio */}
                  <div className="absolute top-3 right-3">
                    {course.isFree ? (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        Gratis
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500 hover:bg-blue-600">
                        ${course.price}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {course.category}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${levelColors[course.level]}`}
                    >
                      {levelLabels[course.level]}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="space-y-2">
                    {/* Rating */}
                    {course.averageRating > 0 && (
                      <div className="flex items-center">
                        {renderStars(course.averageRating)}
                      </div>
                    )}

                    {/* Estadísticas */}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course._count.enrollments} estudiantes
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {course._count.modules} módulos
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <Link href={`/courses/${course.id}`}>
                    <Button className="w-full">
                      Ver curso
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
