'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuizQuestion {
  id: string
  question: string
  order: number
  options: {
    id: string
    text: string
    isCorrect: boolean
    order: number
  }[]
}

interface QuizPlayerProps {
  lessonId: string
  title: string
  questions: QuizQuestion[]
  enrollmentId: string
  userAnswers?: {
    questionId: string
    optionId: string
    answeredAt: Date
  }[]
  onComplete: () => void
  isCompleted: boolean
}

export function QuizPlayer({
  lessonId,
  title,
  questions,
  enrollmentId,
  userAnswers = [],
  onComplete,
  isCompleted
}: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  // Inicializar respuestas del usuario si ya existen
  useEffect(() => {
    if (userAnswers.length > 0) {
      const answers: Record<string, string> = {}
      userAnswers.forEach(answer => {
        answers[answer.questionId] = answer.optionId
      })
      setSelectedAnswers(answers)
      setShowResults(true)
      setQuizCompleted(true)
    }
  }, [userAnswers])

  const currentQuestion = questions[currentQuestionIndex]
  const totalQuestions = questions.length
  const hasAnsweredCurrent = selectedAnswers[currentQuestion?.id]

  // Calcular resultados
  const calculateResults = () => {
    let correctCount = 0
    questions.forEach(question => {
      const selectedOptionId = selectedAnswers[question.id]
      const selectedOption = question.options.find(opt => opt.id === selectedOptionId)
      if (selectedOption?.isCorrect) {
        correctCount++
      }
    })
    return {
      correctCount,
      totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100)
    }
  }

  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (showResults) return // No permitir cambios si ya se muestran resultados
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length !== totalQuestions) {
      alert('Por favor responde todas las preguntas antes de enviar')
      return
    }

    setIsSubmitting(true)
    try {
      // Enviar respuestas al servidor
      const response = await fetch(`/api/student/quiz/${lessonId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          answers: Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
            questionId,
            optionId
          }))
        })
      })

      if (response.ok) {
        setShowResults(true)
        setQuizCompleted(true)
        
        // Si el porcentaje es >= 70%, marcar como completado
        const results = calculateResults()
        if (results.percentage >= 70) {
          onComplete()
        }
      } else {
        throw new Error('Error al enviar el quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Error al enviar el quiz. Inténtalo de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetryQuiz = async () => {
    try {
      // Eliminar respuestas anteriores
      await fetch(`/api/student/quiz/${lessonId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId })
      })

      // Reiniciar estado
      setSelectedAnswers({})
      setShowResults(false)
      setQuizCompleted(false)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error('Error resetting quiz:', error)
      alert('Error al reiniciar el quiz. Inténtalo de nuevo.')
    }
  }

  if (!currentQuestion && !showResults) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No hay preguntas disponibles para este quiz.</p>
      </div>
    )
  }

  // Vista de resultados
  if (showResults) {
    const results = calculateResults()
    const passed = results.percentage >= 70

    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {passed ? (
                <Trophy className="h-16 w-16 text-yellow-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {passed ? '¡Felicitaciones!' : 'Quiz Completado'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-4xl font-bold">
              <span className={passed ? 'text-green-600' : 'text-red-600'}>
                {results.percentage}%
              </span>
            </div>
            <p className="text-lg text-gray-600">
              Respondiste correctamente {results.correctCount} de {results.totalQuestions} preguntas
            </p>
            
            {passed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  ¡Excelente trabajo! Has pasado el quiz con una puntuación de {results.percentage}%.
                  {isCompleted && ' Esta lección ya está marcada como completada.'}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Necesitas al menos 70% para pasar el quiz. ¡No te preocupes, puedes intentarlo de nuevo!
                </p>
              </div>
            )}

            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowResults(false)}
                variant="outline"
              >
                Revisar Respuestas
              </Button>
              {!passed && (
                <Button
                  onClick={handleRetryQuiz}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar de Nuevo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revisión de respuestas */}
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold">Revisión de Respuestas</h3>
          {questions.map((question, index) => {
            const selectedOptionId = selectedAnswers[question.id]
            const selectedOption = question.options.find(opt => opt.id === selectedOptionId)
            const correctOption = question.options.find(opt => opt.isCorrect)
            const isCorrect = selectedOption?.isCorrect

            return (
              <Card key={question.id} className="overflow-hidden">
                <CardHeader className={cn(
                  "pb-3",
                  isCorrect ? "bg-green-50 border-b border-green-200" : "bg-red-50 border-b border-red-200"
                )}>
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        Pregunta {index + 1}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{question.question}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    {question.options.map((option) => {
                      const isSelected = option.id === selectedOptionId
                      const isCorrectOption = option.isCorrect

                      return (
                        <div
                          key={option.id}
                          className={cn(
                            "p-3 rounded-lg border text-sm",
                            isCorrectOption && "bg-green-50 border-green-200 text-green-800",
                            isSelected && !isCorrectOption && "bg-red-50 border-red-200 text-red-800",
                            !isSelected && !isCorrectOption && "bg-gray-50 border-gray-200"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {isCorrectOption && <CheckCircle className="h-4 w-4 text-green-600" />}
                            {isSelected && !isCorrectOption && <XCircle className="h-4 w-4 text-red-600" />}
                            <span>{option.text}</span>
                            {isSelected && <span className="text-xs">(Tu respuesta)</span>}
                            {isCorrectOption && <span className="text-xs">(Respuesta correcta)</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Vista del quiz
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header del quiz */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Pregunta {currentQuestionIndex + 1} de {totalQuestions}
          </div>
          <div className="text-sm text-gray-600">
            {Object.keys(selectedAnswers).length}/{totalQuestions} respondidas
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Pregunta actual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id

              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                  className={cn(
                    "w-full p-4 text-left rounded-lg border transition-all",
                    "hover:bg-gray-50",
                    isSelected
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex-shrink-0",
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    )}>
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white scale-50" />
                      )}
                    </div>
                    <span className="text-sm">{option.text}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          variant="outline"
        >
          Anterior
        </Button>

        <div className="flex gap-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-medium",
                index === currentQuestionIndex
                  ? "bg-blue-600 text-white"
                  : selectedAnswers[questions[index].id]
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
              )}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex === totalQuestions - 1 ? (
          <Button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== totalQuestions || isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Quiz'}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!hasAnsweredCurrent}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
