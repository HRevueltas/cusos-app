import { useCallback, useRef } from 'react'

export function useVideoCompletion(lessonId: string, isCompleted: boolean, onComplete: () => void) {
  const hasCalledCompletionRef = useRef(false)
  const currentLessonIdRef = useRef(lessonId)
  
  // Reset when lesson changes
  if (currentLessonIdRef.current !== lessonId) {
    hasCalledCompletionRef.current = false
    currentLessonIdRef.current = lessonId
  }
  
  // Reset when lesson becomes incomplete
  if (!isCompleted && hasCalledCompletionRef.current) {
    hasCalledCompletionRef.current = false
  }
  
  const triggerCompletion = useCallback(() => {
    if (!hasCalledCompletionRef.current && !isCompleted) {
      hasCalledCompletionRef.current = true
      onComplete()
    }
  }, [isCompleted, onComplete])
  
  return triggerCompletion
}
 