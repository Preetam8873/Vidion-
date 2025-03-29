"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import VideoPlayer from "@/components/video-player"
import VideoInfo from "@/components/video-info"
import RelatedVideos from "@/components/related-videos"
import CommentSection from "@/components/comment-section"
import { videos } from "@/lib/data"

export default function VideoPage() {
  const params = useParams()
  const router = useRouter()
  const [currentVideo, setCurrentVideo] = useState(null)

  useEffect(() => {
    if (params?.id) {
      const videoId = Array.isArray(params.id) ? params.id[0] : params.id
      const foundVideo = videos.find(v => v.id === parseInt(videoId))
      setCurrentVideo(foundVideo)
    }
  }, [params])

  // Handle search functionality
  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/?search=${encodeURIComponent(query)}`)
    }
  }

  if (!currentVideo) {
    return (
      <>
        <Header onSearch={handleSearch} />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading video...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <main className="min-h-screen">
      <Header onSearch={handleSearch} />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <VideoPlayer video={currentVideo} />
            <VideoInfo video={currentVideo} />
            <CommentSection videoId={currentVideo.id} />
          </div>
          <div className="lg:col-span-1">
            <RelatedVideos currentVideo={currentVideo} videos={videos} />
          </div>
        </div>
      </div>
    </main>
  )
}

