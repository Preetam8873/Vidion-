"use client"

import { useState, useEffect } from "react"
import VideoGrid from "@/components/video-grid"
import Header from "@/components/header"
import { Video, videos } from "@/lib/data"
import { shuffleArray } from "@/lib/utils"

// Helper function to perform search
const fetchSearchResults = (query: string) => {
  return new Promise((resolve) => {
    // Filter videos locally based on title and description
    const results = videos.filter((video) => {
      const searchTerm = query.toLowerCase()
      return (
        video.title.toLowerCase().includes(searchTerm) ||
        video.description.toLowerCase().includes(searchTerm)
      )
    })
    resolve(results)
  })
}

export default function Home() {
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Shuffle videos on initial load
  useEffect(() => {
    if (Array.isArray(videos) && videos.length > 0) {
      setFilteredVideos(shuffleArray(videos));
    } else {
      console.error("Videos array is not defined or empty");
    }
  }, [])

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true)

      if (!query.trim()) {
        // When search is cleared, show random videos again
        if (Array.isArray(videos) && videos.length > 0) {
          setFilteredVideos(shuffleArray(videos));
        }
        return
      }

      // Search logic
      const results = videos.filter((video) => {
        const searchTerm = query.toLowerCase()
        return (
          video.title.toLowerCase().includes(searchTerm) ||
          video.description.toLowerCase().includes(searchTerm)
        )
      })
      
      setFilteredVideos(results)
    } catch (error) {
      console.error('Search error:', error)
      if (Array.isArray(videos) && videos.length > 0) {
        setFilteredVideos(shuffleArray(videos)); // Show random videos on error
      }
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Header 
        onSearch={handleSearch} 
        isHomePage={true} 
      />
      <section className="container mx-auto px-4 py-6 md:py-10">
        {isSearching ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <VideoGrid videos={filteredVideos} />
        )}
      </section>
    </main>
  )
}

