"use client"

import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  Users, 
  BookOpen,
  Play
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

interface CourseCardProps {
  course: {
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
      id: string
      name: string
    }
    _count: {
      enrollments: number
      modules: number
    }
    averageRating: number
  }
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

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
      <div className="relative">
        {/* Imagen del curso */}
        <div className="aspect-video bg-gray-200 relative overflow-hidden">
          {course.image ? (
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
          )}
        </div>
        
        {/* Badge de nivel */}
        <div className="absolute top-2 left-2">
          <Badge className={levelColors[course.level]}>
            {levelLabels[course.level]}
          </Badge>
        </div>
        
        {/* Badge de precio */}
        <div className="absolute top-2 right-2">
          <Badge variant={course.isFree ? "secondary" : "default"}>
            {course.isFree ? "Gratuito" : formatPrice(course.price)}
          </Badge>
        </div>

        {/* Overlay con botón de reproducir */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
          <Button
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            asChild
          >
            <Link href={`/courses/${course.id}`}>
              <Play className="w-4 h-4 mr-1" />
              Ver curso
            </Link>
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Título */}
        <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
          <Link 
            href={`/courses/${course.id}`}
            className="hover:text-blue-600 transition-colors"
          >
            {course.title}
          </Link>
        </h3>        {/* Instructor */}
        <p className="text-sm text-gray-600 mb-2">
          Por{" "}
          <Link 
            href={`/instructor/${course.instructor.id}`}
            className="hover:text-blue-600 transition-colors font-medium"
          >
            {course.instructor.name}
          </Link>
        </p>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5rem]">
          {course.description}
        </p>

        {/* Categoría */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
        </div>

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span>{course.averageRating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course._count.enrollments}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course._count.modules} módulos</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" asChild>
          <Link href={`/courses/${course.id}`}>
            Ver detalles
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
