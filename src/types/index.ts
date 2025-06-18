import { User, Course, Module, Lesson, Enrollment, Progress, Review, Role, Level, LessonType } from '@prisma/client'

// Tipos extendidos para incluir relaciones
export type UserWithRelations = User & {
  coursesCreated?: Course[]
  enrollments?: EnrollmentWithRelations[]
  reviews?: Review[]
}

export type CourseWithRelations = Course & {
  instructor: User
  modules?: ModuleWithRelations[]
  enrollments?: EnrollmentWithRelations[]
  reviews?: Review[]
  _count?: {
    enrollments: number
    reviews: number
  }
}

export type ModuleWithRelations = Module & {
  lessons?: LessonWithRelations[]
  course?: Course
}

export type LessonWithRelations = Lesson & {
  module?: Module
  progress?: Progress[]
}

export type EnrollmentWithRelations = Enrollment & {
  student: User
  course: Course
  progress?: Progress[]
}

// Tipos para navegación
export interface NavItem {
  title: string
  href: string
  icon?: string
  description?: string
}

// Tipos para dashboard
export interface DashboardStats {
  totalCourses: number
  totalStudents: number
  totalRevenue: number
  completionRate: number
}

// Exportar tipos de Prisma
export type {
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Progress,
  Review,
  Role,
  Level,
  LessonType
}
