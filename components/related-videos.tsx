"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import type { Video } from "@/lib/data"
import { useMediaQuery } from "@/hooks/use-media-query"

function RelatedVideoItem({ 
  video, 
  index, 
  isVisible,
  isMobile
}: { 
  video: Video, 
  index: number, 
  isVisible: boolean,
  isMobile?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  if (isMobile) {
    return (
      <div
        className={`transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        <Link href={`/video/${video.id}`} className="block">
          <Card className="overflow-hidden hover:bg-accent/50 transition-colors duration-200">
            <CardContent className="p-0">
              <div className="flex flex-col">
                <div className="relative w-full aspect-video bg-muted">
                  <Image
                    src={video.thumbnail || "/placeholder.svg"}
                    alt={video.title}
                    fill
                    className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                    sizes="(max-width: 768px) 100vw, 160px"
                    onLoad={() => setImageLoaded(true)}
                    loading={index < 3 ? "eager" : "lazy"}
                  />
                  {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse"></div>}
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {video.views} views
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium line-clamp-2">{video.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{video.uploader}</p>
                  <p className="text-sm text-muted-foreground">{video.uploadDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    )
  }

  return (
    <Link href={`/video/${video.id}`}>
      <Card
        className={`overflow-hidden hover:bg-accent/50 transition-all duration-300 transform ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        }`}
        style={{ transitionDelay: `${Math.min(index * 30, 300)}ms` }}
      >
        <CardContent className="p-0">
          <div className="flex gap-2">
            <div className="relative w-40 h-24 bg-muted">
              <Image
                src={video.thumbnail || "/placeholder.svg?height=100&width=160"}
                alt={video.title}
                fill
                className={`object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                sizes="160px"
                onLoad={() => setImageLoaded(true)}
                loading={index < 3 ? "eager" : "lazy"}
              />
              {!imageLoaded && <div className="absolute inset-0 bg-muted animate-pulse"></div>}
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                {video.views} views
              </div>
            </div>
            <div className="flex-1 p-2">
              <h4 className="font-medium line-clamp-2 text-sm">{video.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{video.uploader}</p>
              <p className="text-xs text-muted-foreground">{video.uploadDate}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

interface RelatedVideosProps {
  currentVideo?: Video
  videos: Video[]
}

export default function RelatedVideos({ currentVideo, videos }: RelatedVideosProps) {
  const [visibleVideos, setVisibleVideos] = useState<Video[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!currentVideo || !videos?.length) {
      setVisibleVideos([])
      return
    }

    try {
      // Find the index of current video
      const currentIndex = videos.findIndex(v => v.id === currentVideo.id)
      
      if (currentIndex === -1) {
        // If video not found, show first 10 videos
        setVisibleVideos(videos.slice(0, 10))
        return
      }

      // Get next videos in sequence
      const nextVideos = videos.slice(currentIndex + 1, currentIndex + 11)
      
      // If we don't have enough next videos, add some from the beginning
      if (nextVideos.length < 10) {
        const remainingCount = 10 - nextVideos.length
        const videosFromStart = videos.slice(0, remainingCount)
        setVisibleVideos([...nextVideos, ...videosFromStart])
      } else {
        setVisibleVideos(nextVideos)
      }
    } catch (error) {
      console.error('Error in RelatedVideos:', error)
      setVisibleVideos([])
    }
  }, [currentVideo, videos])

  if (!videos?.length) {
    return <div className="text-muted-foreground">No related videos found</div>
  }

  if (!isMounted) {
    return <div className="space-y-3 h-[500px]"></div> // Return empty container for SSR
  }

  return (
    <div className={isMobile ? "space-y-4 mt-6" : "space-y-3"}>
      {visibleVideos.map((video, index) => (
        <RelatedVideoItem 
          key={`${video.id}-${index}`}
          video={video} 
          index={index} 
          isVisible={isMounted} // Only animate when mounted
          isMobile={isMobile}
        />
      ))}
    </div>
  )
}