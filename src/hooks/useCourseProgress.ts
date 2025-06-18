import { useState, useEffect, useCallback } from 'react'

interface LessonProgress {
  id: string
  lessonId: string
  completed: boolean
  completedAt: Date | null
}

interface CourseProgressData {
  totalLessons: number
  completedLessons: number
  progressPercentage: number
  currentStreak: number
  lastActivity: Date | null
}

interface UseCourseProgressProps {
  courseId: string
  enrollmentId: string
}

export function useCourseProgress({ courseId, enrollmentId }: UseCourseProgressProps) {
  const [progress, setProgress] = useState<LessonProgress[]>([])
  const [courseData, setCourseData] = useState<CourseProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial progress data
  const fetchProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/student/progress?courseId=${courseId}`)
      
      if (!response.ok) {
        throw new Error('Error fetching progress data')
      }
      
      const data = await response.json()
      setProgress(data.enrollment.progress || [])
      setCourseData({
        totalLessons: data.stats.totalLessons,
        completedLessons: data.stats.completedLessons,
        progressPercentage: data.stats.progressPercentage,
        currentStreak: 0, // Calculado del lado del servidor en implementación real
        lastActivity: data.enrollment.progress?.[0]?.completedAt || null
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error unknown')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  // Mark lesson as complete
  const markLessonComplete = useCallback(async (lessonId: string) => {
    try {
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enrollmentId,
          lessonId
        })
      })

      if (!response.ok) {
        throw new Error('Error marking lesson as complete')
      }      const result = await response.json()
      
      // Update local state immediately
      setProgress(prev => {
        const existingIndex = prev.findIndex(p => p.lessonId === lessonId)
        if (existingIndex >= 0) {
          // Update existing progress
          const updated = [...prev]
          updated[existingIndex] = {
            ...updated[existingIndex],
            completed: true,
            completedAt: new Date()
          }
          return updated
        } else {
          // Add new progress entry
          return [...prev, {
            id: result.progress.id,
            lessonId,
            completed: true,
            completedAt: new Date()
          }]
        }
      })

      // Update course data - more careful calculation
      setCourseData(prev => {
        if (!prev) return null
        
        // Solo incrementar si la lección no estaba ya completada
        const wasAlreadyCompleted = progress.some(p => p.lessonId === lessonId && p.completed)
        const newCompleted = wasAlreadyCompleted ? prev.completedLessons : prev.completedLessons + 1
        
        // Asegurar que el progreso no exceda el 100%
        const progressPercentage = Math.min(100, (newCompleted / prev.totalLessons) * 100)
        
        return {
          ...prev,
          completedLessons: newCompleted,
          progressPercentage,
          lastActivity: new Date()
        }
      })

      // Refresh from server to ensure data consistency
      setTimeout(() => {
        fetchProgress()
      }, 500)

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error marking lesson complete')
      throw err
    }
  }, [enrollmentId, progress])

  // Check if lesson is completed
  const isLessonCompleted = useCallback((lessonId: string) => {
    return progress.some(p => p.lessonId === lessonId && p.completed)
  }, [progress])

  // Get completion date for a lesson
  const getLessonCompletionDate = useCallback((lessonId: string) => {
    const lessonProgress = progress.find(p => p.lessonId === lessonId && p.completed)
    return lessonProgress?.completedAt || null
  }, [progress])

  // Calculate progress for a specific module
  const getModuleProgress = useCallback((moduleId: string, moduleLessons: { id: string }[]) => {
    const completedInModule = moduleLessons.filter(lesson => 
      isLessonCompleted(lesson.id)
    ).length
    
    return {
      completed: completedInModule,
      total: moduleLessons.length,
      percentage: moduleLessons.length > 0 ? (completedInModule / moduleLessons.length) * 100 : 0
    }
  }, [isLessonCompleted])

  // Check if course is fully completed
  const isCourseCompleted = courseData?.progressPercentage === 100

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    courseData,
    isLoading,
    error,
    markLessonComplete,
    isLessonCompleted,
    getLessonCompletionDate,
    getModuleProgress,
    isCourseCompleted,
    refetch: fetchProgress
  }
}
