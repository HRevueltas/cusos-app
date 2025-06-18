'use client'

import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onTogglePlay: () => void
  onSeekForward: () => void
  onSeekBackward: () => void
  onToggleMute: () => void
  onToggleFullscreen: () => void
  onMarkComplete: () => void
  onPreviousLesson: () => void
  onNextLesson: () => void
  isEnabled?: boolean
}

export function KeyboardShortcuts({
  onTogglePlay,
  onSeekForward,
  onSeekBackward,
  onToggleMute,
  onToggleFullscreen,
  onMarkComplete,
  onPreviousLesson,
  onNextLesson,
  isEnabled = true
}: KeyboardShortcutsProps) {
  
  useEffect(() => {
    if (!isEnabled) return

    const handleKeyPress = (event: KeyboardEvent) => {
      // Evitar conflictos con inputs y textareas
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Prevenir comportamiento por defecto para las teclas que manejamos
      const handledKeys = [' ', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'f', 'F', 'm', 'M', 'c', 'C']
      if (handledKeys.includes(event.key)) {
        event.preventDefault()
      }

      switch (event.key) {
        case ' ': // Spacebar - Play/Pause
          onTogglePlay()
          break
        case 'ArrowLeft': // Left Arrow - Seek backward 10s
          onSeekBackward()
          break
        case 'ArrowRight': // Right Arrow - Seek forward 10s
          onSeekForward()
          break
        case 'ArrowUp': // Up Arrow - Previous lesson
          if (event.shiftKey) {
            onPreviousLesson()
          }
          break
        case 'ArrowDown': // Down Arrow - Next lesson
          if (event.shiftKey) {
            onNextLesson()
          }
          break
        case 'f':
        case 'F': // F - Toggle fullscreen
          onToggleFullscreen()
          break
        case 'm':
        case 'M': // M - Toggle mute
          onToggleMute()
          break
        case 'c':
        case 'C': // C - Mark complete
          if (event.ctrlKey || event.metaKey) {
            onMarkComplete()
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [
    isEnabled,
    onTogglePlay,
    onSeekForward,
    onSeekBackward,
    onToggleMute,
    onToggleFullscreen,
    onMarkComplete,
    onPreviousLesson,
    onNextLesson
  ])

  return null // This component doesn't render anything
}

// Component to show keyboard shortcuts help
export function KeyboardShortcutsHelp() {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg text-sm space-y-3">
      <h3 className="font-semibold text-lg mb-3">Atajos de teclado</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-300">Reproducción</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Reproducir/Pausar</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">Espacio</kbd>
            </div>
            <div className="flex justify-between">
              <span>Retroceder 10s</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd>
            </div>
            <div className="flex justify-between">
              <span>Avanzar 10s</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd>
            </div>
            <div className="flex justify-between">
              <span>Silenciar</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">M</kbd>
            </div>
            <div className="flex justify-between">
              <span>Pantalla completa</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">F</kbd>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="font-medium text-gray-300">Navegación</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Lección anterior</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">Shift + ↑</kbd>
            </div>
            <div className="flex justify-between">
              <span>Lección siguiente</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">Shift + ↓</kbd>
            </div>
            <div className="flex justify-between">
              <span>Marcar completado</span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">Ctrl + C</kbd>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-2 border-t border-gray-700">
        <p className="text-xs text-gray-400">
          Los atajos funcionan cuando no estás escribiendo en un campo de texto.
        </p>
      </div>
    </div>
  )
}
