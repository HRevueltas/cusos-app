'use client'

import { useState, useEffect } from 'react'
import { useReviews } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Edit, MessageSquare } from 'lucide-react'
import { ReviewDialog } from './review-dialog'

interface Review {
  id: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
}

interface CourseReviewCardProps {
  courseId: string
  courseTitle: string
  isCompleted: boolean
}

export function CourseReviewCard({ courseId, courseTitle, isCompleted }: CourseReviewCardProps) {
  const [review, setReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const { loading, getCourseReview, createReview, updateReview } = useReviews()

  useEffect(() => {
    if (isCompleted) {
      loadReview()
    }
  }, [isCompleted, courseId])

  const loadReview = async () => {
    try {
      const existingReview = await getCourseReview(courseId)
      setReview(existingReview)
    } catch (error) {
      console.error('Error loading review:', error)
    }
  }

  const handleCreateReview = () => {
    setMode('create')
    setIsDialogOpen(true)
  }

  const handleEditReview = () => {
    setMode('edit')
    setIsDialogOpen(true)
  }

  const handleSubmitReview = async (data: { rating: number; comment?: string }) => {
    try {
      if (mode === 'create') {
        const newReview = await createReview({
          courseId,
          rating: data.rating,
          comment: data.comment
        })
        setReview(newReview)
      } else if (review) {
        const updatedReview = await updateReview(review.id, data)
        setReview(updatedReview)
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isCompleted) {
    return null
  }

  return (
    <>
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-green-800">
            <MessageSquare className="w-5 h-5" />
            <span>Tu Reseña</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {review ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-sm text-gray-600">{review.rating}/5</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditReview}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Editar
                </Button>
              </div>
              
              {review.comment && (
                <p className="text-gray-700 bg-white p-3 rounded-lg border">
                  {review.comment}
                </p>
              )}
              
              <p className="text-xs text-gray-500">
                Escrita el {formatDate(review.createdAt)}
                {review.createdAt !== review.updatedAt && (
                  <span> • Editada el {formatDate(review.updatedAt)}</span>
                )}
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-4">
                ¡Felicidades por completar el curso! Comparte tu experiencia escribiendo una reseña.
              </p>
              <Button
                onClick={handleCreateReview}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Cargando...</span>
                  </div>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Escribir Reseña
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={review ? { ...review, course: { title: courseTitle } } : null}
        onSubmit={handleSubmitReview}
        loading={loading}
        mode={mode}
        courseTitle={courseTitle}
      />
    </>
  )
}
