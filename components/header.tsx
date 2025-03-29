"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Link from "next/link"
import { Search, Moon, Sun, Menu, Bell, X, Info, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { NotificationPopup } from "@/components/notification-popup"
import * as _ from 'lodash'
import AboutUsDialog from "@/components/about-us-dialog"
import ContactDialog from "@/components/contact-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface HeaderProps {
  onSearch: (query: string) => Promise<void>
  isHomePage?: boolean
}

function Header({ onSearch, isHomePage = false }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAboutUsDialogOpen, setIsAboutUsDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  // Wait for component to mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Modified debounced search to not close the search bar
  const debouncedSearch = useCallback(
    _.debounce(async (query: string) => {
      if (query.length >= 2) {
        try {
          setIsLoading(true)
          setError(null)
          await onSearch(query)
        } catch (err) {
          console.error("Search error:", err)
          setError("Failed to search videos. Please try again.")
        } finally {
          setIsLoading(false)
        }
      }
    }, 300),
    [onSearch]
  )

  // Handle input change without closing search
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    debouncedSearch(query)
  }, [debouncedSearch])

  // Handle search submit - only close on submit
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      try {
        setIsLoading(true)
        setError(null)
        await onSearch(searchQuery)
        // Close search only if form is submitted
        if (isHomePage) {
          setIsSearchOpen(false)
          setSearchQuery("")
        }
      } catch (err) {
        setError("Failed to search videos. Please try again.")
        console.error("Search error:", err)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        if (isHomePage) {
          setIsSearchOpen(false)
          setSearchQuery("") // Clear search when closing
          setError(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isHomePage])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Caught error:', error)
      setError("Something went wrong. Please refresh the page.")
      setIsLoading(false)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  // Update the mobile search section
  const mobileSearch = (
    <div ref={searchContainerRef}>
      {isSearchOpen ? (
        <div className="fixed inset-x-0 top-0 px-4 py-3 bg-background/80 backdrop-blur-md z-50">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pr-8"
                autoFocus
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery("")
                setError(null)
              }}
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </form>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSearchOpen(true)}
        >
          <Search className="h-5 w-5" />
        </Button>
      )}
    </div>
  )

  // Update the desktop search section
  const desktopSearch = (
    <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl mx-4">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search videos..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2"
          disabled={isLoading}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </form>
  )

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isHomePage) {
      // If on home page, reload the page
      window.location.reload()
    } else {
      // If on other pages, navigate to home
      router.push('/')
    }
  }

  const handleNotificationClick = () => {
    if (isMobile) {
      router.push('/notifications') // Navigate to notifications page on mobile
    } else {
      // Use existing notification popup for desktop
      const notificationButton = document.querySelector('[aria-label="Show notifications"]') as HTMLButtonElement;
      if (notificationButton) {
        notificationButton.click();
      }
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Compute the class name based on the theme
  const headerClass = `sticky top-0 z-50 transition-all duration-300 ${
    theme === 'light' ? 'bg-white shadow-lg' : 'backdrop-blur-2xl bg-background/50'
  }`

  // Add safety check for mounting
  if (!mounted) {
    return null // Return null on server-side to prevent hydration issues
  }

  return (
    <header className={headerClass}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center gap-2"
          >
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Spectre Hub
            </span>
          </Link>

          {/* Desktop Search */}
          {!isMobile && desktopSearch}

          {/* Mobile Icons */}
          {isMobile ? (
            <div className="flex items-center gap-2">
              {/* Search Icon and Input */}
              <div ref={searchContainerRef}>
                {isSearchOpen ? (
                  <div className="fixed inset-x-0 top-0 px-4 py-3 bg-background/80 backdrop-blur-md z-50">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="search"
                          placeholder="Search videos..."
                          value={searchQuery}
                          onChange={handleSearchChange}
                          className="w-full pr-8"
                          autoFocus
                          disabled={isLoading}
                        />
                        {isLoading && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        type="button"
                        onClick={() => {
                          setIsSearchOpen(false)
                          setSearchQuery("")
                          setError(null)
                        }}
                        className="flex-shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* Profile Button - Only show when search is not open */}
              {!isSearchOpen && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="Spectre" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                    </Button>
                  </SheetTrigger>
                  <SheetContent 
                    side="right" 
                    className="w-[280px] sm:w-[340px] backdrop-blur-lg bg-background/80"
                  >
                    <div className="flex flex-col gap-6 h-full">
                      {/* Profile Section */}
                      <div className="flex items-center gap-4 pb-4 border-b">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src="/avatars/01.png" alt="Spectre" />
                          <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold">Spectre</h4>
                          <p className="text-sm text-muted-foreground">spectre@example.com</p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-col gap-4">
                        {/* Theme Toggle Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={toggleTheme}
                        >
                          <span className="text-sm font-medium">Theme</span>
                          <span className="flex items-center">
                            {theme === "dark" ? (
                              <Sun className="h-4 w-4" />
                            ) : (
                              <Moon className="h-4 w-4" />
                            )}
                          </span>
                        </Button>

                        {/* Notifications Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={handleNotificationClick}
                        >
                          <span className="text-sm font-medium">Notifications</span>
                          <Bell className="h-4 w-4" />
                        </Button>

                        {/* About Us Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={() => setIsAboutUsDialogOpen(true)}
                        >
                          <span className="text-sm font-medium">About Us</span>
                          <Info className="h-4 w-4" />
                        </Button>

                        {/* Contact Button */}
                        <Button
                          variant="ghost"
                          className="w-full justify-between px-4"
                          onClick={() => setIsContactDialogOpen(true)}
                        >
                          <span className="text-sm font-medium">Contact</span>
                          <MessageSquare className="h-4 w-4" />
                        </Button>

                        {/* Sign Out Button */}
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between px-4 text-red-500 hover:text-red-600 hover:bg-red-100/10"
                        >
                          <span className="text-sm font-medium">Sign out</span>
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          ) : (
            // Desktop icons section
            <>
              <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="h-10 w-10"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>

                {/* Notifications */}
                <NotificationPopup />

                {/* Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/avatars/01.png" alt="Spectre" />
                        <AvatarFallback>S</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsAboutUsDialogOpen(true)}>
                      About Us
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsContactDialogOpen(true)}>
                      Contact
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500">
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-full left-0 right-0 p-2 bg-destructive/10 text-destructive text-sm text-center">
          {error}
        </div>
      )}

      {/* About Us Dialog */}
      <Dialog open={isAboutUsDialogOpen} onOpenChange={setIsAboutUsDialogOpen}>
        <DialogContent className="glass-morphism sm:max-w-[525px] gap-6">
          <button
            onClick={() => setIsAboutUsDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
              About Us
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg font-medium text-foreground">
              Welcome to Spectre Hub
            </p>
            <p className="text-base text-foreground-90 leading-relaxed">
              Your premier destination for educational content and video streaming. We are dedicated to making high-quality educational resources accessible to everyone, anywhere in the world.
            </p>
            <p className="text-base text-foreground-90 leading-relaxed">
              Our platform offers a diverse range of educational videos, tutorials, and resources to support your learning journey. We believe in the power of knowledge sharing and continuous learning.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="glass-morphism-contact sm:max-w-[425px] overflow-hidden">
          <button
            onClick={() => setIsContactDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Contact Us
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
            <div className="contact-info-card glass-card">
              <div className="space-y-4">
                {/* Phone Contact */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">📞</span>
                    <div>
                      <p className="font-medium text-foreground">Phone</p>
                      <a href="tel:+919798292134" className="text-foreground-90 break-all">
                        +91 9798292134
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Email Contact */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">✉️</span>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <a href="mailto:preetam@engineer.com" className="text-foreground-90 break-all">
                        preetam@engineer.com
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Academic Email */}
                <div className="contact-item glass-item group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🎓</span>
                    <div>
                      <p className="font-medium text-foreground">Academic</p>
                      <a href="mailto:preetam.kumar.cs.2022@mitmeerut.ac.in" className="text-foreground-90 break-all">
                        preetam.kumar.cs.2022@mitmeerut.ac.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Section */}
            <div className="contact-whatsapp-card glass-card">
              <a 
                href="https://wa.me/+919798292134" 
                target="_blank" 
                rel="noopener noreferrer"
                className="whatsapp-button glass-button group"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    className="w-6 h-6 fill-current text-[#25D366] group-hover:scale-110 transition-transform"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span className="font-medium text-foreground">Contact on WhatsApp</span>
                </div>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}

export default Header

