import { z } from "zod"

// Esquemas de autenticación
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
})

// Esquemas de cursos
export const courseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  category: z.string().min(1, "La categoría es requerida"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.number().min(0, "El precio no puede ser negativo"),
  isFree: z.boolean().default(true),
  image: z.string().optional(),
})

export const moduleSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  order: z.number().min(0, "El orden debe ser mayor o igual a 0"),
})

export const lessonSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  content: z.string().min(1, "El contenido es requerido"),
  type: z.enum(["TEXT", "VIDEO", "PDF", "QUIZ"]),
  videoUrl: z.string().url().optional().or(z.literal("")),
  fileUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().min(0, "El orden debe ser mayor o igual a 0"),
})

// Tipos derivados
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CourseInput = z.infer<typeof courseSchema>
export type ModuleInput = z.infer<typeof moduleSchema>
export type LessonInput = z.infer<typeof lessonSchema>
