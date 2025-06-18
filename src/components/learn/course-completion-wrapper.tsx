'use client'

import { useRouter } from 'next/navigation'
import { CourseCompletionSummary } from './course-completion-summary'

interface CourseCompletionWrapperProps {
  course: {
    id: string
    title: string
    instructor: {
      name: string
      avatar: string | null
    }
  }
  stats: {
    totalLessons: number
    completedLessons: number
    completionDate: Date
    timeSpent?: string
  }
}

export function CourseCompletionWrapper({ course, stats }: CourseCompletionWrapperProps) {
  const router = useRouter()

  const handleGoToCertificate = () => {
    router.push(`/learn/${course.id}/certificate`)
  }

  const handleWriteReview = () => {
    router.push(`/courses/${course.id}#reviews`)
  }

  const handleShareCompletion = async () => {
    try {
      // Implementar funcionalidad de compartir
      if (navigator.share) {
        await navigator.share({
          title: `¡Completé el curso: ${course.title}!`,
          text: `Acabo de completar este increíble curso sobre ${course.title}`,
          url: `${window.location.origin}/courses/${course.id}`
        })
      } else {
        // Fallback: copiar al portapapeles
        const text = `¡Completé el curso: ${course.title}! ${window.location.origin}/courses/${course.id}`
        await navigator.clipboard.writeText(text)
        alert('¡Enlace copiado al portapapeles!')
      }
    } catch (error) {
      console.error('Error sharing completion:', error)
    }
  }

  return (
    <CourseCompletionSummary
      course={course}
      stats={stats}
      onGoToCertificate={handleGoToCertificate}
      onWriteReview={handleWriteReview}
      onShareCompletion={handleShareCompletion}
    />
  )
}
