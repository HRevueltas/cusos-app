'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'
import { KeyboardShortcuts } from './keyboard-shortcuts'
import { useVideoCompletion } from '@/hooks/useVideoCompletion'

interface RegularVideoPlayerProps {
  videoUrl: string
  title: string
  onComplete: () => void
  isCompleted: boolean
}

export function RegularVideoPlayer({ videoUrl, title, onComplete, isCompleted }: RegularVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [watchedPercentage, setWatchedPercentage] = useState(0)
  const [showControls, setShowControls] = useState(true)
  
  // Marcar como completado cuando se ve el 90% del video
  const COMPLETION_THRESHOLD = 0.9
  
  // Use the completion hook to prevent multiple calls
  const triggerCompletion = useVideoCompletion(videoUrl, isCompleted, onComplete)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
      const percentage = (video.currentTime / video.duration) * 100
      setWatchedPercentage(percentage)      // Marcar como completado automáticamente al 90%
      if (percentage >= COMPLETION_THRESHOLD * 100) {
        triggerCompletion()
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [isCompleted, onComplete, triggerCompletion])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
    } else {
      video.pause()
    }
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    video.currentTime = percent * video.duration
  }

  const toggleFullscreen = () => {
    const video = videoRef.current
    if (!video) return

    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      video.requestFullscreen()
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  const restartVideo = () => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = 0
    video.play()
  }

  const seekForward = () => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.min(video.currentTime + 10, video.duration)
  }

  const seekBackward = () => {
    const video = videoRef.current
    if (!video) return
    
    video.currentTime = Math.max(video.currentTime - 10, 0)
  }
  return (
    <div className="bg-black relative group">
      {/* Keyboard Shortcuts */}
      <KeyboardShortcuts
        onTogglePlay={togglePlay}
        onSeekForward={seekForward}
        onSeekBackward={seekBackward}
        onToggleMute={toggleMute}
        onToggleFullscreen={toggleFullscreen}
        onMarkComplete={onComplete}
        onPreviousLesson={() => {}} // Will be handled by parent
        onNextLesson={() => {}} // Will be handled by parent
        isEnabled={true}
      />

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video"
        src={videoUrl}
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        Tu navegador no soporta la reproducción de video.
      </video>

      {/* Video Controls Overlay */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        
        {/* Center Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 rounded-full w-16 h-16"
            >
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-4"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <span className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={restartVideo}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Completion Badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completado
          </div>
        </div>
      )}

      {/* Video Info */}
      <div className="p-6 bg-white border-b">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        
        {/* Progress Info */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Progreso: {Math.round(watchedPercentage)}%</span>
          {watchedPercentage >= COMPLETION_THRESHOLD * 100 && !isCompleted && (
            <Button
              size="sm"
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Marcar como completado
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
