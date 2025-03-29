"use client"

import React from 'react'
import { Video } from '@/lib/data'
import Image from 'next/image'

interface VideoCardProps {
  video: Video
  index: number
}

const VideoCard: React.FC<VideoCardProps> = ({ video, index }) => {
  return (
    <div 
      className="group relative bg-card rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      style={{
        opacity: 0,
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s forwards`
      }}
    >
      <div className="aspect-video relative">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">{video.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{video.uploader}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <span>{video.views.toLocaleString()} views</span>
          <span className="mx-2">•</span>
          <span>{video.uploadDate}</span>
        </div>
      </div>
    </div>
  )
}

export default VideoCard

