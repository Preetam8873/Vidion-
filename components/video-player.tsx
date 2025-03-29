"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, Settings, X } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function VideoPlayer({ video }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [volume, setVolume] = useState(100)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [quality, setQuality] = useState("auto")
  const [speed, setSpeed] = useState("1")
  const [isControlsVisible, setIsControlsVisible] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [videoError, setVideoError] = useState(false)

  const playerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setVideoError(true)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (value) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
      setIsMuted(newVolume === 0)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0)
      setIsLoading(false)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime
      const duration = videoRef.current.duration
      setCurrentTime(currentTime)
      setProgress((currentTime / duration) * 100)
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newProgress = value[0]
    if (videoRef.current && videoRef.current.duration) {
      videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration
      setProgress(newProgress)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (playerRef.current?.requestFullscreen) {
        playerRef.current.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  const handleSpeedChange = (value) => {
    setSpeed(value)
    if (videoRef.current) {
      videoRef.current.playbackRate = Number.parseFloat(value)
    }
  }

  const showControls = () => {
    setIsControlsVisible(true)
    clearTimeout(controlsTimeoutRef.current)

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        if (!hovering) {
          setIsControlsVisible(false)
        }
      }, 3000)
    }
  }

  // Reset state when video changes
  useEffect(() => {
    setIsLoading(true)
    setIsPlaying(false)
    setCurrentTime(0)
    setProgress(0)
    setVideoError(false)

    // Cleanup function
    return () => {
      clearTimeout(controlsTimeoutRef.current!)
    }
  }, [video.id])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "k") {
        e.preventDefault()
        togglePlay()
      } else if (e.key === "m") {
        toggleMute()
      } else if (e.key === "f") {
        toggleFullscreen()
      } else if (e.key === "ArrowRight") {
        if (videoRef.current) {
          videoRef.current.currentTime += 10
        }
      } else if (e.key === "ArrowLeft") {
        if (videoRef.current) {
          videoRef.current.currentTime -= 10
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying, isMuted])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && videoRef.current) {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isPlaying])

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY)

      // Auto-minimize when scrolling down past the player
      if (playerRef.current) {
        const playerRect = playerRef.current.getBoundingClientRect()
        if (playerRect.bottom < 0 && isPlaying && !isMinimized) {
          setIsMinimized(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isPlaying, isMinimized])

  // Preload next video
  useEffect(() => {
    if (video?.url) {
      const preloadLink = document.createElement('link')
      preloadLink.rel = 'preload'
      preloadLink.as = 'video'
      preloadLink.href = video.url
      document.head.appendChild(preloadLink)
    }
  }, [video?.url])

  // Optimize video loading
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.preload = "auto"
      videoRef.current.loading = "eager"
    }
  }, [])

  // Determine if we should use iframe or video element based on video URL
  const isIframe =
    video.url.includes("youtube.com") ||
    video.url.includes("drive.google.com") ||
    video.url.includes("dailymotion.com") ||
    video.url.includes("bitchute.com") ||
    video.url.includes("odysee.com") ||
    video.url.includes("rumble.com")

  return (
    <div className="relative w-full overflow-hidden">
      <div
        ref={playerRef}
        className="relative aspect-video w-full rounded-lg overflow-hidden bg-black group"
        onMouseMove={showControls}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {isIframe ? (
          // Iframe for embedded videos
          <iframe
            ref={iframeRef}
            src={video.url}
            className="w-full h-full"
            allowFullScreen
            onLoad={handleIframeLoad}
            title={video.title}
            loading="eager"
            priority="true"
          />
        ) : (
          // Native video player for direct video files
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            poster={video.thumbnail}
            preload="auto"
            playsInline
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            onError={() => {
              setVideoError(true)
              setIsLoading(false)
            }}
            style={{
              width: '100%',
              height: '100%',
              maxWidth: '100vw',
            }}
          >
            <source src={video.url} type="video/mp4" />
          </video>
        )}

        {/* Error message */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center p-4">
              <p className="text-white text-lg mb-2">Unable to play this video</p>
              <p className="text-gray-300 text-sm mb-4">The video might be unavailable or in an unsupported format.</p>
              <Button onClick={() => setVideoError(false)}>Dismiss</Button>
            </div>
          </div>
        )}

        {/* Big play button in center when paused (only for direct video files) */}
        {!isIframe && !isPlaying && !videoError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <div className="w-20 h-20 bg-black/60 rounded-full flex items-center justify-center">
              <Play className="h-10 w-10 text-white" fill="white" />
            </div>
          </div>
        )}

        {/* Controls (only for direct video files) */}
        {!isIframe && !videoError && (
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${isControlsVisible ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex flex-col gap-2">
              {/* Progress bar */}
              <div className="px-2">
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={handleProgressChange}
                  className="w-full [&>span:first-child]:h-1.5 [&>span:first-child]:bg-black/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-4 [&_[role=slider]]:h-4 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-2 [&_[role=slider]:focus-visible]:ring-offset-2"
                />
              </div>

              {/* Main controls */}
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="h-9 w-9 text-white hover:bg-white/20"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20">
                    <SkipForward className="h-5 w-5" />
                  </Button>

                  <div className="flex items-center gap-1 group/volume">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="h-9 w-9 text-white hover:bg-white/20"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>

                    <div className="w-0 overflow-hidden transition-all duration-200 group-hover/volume:w-20">
                      <Slider
                        value={[volume]}
                        min={0}
                        max={100}
                        step={1}
                        onValueChange={handleVolumeChange}
                        className="w-20 [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:bg-white [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-white [&_[role=slider]:focus-visible]:ring-2 [&_[role=slider]:focus-visible]:ring-offset-2"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-white ml-2 hidden sm:block">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-9 w-9 text-white hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize className="h-5 w-5" /> : <Minimize className="h-5 w-5" />}
                  </Button>
                  <div className="hidden sm:block">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-white hover:bg-white/20">
                          <Settings className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="p-2">
                          <div className="mb-2 text-xs font-semibold">Playback Speed</div>
                          <DropdownMenuRadioGroup value={speed} onValueChange={handleSpeedChange}>
                            <DropdownMenuRadioItem value="0.25">0.25x</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="0.75">0.75x</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="1">Normal</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="1.25">1.25x</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </div>
                        <div className="p-2 pt-0">
                          <div className="mb-2 text-xs font-semibold">Quality</div>
                          <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                            <DropdownMenuRadioItem value="auto">Auto</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="1080p">1080p</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="720p">720p</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="480p">480p</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="360p">360p</DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="h-9 w-9 text-white hover:bg-white/20"
                  >
                    {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mini Player (only for direct video files) */}
      {!isIframe && isMinimized && isPlaying && (
        <div
          className="fixed bottom-4 right-4 w-72 aspect-video bg-black rounded-lg shadow-lg z-50 overflow-hidden transition-all duration-300 hover:scale-105"
          style={{ transform: isMinimized ? "translate(0, 0)" : "translate(100%, 100%)" }}
        >
          <video
            className="w-full h-full"
            autoPlay
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={video.url} type="video/mp4" />
          </video>

          <div className="absolute top-2 right-2 flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(false)}
              className="h-6 w-6 bg-black/60 text-white hover:bg-black/80"
            >
              <Maximize className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsPlaying(false)
                setIsMinimized(false)
              }}
              className="h-6 w-6 bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

