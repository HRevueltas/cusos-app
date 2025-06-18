'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { StickyNote, Save, Trash2, Edit, Clock } from 'lucide-react'

interface Note {
  id: string
  content: string
  timestamp?: number // For video notes
  createdAt: Date
  updatedAt: Date
}

interface LessonNotesProps {
  lessonId: string
  lessonTitle: string
  currentVideoTime?: number
  isVideoLesson?: boolean
}

export function LessonNotes({ 
  lessonId, 
  lessonTitle, 
  currentVideoTime = 0,
  isVideoLesson = false 
}: LessonNotesProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadNotes()
  }, [lessonId])

  const loadNotes = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/student/notes?lessonId=${lessonId}`)
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveNote = async () => {
    if (!newNote.trim()) return

    try {
      setIsSaving(true)
      const noteData = {
        lessonId,
        content: newNote.trim(),
        timestamp: isVideoLesson ? Math.floor(currentVideoTime) : undefined
      }

      const response = await fetch('/api/student/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
      })

      if (response.ok) {
        const savedNote = await response.json()
        setNotes(prev => [savedNote.note, ...prev])
        setNewNote('')
      }
    } catch (error) {
      console.error('Error saving note:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateNote = async (noteId: string) => {
    if (!editContent.trim()) return

    try {
      const response = await fetch(`/api/student/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent.trim() })
      })

      if (response.ok) {
        setNotes(prev => prev.map(note => 
          note.id === noteId 
            ? { ...note, content: editContent.trim(), updatedAt: new Date() }
            : note
        ))
        setEditingNote(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('Error updating note:', error)
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta nota?')) return

    try {
      const response = await fetch(`/api/student/notes/${noteId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId))
      }
    } catch (error) {
      console.error('Error deleting note:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Cargando notas...</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="h-5 w-5 text-yellow-600" />
        <h3 className="font-semibold text-gray-900">
          Mis Notas - {lessonTitle}
        </h3>
      </div>

      {/* New Note Form */}
      <div className="space-y-3 mb-6">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={isVideoLesson 
            ? `Agregar nota en ${formatTime(currentVideoTime)}...`
            : "Agregar una nueva nota..."
          }
          className="min-h-[100px]"
        />
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {isVideoLesson && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Tiempo: {formatTime(currentVideoTime)}
              </span>
            )}
          </div>
          <Button
            onClick={saveNote}
            disabled={!newNote.trim() || isSaving}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar nota'}
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <StickyNote className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No tienes notas para esta lección</p>
            <p className="text-sm">¡Agrega tu primera nota arriba!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              {editingNote === note.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateNote(note.id)}
                      size="sm"
                    >
                      Guardar
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingNote(null)
                        setEditContent('')
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {note.timestamp !== undefined && (
                        <span className="flex items-center gap-1 bg-yellow-200 px-2 py-1 rounded-full text-xs">
                          <Clock className="h-3 w-3" />
                          {formatTime(note.timestamp)}
                        </span>
                      )}
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        onClick={() => {
                          setEditingNote(note.id)
                          setEditContent(note.content)
                        }}
                        variant="ghost"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => deleteNote(note.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
