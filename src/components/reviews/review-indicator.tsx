'use client'

import { useState, useEffect } from 'react'
import { useReviews } from '@/hooks/useReviews'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Edit } from 'lucide-react'
import { ReviewDialog } from './review-dialog'

interface ReviewIndicatorProps {
  courseId: string
  courseTitle: string
  isCompleted: boolean
}

export function ReviewIndicator({ courseId, courseTitle, isCompleted }: ReviewIndicatorProps) {
  const [hasReview, setHasReview] = useState(false)
  const [userReview, setUserReview] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const { loading, getCourseReview, createReview, updateReview } = useReviews()

  useEffect(() => {
    if (isCompleted) {
      checkUserReview()
    }
  }, [courseId, isCompleted])

  const checkUserReview = async () => {
    try {
      const review = await getCourseReview(courseId)
      if (review) {
        setHasReview(true)
        setUserReview(review)
      } else {
        setHasReview(false)
        setUserReview(null)
      }
    } catch (error) {
      console.error('Error checking review:', error)
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
        setUserReview(newReview)
        setHasReview(true)
      } else if (userReview) {
        const updatedReview = await updateReview(userReview.id, data)
        setUserReview(updatedReview)
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
        className={`w-3 h-3 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ))
  }

  if (!isCompleted) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2 mt-2">
        {hasReview ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              <Star className="w-3 h-3 mr-1" />
              Reseña escrita
            </Badge>
            <div className="flex items-center gap-1">
              {renderStars(userReview?.rating || 0)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditReview}
              className="text-xs text-gray-600 hover:text-gray-900 p-1 h-auto"
            >
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateReview}
            disabled={loading}
            className="text-xs bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100"
          >
            <Star className="w-3 h-3 mr-1" />
            Escribir reseña
          </Button>
        )}
      </div>

      <ReviewDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        review={userReview ? { ...userReview, course: { title: courseTitle } } : null}
        onSubmit={handleSubmitReview}
        loading={loading}
        mode={mode}
        courseTitle={courseTitle}
      />
    </>
  )
}
