"use client"

import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { videos } from "@/lib/data" // Import your video data

// Define the Notification type
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  thumbnail: string;
  url: string;
}

// Function to generate random time strings
const getRandomTime = () => {
  const times = [
    "just now",
    "56 seconds ago",
    "2 minutes ago",
    "5 minutes ago",
    "10 minutes ago",
    "30 minutes ago",
    "1 hour ago",
    "2 hours ago",
    "1 day ago",
    "3 days ago",
    "1 week ago",
    "2 weeks ago",
    "4 weeks ago",
  ];
  return times[Math.floor(Math.random() * times.length)];
};

// Function to get random videos
const getRandomVideos = (videoArray: any[], count: number) => {
  const shuffled = videoArray.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const fetchData = async () => {
  try {
    const response = await fetch('/your-api-endpoint', {
      method: 'GET', // or POST, PUT, DELETE
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error; // Re-throw to handle it in the component
  }
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]); // Use the Notification type
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Get 11 random videos from the imported video data
    const randomVideos = getRandomVideos(videos, 11);

    // Generate notifications based on the random videos
    const generatedNotifications = randomVideos.map(video => ({
      id: video.id.toString(),
      title: video.title,
      message: `Check out our latest video titled "${video.title}!"`,
      time: getRandomTime(),
      thumbnail: video.thumbnail,
      url: `/video/${video.id}`, // Ensure this points to the video player page
    })).sort((a, b) => b.id - a.id); // Sort to have latest first

    setNotifications(generatedNotifications);
  }, []); // Empty dependency array to run only once on mount

  const handleVideoClick = (url: string) => {
    router.push(url); // Navigate to the video player page
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    // Only trigger search if query is 2 or more characters
    if (query.length >= 2) {
      // Implement the filtering logic
      const results = notifications.filter(notification => 
        notification.title.toLowerCase().includes(query.toLowerCase()) ||
        notification.message.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredNotifications(results)
    } else {
      // If search query is less than 2 characters, show all notifications
      setFilteredNotifications(notifications)
    }
  }

  return (
    <div className="min-h-screen bg-background backdrop-blur-lg">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-background/80 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {/* Search input */}
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search notifications..."
            className="w-full p-2 border rounded"
          />

          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => handleVideoClick(notification.url)} // Navigate to video on click
            >
              <img 
                src={notification.thumbnail} 
                alt={notification.title} 
                className="h-16 w-24 rounded-md mr-4" // Thumbnail styling
              />
              <div>
                <h3 className="font-medium">{notification.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
                <span className="text-xs text-muted-foreground mt-2 block">
                  {notification.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 
