"use client"

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [particles, setParticles] = useState<{ x: number; y: number; id: number }[]>([])

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })

      // Add particle effect
      const newParticle = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now(),
      }
      setParticles(prev => [...prev.slice(-5), newParticle]) // Keep last 5 particles
    }

    const updateCursorType = () => {
      const hoveredElement = document.elementFromPoint(mousePosition.x, mousePosition.y)
      const isClickable = hoveredElement?.matches('button, a, input, [role="button"]')
      setIsPointer(!!isClickable)
    }

    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('mouseover', updateCursorType)

    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('mouseover', updateCursorType)
    }
  }, [mousePosition.x, mousePosition.y])

  return (
    <>
      {/* Main cursor */}
      <div
        className="cursor-main"
        style={{
          transform: `translate3d(${mousePosition.x - 8}px, ${mousePosition.y - 8}px, 0) scale(${isPointer ? 1.5 : 1})`,
          transition: 'transform 0.15s ease-out'
        }}
      />

      {/* Cursor trail */}
      <div
        className="cursor-trail"
        style={{
          transform: `translate3d(${mousePosition.x - 16}px, ${mousePosition.y - 16}px, 0)`,
          transition: 'transform 0.2s ease-out'
        }}
      />

      {/* Particles */}
      {particles.map((particle, index) => (
        <div
          key={particle.id}
          className="cursor-particle"
          style={{
            left: particle.x - 2,
            top: particle.y - 2,
            opacity: 1 - (index / particles.length),
            transform: `scale(${1 - (index / particles.length)})`,
            transition: 'opacity 0.5s ease-out, transform 0.5s ease-out'
          }}
        />
      ))}
    </>
  )
}

