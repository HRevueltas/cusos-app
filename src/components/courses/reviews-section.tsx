"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ReviewDialog } from "@/components/reviews/review-dialog"
import { useReviews } from "@/hooks/useReviews"
import { 
  Star, 
  MessageSquare,
  ThumbsUp,
  Plus,
  Edit
} from "lucide-react"

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

interface ReviewsSectionProps {
  courseId: string
  courseTitle: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  isEnrolled: boolean
  onReviewAdded?: (review: Review) => void
  onReviewUpdated?: (review: Review) => void
}

export function ReviewsSection({ 
  courseId, 
  courseTitle, 
  reviews, 
  averageRating, 
  totalReviews,
  isEnrolled,
  onReviewAdded,
  onReviewUpdated
}: ReviewsSectionProps) {
  const { data: session } = useSession()
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [isUserCompletedCourse, setIsUserCompletedCourse] = useState(false)
  
  const { loading, getCourseReview, createReview, updateReview } = useReviews()

  // Check if user has completed the course and get their review
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!session?.user?.id || !isEnrolled) return

      try {
        // Check if course is completed
        const progressResponse = await fetch(`/api/student/progress?courseId=${courseId}`)
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          setIsUserCompletedCourse(progressData.progressPercentage >= 100)
        }

        // Get user's existing review
        const existingReview = await getCourseReview(courseId)
        setUserReview(existingReview)      } catch (error) {
        console.error('Error checking user status:', error)
      }
    }

    checkUserStatus()
  }, [session, isEnrolled, courseId, getCourseReview])

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
        setUserReview(newReview)
        if (onReviewAdded) {
          onReviewAdded(newReview)
        }
      } else if (userReview) {
        const updatedReview = await updateReview(userReview.id, data)
        setUserReview(updatedReview)
        if (onReviewUpdated) {
          onReviewUpdated(updatedReview)
        }
      }
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const canWriteReview = session?.user?.role === 'STUDENT' && isEnrolled && isUserCompletedCourse && !userReview
  const canEditReview = session?.user?.role === 'STUDENT' && isEnrolled && isUserCompletedCourse && userReview
  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0
    return { rating, count, percentage }
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? "text-yellow-400 fill-current" 
            : "text-gray-300"
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

  return (
    <Card>      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reseñas de estudiantes
          </CardTitle>
          
          {/* Button to write or edit review */}
          {canWriteReview && (
            <Button onClick={handleCreateReview} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Escribir reseña
            </Button>
          )}
          
          {canEditReview && (
            <Button onClick={handleEditReview} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar mi reseña
            </Button>
          )}
        </div>
        
        {/* Show user's existing review */}
        {userReview && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Tu reseña</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(userReview.rating)}</div>
                    <span className="text-xs text-gray-500">{formatDate(userReview.createdAt)}</span>
                  </div>
                </div>
              </div>
              <Button onClick={handleEditReview} variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
            {userReview.comment && (
              <p className="text-sm text-gray-700 mt-2 ml-10">{userReview.comment}</p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {totalReviews > 0 ? (
          <div className="space-y-6">
            {/* Overall rating */}
            <div className="flex items-start gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(averageRating))}
                </div>
                <p className="text-sm text-gray-600">
                  {totalReviews} reseña{totalReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Rating distribution */}
              <div className="flex-1 space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16">
                      <span className="text-sm">{rating}</span>
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    </div>
                    <div className="flex-1">
                      <Progress value={percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual reviews */}
            <div className="space-y-4 border-t pt-6">
              <h4 className="font-medium text-gray-900">Reseñas recientes</h4>
              {reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {review.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.user.name}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-xs text-gray-500">{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {review.comment && (
                    <p className="text-sm text-gray-700 mt-2 ml-10">{review.comment}</p>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 ml-10">
                    <Button variant="ghost" size="sm" className="text-xs">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Útil
                    </Button>
                  </div>
                </div>
              ))}

              {reviews.length > 5 && (
                <Button variant="outline" className="w-full">
                  Ver todas las reseñas ({totalReviews})
                </Button>
              )}
            </div>
          </div>        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sin reseñas aún
            </h3>
            <p className="text-gray-600 mb-4">
              {canWriteReview 
                ? "Sé el primero en dejar una reseña para este curso." 
                : !isEnrolled 
                  ? "Inscríbete en el curso para poder escribir una reseña."
                  : !isUserCompletedCourse
                    ? "Completa el curso para poder escribir una reseña."
                    : "Sé el primero en dejar una reseña para este curso."
              }
            </p>
            {canWriteReview && (
              <Button onClick={handleCreateReview} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Escribir primera reseña
              </Button>
            )}
          </div>
        )}
      </CardContent>
      
      {/* Review Dialog */}
      <ReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={userReview ? { ...userReview, course: { title: courseTitle } } : null}
        onSubmit={handleSubmitReview}
        loading={loading}
        mode={mode}
        courseTitle={courseTitle}
      />
    </Card>
  )
}
