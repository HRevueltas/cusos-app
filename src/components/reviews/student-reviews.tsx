'use client'

import { useState, useEffect } from 'react'
import { useReviews } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Edit, Trash2, Calendar } from 'lucide-react'
import { ReviewDialog } from './review-dialog'
import { toast } from 'sonner'
import Image from 'next/image'

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

export function StudentReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { loading, getStudentReviews, updateReview, deleteReview } = useReviews()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const studentReviews = await getStudentReviews()
      setReviews(studentReviews)
    } catch (error) {
      console.error('Error loading reviews:', error)
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setIsDialogOpen(true)
  }

  const handleDelete = async (reviewId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return
    }

    try {
      await deleteReview(reviewId)
      setReviews(reviews.filter(r => r.id !== reviewId))
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const handleUpdateReview = async (data: { rating: number; comment?: string }) => {
    if (!editingReview) return

    try {
      const updatedReview = await updateReview(editingReview.id, data)
      setReviews(reviews.map(r => r.id === editingReview.id ? updatedReview : r))
      setIsDialogOpen(false)
      setEditingReview(null)
    } catch (error) {
      console.error('Error updating review:', error)
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

  if (loading && reviews.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mis Reseñas</h2>
        <Badge variant="secondary" className="text-sm">
          {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No has escrito ninguna reseña aún
              </h3>
              <p className="text-gray-600">
                Completa un curso al 100% para poder escribir tu primera reseña
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {review.course.image && (
                      <Image
                        src={review.course.image}
                        alt={review.course.title}
                        width={60}
                        height={40}
                        className="rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {review.course.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(review)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {review.comment && (
                <CardContent className="pt-0">
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                </CardContent>
              )}
              
              <CardContent className="pt-0">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Escrita el {formatDate(review.createdAt)}
                    {review.createdAt !== review.updatedAt && (
                      <span> • Editada el {formatDate(review.updatedAt)}</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={editingReview}
        onSubmit={handleUpdateReview}
        loading={loading}
        mode="edit"
      />
    </div>
  )
}
