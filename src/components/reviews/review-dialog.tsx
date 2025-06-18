'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment?: string
  course: {
    title: string
  }
}

interface ReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  review?: Review | null
  onSubmit: (data: { rating: number; comment?: string }) => Promise<void>
  loading: boolean
  mode: 'create' | 'edit'
  courseTitle?: string
}

export function ReviewDialog({
  open,
  onOpenChange,
  review,
  onSubmit,
  loading,
  mode,
  courseTitle
}: ReviewDialogProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  useEffect(() => {
    if (review && mode === 'edit') {
      setRating(review.rating)
      setComment(review.comment || '')
    } else {
      setRating(5)
      setComment('')
    }
  }, [review, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      return
    }

    await onSubmit({
      rating,
      comment: comment.trim() || undefined
    })
  }

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => {
      const starNumber = i + 1
      const isActive = starNumber <= (hoveredRating || rating)
      
      return (
        <button
          key={i}
          type="button"
          className="p-1 transition-colors"
          onMouseEnter={() => setHoveredRating(starNumber)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => setRating(starNumber)}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              isActive 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      )
    })
  }

  const title = mode === 'create' 
    ? `Escribir reseña para "${courseTitle}"`
    : `Editar reseña para "${review?.course.title}"`

  const description = mode === 'create'
    ? 'Comparte tu experiencia con este curso para ayudar a otros estudiantes'
    : 'Modifica tu reseña sobre este curso'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="rating">Calificación *</Label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              <span className="ml-2 text-sm text-gray-600">
                {rating}/5
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia con este curso..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 text-right">
              {comment.length}/500
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Guardando...</span>
                </div>
              ) : (
                mode === 'create' ? 'Publicar reseña' : 'Actualizar reseña'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
