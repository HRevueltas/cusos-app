'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LessonSidebar } from './lesson-sidebar'
import { VideoPlayer } from './video-player'
import { LessonContent } from './lesson-content'
import { ProgressTracker } from './progress-tracker'
import { LessonNavigation } from './lesson-navigation'
import { PublicNavbar } from '@/components/layout/public-navbar'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Menu, X, Trophy } from 'lucide-react'
import { useCourseProgress } from '@/hooks/useCourseProgress'
import { useLessonNavigation } from '@/hooks/useLessonNavigation'
import { CourseReviewSection } from '@/components/reviews/course-review-section'

interface CoursePlayerProps {
  course: {
    id: string
    title: string
    modules: Array<{
      id: string
      title: string
      order: number
      lessons: Array<{
        id: string
        title: string
        content: string
        type: 'TEXT' | 'VIDEO' | 'PDF' | 'QUIZ'
        videoUrl: string | null
        fileUrl: string | null
        order: number
        questions?: Array<{
          id: string
          question: string
          order: number
          options: Array<{
            id: string
            text: string
            isCorrect: boolean
            order: number
          }>
        }>
      }>
    }>
    instructor: {
      id: string
      name: string
      avatar: string | null
    }
  }
  currentLessonId: string
  enrollment: {
    id: string
    enrolledAt: Date
  }
  progress: Array<{
    id: string
    lessonId: string
    completed: boolean
    completedAt: Date | null
    lesson: {
      id: string
      title: string
    }
  }>
  lessonProgress?: {
    id: string
    lessonId: string
    completed: boolean
    completedAt: Date | null
  }
  userAnswers?: Array<{
    questionId: string
    optionId: string
    answeredAt: Date
  }>
}

export function CoursePlayer({
  course,
  currentLessonId,
  enrollment,
  progress,
  lessonProgress,
  userAnswers = []
}: CoursePlayerProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  // Use custom hooks
  const {
    markLessonComplete,
    isLessonCompleted,
    courseData
  } = useCourseProgress({
    courseId: course.id,
    enrollmentId: enrollment.id
  })
  const {
    currentLesson,
    previousLesson,
    nextLesson,
    goToPreviousLesson,
    goToNextLesson,
    lessonPosition
  } = useLessonNavigation({
    courseId: course.id,
    currentLessonId,
    modules: course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson => ({
        ...lesson,
        moduleId: module.id
      }))
    }))
  })  // Get current lesson from course data if hook doesn't return it
  const actualCurrentLesson = currentLesson || course.modules
    .flatMap(module => module.lessons)
    .find(lesson => lesson.id === currentLessonId)
  if (!actualCurrentLesson) {
    return <div>Lección no encontrada</div>
  }
  
  // Calculate course progress using ONLY hook data to ensure accuracy
  const courseProgress = courseData?.progressPercentage || 0

  const handleLessonSelect = (lessonId: string) => {
    router.push(`/learn/${course.id}/lesson/${lessonId}`)
    setIsSidebarOpen(false)
  }

  const handleMarkComplete = async () => {
    try {
      await markLessonComplete(currentLessonId)
    } catch (error) {
      console.error('Error marking lesson as complete:', error)
    }
  }
  const isCurrentLessonCompleted = lessonProgress?.completed || isLessonCompleted(currentLessonId)
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Barra de navegación principal */}
      <PublicNavbar />
      
      <div className="flex flex-1 relative">
        {/* Sidebar para desktop */}
        <div className="hidden lg:flex w-80 border-r border-gray-200 flex-col">
          <LessonSidebar
            course={course}
            currentLessonId={currentLessonId}
            progress={progress}
            onLessonSelect={handleLessonSelect}
          />
        </div>

        {/* Sidebar móvil */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="font-semibold text-gray-900">Contenido del curso</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex-1 min-h-0">
                <LessonSidebar
                  course={course}
                  currentLessonId={currentLessonId}
                  progress={progress}
                  onLessonSelect={handleLessonSelect}
                />
              </div>
            </div>
          </div>
        )}        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-gray-200 p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al curso
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setIsSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4 mr-2" />
                  Contenido
                </Button>
              </div>

              <ProgressTracker
                courseProgress={courseProgress}
                lessonCompleted={isCurrentLessonCompleted}
                onMarkComplete={handleMarkComplete}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-900 flex-1 min-w-0 truncate">
                {actualCurrentLesson.title}
              </h1>
              
              {/* Certificate button if course is completed */}
              {courseProgress >= 100 && (
                <Button
                  onClick={() => router.push(`/learn/${course.id}/certificate`)}
                  variant="outline"
                  size="sm"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 flex-shrink-0"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Ver certificado
                </Button>              )}
            </div>
          </div>

          {/* Contenido de la lección */}
          <div className="flex-1 min-h-0 overflow-hidden">
            {actualCurrentLesson.type === 'VIDEO' && actualCurrentLesson.videoUrl ? (
              <VideoPlayer
                videoUrl={actualCurrentLesson.videoUrl}
                title={actualCurrentLesson.title}
                onComplete={handleMarkComplete}
                isCompleted={isCurrentLessonCompleted}
              />
            ) : (
              <LessonContent
                lesson={actualCurrentLesson}
                enrollmentId={enrollment.id}
                userAnswers={actualCurrentLesson.type === 'QUIZ' ? userAnswers : []}
                onComplete={handleMarkComplete}
                isCompleted={isCurrentLessonCompleted}
              />
            )}
          </div>          {/* Lesson Navigation */}
          <div className="flex-shrink-0">
            <LessonNavigation
              previousLesson={previousLesson}
              nextLesson={nextLesson}
              onPreviousClick={goToPreviousLesson}
              onNextClick={goToNextLesson}
              isCurrentLessonCompleted={isCurrentLessonCompleted}
              onMarkComplete={handleMarkComplete}
              lessonPosition={lessonPosition}
              currentLessonType={actualCurrentLesson.type}
            />
          </div>

          {/* Course Review Section - Only show when course is 100% completed */}
          {courseProgress >= 100 && (
            <CourseReviewSection
              courseId={course.id}
              courseTitle={course.title}
              isCompleted={courseProgress >= 100}
            />
          )}
        </div>
      </div>
    </div>
  )
}
