'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles = []
      const count = Math.floor((canvas.width * canvas.height) / 15000)

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.2
        })
      }
    }

    const drawParticle = (p: Particle) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(96, 165, 250, ${p.opacity})`
      ctx.fill()
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.12 * (1 - distance / 150)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
    }

    const updateParticles = () => {
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      })
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Gradient background com tons de azul claro
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#f0f9ff')
      gradient.addColorStop(0.5, '#e0f2fe')
      gradient.addColorStop(1, '#dbeafe')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      drawConnections()
      particles.forEach(drawParticle)
      updateParticles()

      animationId = requestAnimationFrame(animate)
    }

    resize()
    createParticles()
    animate()

    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10"
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    />
  )
}
