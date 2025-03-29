"use client"

import React from 'react'
import { useState, useEffect } from "react"
import VideoCard from "./video-card"
import { Video } from "@/lib/data"

interface VideoGridProps {
  videos: Video[]
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  const [visibleVideos, setVisibleVideos] = useState<Video[]>([])

  useEffect(() => {
    // Add animation delay for staggered appearance
    const timer = setTimeout(() => {
      setVisibleVideos(videos)
    }, 100)

    return () => clearTimeout(timer)
  }, [videos])

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">No videos found</h2>
        <p className="text-muted-foreground">Try searching for something else</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div 
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {visibleVideos.map((video, index) => (
          <div
            key={video.id}
            className="w-full"
          >
            <VideoCard video={video} index={index} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoGrid

