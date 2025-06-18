'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Maximize, RotateCcw } from 'lucide-react'
import { useVideoCompletion } from '@/hooks/useVideoCompletion'

// Declaraciones de tipos para YouTube API
declare global {
  interface Window {
    YT: {
      Player: new (element: HTMLElement, config: {
        height: string
        width: string
        videoId: string
        playerVars: Record<string, number>
        events: {
          onReady: (event: { target: YouTubePlayerInstance }) => void
          onStateChange: (event: { data: number; target: YouTubePlayerInstance }) => void
        }
      }) => YouTubePlayerInstance
      PlayerState: {
        ENDED: number
        PLAYING: number
        PAUSED: number
        BUFFERING: number
        CUED: number
      }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubePlayerInstance {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number) => void
  getCurrentTime: () => number
  getDuration: () => number
}

interface YouTubePlayerProps {
  videoUrl: string
  title: string
  onComplete: () => void
  isCompleted: boolean
}

// Función para extraer el ID del video de YouTube
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

// Función para verificar si es un enlace de YouTube
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export function YouTubePlayer({ videoUrl, title, onComplete, isCompleted }: YouTubePlayerProps) {
  const [watchedPercentage, setWatchedPercentage] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const playerRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const playerInstanceRef = useRef<YouTubePlayerInstance | null>(null)

  const videoId = getYouTubeVideoId(videoUrl)
  const COMPLETION_THRESHOLD = 0.9
  
  // Use the completion hook to prevent multiple calls
  const triggerCompletion = useVideoCompletion(videoId || '', isCompleted, onComplete)

  useEffect(() => {
    if (!videoId) return

    const onPlayerReady = () => {
      // Player está listo
    }

    const onPlayerStateChange = (event: { data: number; target: YouTubePlayerInstance }) => {
      const player = event.target
      
      if (event.data === window.YT.PlayerState.PLAYING) {
        // Iniciar seguimiento de progreso
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
          if (player && typeof player.getCurrentTime === 'function' && typeof player.getDuration === 'function') {
            try {
              const currentTime = player.getCurrentTime()
              const duration = player.getDuration()
              
              if (duration > 0) {
                const percentage = (currentTime / duration) * 100
                setWatchedPercentage(percentage)                // Marcar como completado automáticamente al 90%
                if (percentage >= COMPLETION_THRESHOLD * 100) {
                  triggerCompletion()
                }
              }
            } catch (error) {
              // Ignorar errores de API
            }
          }
        }, 1000)
      } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
        // Detener seguimiento
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }        if (event.data === window.YT.PlayerState.ENDED) {
          triggerCompletion()
        }
      }
    }

    const initializePlayer = () => {
      if (!playerRef.current || playerInstanceRef.current) return

      try {
        const ytPlayer = new window.YT.Player(playerRef.current, {
          height: '390',
          width: '640',
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
          }
        })

        playerInstanceRef.current = ytPlayer
      } catch (error) {
        console.error('Error initializing YouTube player:', error)
      }
    }

    // Cargar la API de YouTube
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = initializePlayer
    } else {
      initializePlayer()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [videoId, triggerCompletion]) // Dependencias necesarias

  const restartVideo = () => {
    if (!playerInstanceRef.current) return
    try {
      playerInstanceRef.current.seekTo(0)
      playerInstanceRef.current.playVideo()
    } catch (error) {
      console.error('Error restarting video:', error)
    }
  }

  const toggleFullscreen = () => {
    if (!playerRef.current) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      playerRef.current.requestFullscreen()
    }
  }

  if (!videoId) {
    return (
      <div className="bg-gray-100 aspect-video flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">❌</div>
          <p className="text-gray-600">URL de YouTube no válida</p>
          <p className="text-sm text-gray-500">{videoUrl}</p>
        </div>
      </div>
    )
  }
  return (
    <div className="h-full flex flex-col bg-black">
      {/* YouTube Player */}
      <div 
        className="flex-1 min-h-0 relative group"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div ref={playerRef} className="w-full h-full" />
        
        {/* Custom Controls Overlay */}
        {showControls && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20" />
            
            {/* Top Controls */}
            <div className="absolute top-4 right-4 pointer-events-auto">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={restartVideo}
                  className="text-white hover:bg-white/20 bg-black/50"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 bg-black/50"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Completion Badge */}
            {isCompleted && (
              <div className="absolute top-4 left-4">
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completado
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-6 bg-white border-t flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        
        {/* Progress Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Progreso: {Math.round(watchedPercentage)}%</span>          {watchedPercentage >= COMPLETION_THRESHOLD * 100 && !isCompleted && (
            <Button
              size="sm"
              onClick={triggerCompletion}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como completado
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${watchedPercentage}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// Función helper para verificar si una URL es de YouTube
export { isYouTubeUrl }
