import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Lesson {
  id: string
  title: string
  content: string
  type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'
  videoUrl: string | null
  fileUrl: string | null
  order: number
  moduleId: string
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface UseLessonNavigationProps {
  courseId: string
  currentLessonId: string
  modules: Module[]
}

export function useLessonNavigation({ 
  courseId, 
  currentLessonId, 
  modules 
}: UseLessonNavigationProps) {
  const router = useRouter()

  // Flatten all lessons in order
  const allLessons = useMemo(() => {
    return modules
      .sort((a, b) => a.order - b.order)
      .flatMap(module => 
        module.lessons
          .sort((a, b) => a.order - b.order)
          .map(lesson => ({
            ...lesson,
            moduleTitle: module.title
          }))
      )
  }, [modules])

  // Find current lesson index
  const currentLessonIndex = useMemo(() => {
    return allLessons.findIndex(lesson => lesson.id === currentLessonId)
  }, [allLessons, currentLessonId])

  // Get previous lesson
  const previousLesson = useMemo(() => {
    if (currentLessonIndex <= 0) return null
    return allLessons[currentLessonIndex - 1]
  }, [allLessons, currentLessonIndex])

  // Get next lesson
  const nextLesson = useMemo(() => {
    if (currentLessonIndex >= allLessons.length - 1) return null
    return allLessons[currentLessonIndex + 1]
  }, [allLessons, currentLessonIndex])

  // Get current lesson details
  const currentLesson = useMemo(() => {
    if (currentLessonIndex === -1) return null
    return allLessons[currentLessonIndex]
  }, [allLessons, currentLessonIndex])

  // Navigation functions
  const goToPreviousLesson = () => {
    if (previousLesson) {
      router.push(`/learn/${courseId}/lesson/${previousLesson.id}`)
    }
  }

  const goToNextLesson = () => {
    if (nextLesson) {
      router.push(`/learn/${courseId}/lesson/${nextLesson.id}`)
    }
  }

  const goToLesson = (lessonId: string) => {
    router.push(`/learn/${courseId}/lesson/${lessonId}`)
  }

  // Get lesson position info
  const lessonPosition = useMemo(() => {
    return {
      current: currentLessonIndex + 1,
      total: allLessons.length,
      percentage: allLessons.length > 0 ? ((currentLessonIndex + 1) / allLessons.length) * 100 : 0
    }
  }, [currentLessonIndex, allLessons.length])

  // Get lessons around current lesson (for quick navigation)
  const nearbyLessons = useMemo(() => {
    const start = Math.max(0, currentLessonIndex - 2)
    const end = Math.min(allLessons.length, currentLessonIndex + 3)
    return allLessons.slice(start, end)
  }, [allLessons, currentLessonIndex])
  // Find lesson by module
  const getLessonsByModule = (moduleId: string) => {
    const courseModule = modules.find(m => m.id === moduleId)
    return courseModule?.lessons.sort((a, b) => a.order - b.order) || []
  }

  // Get current module info
  const currentModule = useMemo(() => {
    if (!currentLesson) return null
    return modules.find(m => m.id === currentLesson.moduleId)
  }, [modules, currentLesson])

  return {
    // Current lesson info
    currentLesson,
    currentModule,
    lessonPosition,
    
    // Navigation
    previousLesson,
    nextLesson,
    goToPreviousLesson,
    goToNextLesson,
    goToLesson,
    
    // Lesson lists
    allLessons,
    nearbyLessons,
    getLessonsByModule,
    
    // Checks
    hasPreviousLesson: previousLesson !== null,
    hasNextLesson: nextLesson !== null,
    isFirstLesson: currentLessonIndex === 0,
    isLastLesson: currentLessonIndex === allLessons.length - 1
  }
}
