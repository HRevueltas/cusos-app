"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Trash2, Check } from "lucide-react"

interface QuizOption {
  id?: string
  text: string
  isCorrect: boolean
  order: number
}

interface QuizQuestion {
  id?: string
  question: string
  order: number
  options: QuizOption[]
}

interface QuizFormProps {
  questions: QuizQuestion[]
  onChange: (questions: QuizQuestion[]) => void
  disabled?: boolean
}

export function QuizForm({ questions, onChange, disabled = false }: QuizFormProps) {
  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      question: "",
      order: questions.length + 1,
      options: [
        { text: "", isCorrect: true, order: 1 },
        { text: "", isCorrect: false, order: 2 },
        { text: "", isCorrect: false, order: 3 },
        { text: "", isCorrect: false, order: 4 }
      ]
    }
    onChange([...questions, newQuestion])
  }

  const removeQuestion = (questionIndex: number) => {
    const updatedQuestions = questions.filter((_, index) => index !== questionIndex)
    onChange(updatedQuestions)
  }

  const updateQuestion = (questionIndex: number, updatedQuestion: QuizQuestion) => {
    const updatedQuestions = questions.map((question, index) => 
      index === questionIndex ? updatedQuestion : question
    )
    onChange(updatedQuestions)
  }

  const updateQuestionText = (questionIndex: number, text: string) => {
    const question = questions[questionIndex]
    updateQuestion(questionIndex, { ...question, question: text })
  }

  const updateOptionText = (questionIndex: number, optionIndex: number, text: string) => {
    const question = questions[questionIndex]
    const updatedOptions = question.options.map((option, index) => 
      index === optionIndex ? { ...option, text } : option
    )
    updateQuestion(questionIndex, { ...question, options: updatedOptions })
  }

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    const updatedOptions = question.options.map((option, index) => ({
      ...option,
      isCorrect: index === optionIndex
    }))
    updateQuestion(questionIndex, { ...question, options: updatedOptions })
  }

  const addOption = (questionIndex: number) => {
    const question = questions[questionIndex]
    const newOption: QuizOption = {
      text: "",
      isCorrect: false,
      order: question.options.length + 1
    }
    updateQuestion(questionIndex, {
      ...question,
      options: [...question.options, newOption]
    })
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const question = questions[questionIndex]
    if (question.options.length <= 2) return // Mínimo 2 opciones

    const updatedOptions = question.options.filter((_, index) => index !== optionIndex)
    // Si eliminamos la opción correcta, hacer correcta la primera
    const hasCorrectOption = updatedOptions.some(option => option.isCorrect)
    if (!hasCorrectOption && updatedOptions.length > 0) {
      updatedOptions[0].isCorrect = true
    }
    
    updateQuestion(questionIndex, { ...question, options: updatedOptions })
  }

  const getQuestionErrors = (question: QuizQuestion, index: number) => {
    const errors: string[] = []
    
    if (!question.question.trim()) {
      errors.push("La pregunta es obligatoria")
    }
    
    const validOptions = question.options.filter(option => option.text.trim())
    if (validOptions.length < 2) {
      errors.push("Debe tener al menos 2 opciones válidas")
    }
    
    const correctOptions = question.options.filter(option => option.isCorrect && option.text.trim())
    if (correctOptions.length === 0) {
      errors.push("Debe marcar una opción como correcta")
    }
    
    return errors
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Preguntas del Quiz</h3>
          <p className="text-sm text-gray-600">
            Agrega preguntas de opción múltiple para evaluar a los estudiantes
          </p>
        </div>
        <Button 
          type="button" 
          onClick={addQuestion}
          disabled={disabled}
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Pregunta
        </Button>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay preguntas todavía
            </h3>
            <p className="text-gray-600 mb-4">
              Comienza agregando la primera pregunta de tu quiz
            </p>
            <Button onClick={addQuestion} disabled={disabled}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Pregunta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {questions.map((question, questionIndex) => {
            const errors = getQuestionErrors(question, questionIndex)
            const hasErrors = errors.length > 0

            return (
              <Card key={questionIndex} className={hasErrors ? "border-red-200" : ""}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      Pregunta {questionIndex + 1}
                      {hasErrors && (
                        <Badge variant="destructive" className="ml-2">
                          {errors.length} error{errors.length > 1 ? 'es' : ''}
                        </Badge>
                      )}
                    </CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuestion(questionIndex)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Texto de la pregunta */}
                  <div className="space-y-2">
                    <Label htmlFor={`question-${questionIndex}`}>
                      Pregunta *
                    </Label>
                    <Input
                      id={`question-${questionIndex}`}
                      value={question.question}
                      onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
                      placeholder="Escribe tu pregunta aquí..."
                      disabled={disabled}
                    />
                  </div>

                  {/* Opciones */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Opciones de respuesta *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                        disabled={disabled || question.options.length >= 6}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Opción
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setCorrectOption(questionIndex, optionIndex)}
                            disabled={disabled}
                            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              option.isCorrect
                                ? "bg-green-500 border-green-500 text-white"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            {option.isCorrect && <Check className="h-3 w-3" />}
                          </button>
                          
                          <Input
                            value={option.text}
                            onChange={(e) => updateOptionText(questionIndex, optionIndex, e.target.value)}
                            placeholder={`Opción ${optionIndex + 1}`}
                            disabled={disabled}
                            className="flex-1"
                          />
                          
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeOption(questionIndex, optionIndex)}
                              disabled={disabled}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-600">
                      Haz clic en el círculo para marcar la respuesta correcta
                    </p>
                  </div>

                  {/* Errores */}
                  {hasErrors && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <ul className="text-sm text-red-600 space-y-1">
                        {errors.map((error, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 flex-shrink-0" />
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center gap-2 text-blue-700">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Resumen del Quiz</span>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            {questions.length} pregunta{questions.length > 1 ? 's' : ''} configurada{questions.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
