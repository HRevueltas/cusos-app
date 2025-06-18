'use client'

import { CourseReviewCard } from './course-review-card'

interface CourseReviewSectionProps {
  courseId: string
  courseTitle: string
  isCompleted: boolean
}

export function CourseReviewSection({ courseId, courseTitle, isCompleted }: CourseReviewSectionProps) {
  if (!isCompleted) {
    return null
  }

  return (
    <div className="p-4 border-t border-gray-200 bg-gray-50">
      <CourseReviewCard
        courseId={courseId}
        courseTitle={courseTitle}
        isCompleted={isCompleted}
      />
    </div>
  )
}
