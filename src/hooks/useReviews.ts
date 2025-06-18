import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
  course: {
    title: string
    image?: string
  }
}

interface CreateReviewData {
  courseId: string
  rating: number
  comment?: string
}

interface UpdateReviewData {
  rating?: number
  comment?: string
}

export function useReviews() {
  const [loading, setLoading] = useState(false)

  // Crear una nueva review
  const createReview = useCallback(async (data: CreateReviewData) => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al crear la reseña')
      }

      toast.success('¡Reseña creada exitosamente!')
      return result.review
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear la reseña'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener reviews del estudiante
  const getStudentReviews = useCallback(async (): Promise<Review[]> => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/reviews')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener las reseñas')
      }

      return result.reviews
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener las reseñas'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Obtener review específica de un curso
  const getCourseReview = useCallback(async (courseId: string): Promise<Review | null> => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student/reviews?courseId=${courseId}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener la reseña')
      }

      return result.review
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al obtener la reseña'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Actualizar una review
  const updateReview = useCallback(async (reviewId: string, data: UpdateReviewData) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar la reseña')
      }

      toast.success(result.message || 'Reseña actualizada exitosamente')
      return result.review
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la reseña'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Eliminar una review
  const deleteReview = useCallback(async (reviewId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/student/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar la reseña')
      }

      toast.success(result.message || 'Reseña eliminada exitosamente')
      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la reseña'
      toast.error(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    createReview,
    getStudentReviews,
    getCourseReview,
    updateReview,
    deleteReview,
  }
}
