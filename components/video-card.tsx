"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Play, Clock, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Video } from "@/lib/data"

interface VideoCardProps {
  video: Video
  index: number
}

function VideoCard({ video, index }: VideoCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isWatchedLater, setIsWatchedLater] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
  const cardRef = useRef(null)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const [imageError, setImageError] = useState(false)
  
  // Fallback image URL
  const fallbackImage = "/placeholder.jpg" // Add a placeholder image in your public folder
  
  // Validate thumbnail URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const thumbnailUrl = isValidUrl(video.thumbnail) ? video.thumbnail : fallbackImage

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "200px",
      },
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current && observer) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  const handleWatchLaterClick = () => {
    setIsWatchedLater(!isWatchedLater)
  }

  const handleLikeClick = () => {
    setIsLiked(!isLiked)
  }

  const handleTitleClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking title
    setIsDescriptionVisible(!isDescriptionVisible)
  }

  return (
    <div className="group relative">
      <div className="block">
        {/* Thumbnail Container with 16:9 ratio */}
        <Link href={`/video/${video.id}`} className="block">
          <div className="relative w-full pb-[56.25%] overflow-hidden bg-muted rounded-lg">
            <Image
              src={imageError ? fallbackImage : thumbnailUrl}
              alt={video.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={index < 4}
            />
          </div>
        </Link>
        
        {/* Video Info */}
        <div className="mt-3">
          <h3 
            className="font-semibold line-clamp-2 cursor-pointer hover:text-primary transition-colors"
            onClick={handleTitleClick}
          >
            {video.title}
          </h3>
          
          {/* Animated Description */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isDescriptionVisible ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
            )}
          >
            <p className="text-sm text-muted-foreground">{video.description}</p>
          </div>

          <p className="text-sm text-muted-foreground mt-1">{video.uploader}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{video.views.toLocaleString()} views</span>
            <span>•</span>
            <span>{video.uploadDate}</span>
          </div>
        </div>
      </div>

      {/* Watch Later and Like Buttons */}
      <div
        className={cn(
          "flex items-center justify-between px-2 pb-1 pt-0 transition-opacity duration-300",
          isHovered || isWatchedLater || isLiked ? "opacity-100" : "opacity-0"
        )}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs h-7 ${isWatchedLater ? 'text-green-500' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            handleWatchLaterClick();
          }}
        >
          <Clock className="h-3 w-3 mr-1" /> 
          {isWatchedLater ? 'Added' : 'Watch Later'}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`text-xs h-7 ${isLiked ? 'text-red-500' : ''}`} 
          onClick={(e) => {
            e.stopPropagation();
            handleLikeClick();
          }}
        >
          <Heart className="h-3 w-3 mr-1" /> 
          {isLiked ? 'Liked' : video.likes}
        </Button>
      </div>
    </div>
  )
}

export default VideoCard

