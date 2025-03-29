"use client"

import { useEffect, useState } from "react"
import useFluidCursor from "@/lib/use-fluid-cursor"

const FluidCursor = () => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) return null

  useFluidCursor()

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas id="fluid" className="w-screen h-screen" />
    </div>
  )
}

export default FluidCursor 