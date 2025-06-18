'use client'

import { useMemo } from 'react'
import { YouTubePlayer } from './youtube-player'
import { RegularVideoPlayer } from './regular-video-player'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onComplete: () => void
  isCompleted: boolean
}

// Función para verificar si una URL es de YouTube
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export function VideoPlayer({ videoUrl, title, onComplete, isCompleted }: VideoPlayerProps) {
  // Determinar el tipo de video al inicio
  const isYouTube = useMemo(() => isYouTubeUrl(videoUrl), [videoUrl])
  
  // Renderizar el reproductor apropiado
  if (isYouTube) {
    return (
      <YouTubePlayer
        videoUrl={videoUrl}
        title={title}
        onComplete={onComplete}
        isCompleted={isCompleted}
      />
    )
  }

  return (
    <RegularVideoPlayer
      videoUrl={videoUrl}
      title={title}
      onComplete={onComplete}
      isCompleted={isCompleted}
    />
  )
}
