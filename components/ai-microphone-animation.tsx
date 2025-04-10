"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

type MicrophoneState = "idle" | "activating" | "listening" | "processing" | "responding" | "ending" | "quick-ending"

interface AIMicrophoneAnimationProps {
  state: MicrophoneState
  audioLevel?: number // 0-1 value representing audio input level
  onAnimationComplete?: (state: MicrophoneState) => void
  onClose?: () => void
}

export default function AIMicrophoneAnimation({
  state = "idle",
  audioLevel = 0,
  onAnimationComplete,
  onClose,
}: AIMicrophoneAnimationProps) {
  const [audioWaves, setAudioWaves] = useState<number[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const prevStateRef = useRef<MicrophoneState>("idle")

  // Add a timeout mechanism to handle no-speech scenarios
  useEffect(() => {
    // Set a timeout for the listening state to prevent it from running indefinitely
    let listenTimeout: NodeJS.Timeout | null = null

    if (state === "listening") {
      // If we're in listening state for more than 15 seconds with no significant audio,
      // automatically transition to processing
      listenTimeout = setTimeout(() => {
        if (audioLevel < 0.1) {
          // If audio level is very low
          if (onAnimationComplete) {
            onAnimationComplete("processing")
          }
        }
      }, 15000)
    }

    return () => {
      if (listenTimeout) {
        clearTimeout(listenTimeout)
      }
    }
  }, [state, audioLevel, onAnimationComplete])

  // Generate audio wave heights based on audio level
  useEffect(() => {
    if (state === "listening") {
      // Create 20 wave bars with varying heights based on audioLevel
      const newWaves = Array.from({ length: 20 }, () => {
        // Base height plus random variation, scaled by audioLevel
        // Ensure there's always some minimal movement even with low audio
        const minHeight = 0.05
        const randomFactor = 0.2 + Math.random() * 0.8
        return Math.max(minHeight, Math.min(1, randomFactor * (audioLevel || 0.2)))
      })
      setAudioWaves(newWaves)
    }
  }, [state, audioLevel])

  // Particle animation for processing state
  useEffect(() => {
    if (state !== "processing" || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 200
    canvas.height = 200

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string
      alpha: number

      constructor() {
        this.x = canvas.width / 2
        this.y = canvas.height / 2
        this.size = Math.random() * 3 + 1
        const angle = Math.random() * Math.PI * 2
        const speed = Math.random() * 1 + 0.5
        this.speedX = Math.cos(angle) * speed
        this.speedY = Math.sin(angle) * speed

        // Gradient colors from white to light blue
        const hue = 210 + Math.random() * 30 // Light blue hue range
        this.color = `hsla(${hue}, 100%, 90%`
        this.alpha = Math.random() * 0.5 + 0.3
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        // Gradually reduce size
        if (this.size > 0.2) this.size -= 0.03
      }

      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `${this.color}, ${this.alpha})`
        ctx.fill()
      }
    }

    // Create particles
    const particles: Particle[] = []
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Add new particles occasionally
      if (Math.random() < 0.1 && particles.length < 100) {
        particles.push(new Particle())
      }

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()

        // Remove tiny particles
        if (particles[i].size <= 0.2) {
          particles.splice(i, 1)
          i--
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [state])

  // Track state changes and call onAnimationComplete
  useEffect(() => {
    if (state !== prevStateRef.current && onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete(state)
      }, 1000)

      prevStateRef.current = state
      return () => clearTimeout(timer)
    }
  }, [state, onAnimationComplete])

  // Variants for the microphone icon
  const microphoneVariants = {
    idle: {
      scale: 1,
      filter: "brightness(1)",
      y: 0,
    },
    activating: {
      scale: [1, 1.2, 1],
      filter: "brightness(1.2)",
      y: [0, -5, 0],
      transition: { duration: 0.6, type: "spring", stiffness: 300, damping: 15 },
    },
    listening: {
      scale: [0.95, 1.05],
      filter: "brightness(1.3)",
      y: [0, -2, 0],
      transition: { duration: 0.8, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    processing: {
      scale: 1,
      filter: "brightness(1.1)",
      y: 0,
      transition: { duration: 0.3, type: "spring", stiffness: 200, damping: 20 },
    },
    responding: {
      scale: 1,
      filter: "brightness(1.05)",
      y: 0,
      transition: { duration: 0.3 },
    },
    ending: {
      scale: [1, 0.8, 0],
      filter: "brightness(1)",
      y: [0, 5, 20],
      opacity: [1, 0.8, 0],
      transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
    },
    "quick-ending": {
      scale: [1, 0.8, 0],
      filter: "brightness(0.9)",
      opacity: [1, 0.8, 0],
      y: [0, 10, 20],
      transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
    },
  }

  // Variants for the edge glow
  const edgeGlowVariants = {
    idle: {
      opacity: 0,
      boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
    },
    activating: {
      opacity: 1,
      boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
    listening: {
      opacity: 1,
      boxShadow: "inset 0 0 40px rgba(255, 255, 255, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.4)",
      transition: { duration: 0.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    processing: {
      opacity: 1,
      boxShadow: "inset 0 0 50px rgba(255, 255, 255, 0.7), inset 0 0 25px rgba(255, 255, 255, 0.5)",
      transition: { duration: 1, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    responding: {
      opacity: 0.7,
      boxShadow: "inset 0 0 30px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.3)",
      transition: { duration: 1.5, ease: "easeOut" },
    },
    ending: {
      opacity: 0,
      boxShadow: "inset 0 0 0px rgba(0, 0, 0, 0)",
      transition: { duration: 0.8, ease: "easeOut" },
    },
    "quick-ending": {
      opacity: 0,
      boxShadow: "inset 0 0 0px rgba(0, 0, 0, 0)",
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  // Variants for the background blur
  const backgroundBlurVariants = {
    idle: {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
    },
    activating: {
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(0, 0, 0, 0.15)",
      transition: { duration: 0.6, type: "spring", stiffness: 100, damping: 15 },
    },
    listening: {
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(0, 0, 0, 0.15)",
    },
    processing: {
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(0, 0, 0, 0.15)",
    },
    responding: {
      backdropFilter: "blur(20px)",
      backgroundColor: "rgba(0, 0, 0, 0.15)",
    },
    ending: {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.6, ease: [0.32, 0.72, 0, 1] },
    },
    "quick-ending": {
      backdropFilter: "blur(0px)",
      backgroundColor: "rgba(0, 0, 0, 0)",
      transition: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
    },
  }

  // Variants for the light trail
  const lightTrailVariants = {
    idle: {
      opacity: 0,
      x: "-100%",
    },
    listening: {
      opacity: 0.7,
      x: "100%",
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
    processing: {
      opacity: 0.5,
      x: "100%",
      transition: {
        duration: 3,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      },
    },
    default: {
      opacity: 0,
      x: "-100%",
      transition: { duration: 0.5 },
    },
  }

  // Variants for the close button
  const closeButtonVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 25,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Determine if we should show particles
  const showParticles = state === "activating" || state === "processing"

  // Determine if we should show audio waves
  const showAudioWaves = state === "listening"

  // Determine if we should show the light trail
  const showLightTrail = (state === "listening" || state === "processing") && state !== "quick-ending"

  // Determine if we should show the close button
  const showCloseButton = state === "listening"

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center perspective-1000">
      {/* Background blur */}
      <motion.div
        className="absolute inset-0 rounded-[32px]"
        variants={backgroundBlurVariants}
        initial="idle"
        animate={state}
      />

      {/* Edge glow effect */}
      <motion.div
        className="absolute inset-0 rounded-[32px]"
        variants={edgeGlowVariants}
        initial="idle"
        animate={state}
      />

      {/* Light trail at bottom */}
      {showLightTrail && (
        <motion.div
          className="absolute bottom-10 h-0.5 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-full"
          variants={lightTrailVariants}
          initial="idle"
          animate={state === "listening" ? "listening" : state === "processing" ? "processing" : "default"}
        />
      )}

      {/* Microphone animation container */}
      <div className="relative">
        {/* Microphone icon with animation */}
        <motion.div
          className="relative z-10 bg-white rounded-full p-6 shadow-[0_10px_25px_rgba(0,0,0,0.2)] border border-white/20"
          variants={microphoneVariants}
          initial="idle"
          animate={state}
          whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
        >
          {/* Indicador de "Grabando" */}
          {state === "listening" && (
            <motion.div
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
            >
              Grabando...
            </motion.div>
          )}

          <svg viewBox="0 0 24 24" className="w-12 h-12 text-gray-800" fill="none" xmlns="http://www.w3.org/2000/svg">
            {state === "listening" ? (
              <>
                <rect x="11" y="2" width="2" height="20" rx="1" fill="currentColor" />
                <rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="16" y="6" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="1" y="9" width="2" height="6" rx="1" fill="currentColor" />
                <rect x="21" y="9" width="2" height="6" rx="1" fill="currentColor" />
              </>
            ) : (
              <>
                <rect x="2" y="10" width="2" height="4" rx="1" fill="currentColor" />
                <rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="10" y="2" width="2" height="20" rx="1" fill="currentColor" />
                <rect x="14" y="6" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="18" y="8" width="2" height="8" rx="1" fill="currentColor" />
                <rect x="22" y="10" width="2" height="4" rx="1" fill="currentColor" />
              </>
            )}
          </svg>
        </motion.div>

        {/* Close button that appears when listening */}
        <AnimatePresence>
          {showCloseButton && (
            <motion.button
              className="absolute -top-3 -right-3 bg-white rounded-full p-1 shadow-lg z-20 pointer-events-auto"
              variants={closeButtonVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={onClose}
              aria-label="Close voice input"
            >
              <X className="w-5 h-5 text-gray-800" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Audio waves animation */}
        {showAudioWaves && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 flex items-center justify-center">
            <div className="flex items-end justify-center gap-[2px] w-full h-full">
              {audioWaves.map((height, index) => (
                <motion.div
                  key={index}
                  className="w-1 bg-gradient-to-t from-blue-300 to-white rounded-full"
                  initial={{ height: 0 }}
                  animate={{
                    height: `${height * 100}%`,
                    backgroundColor: index % 3 === 0 ? "#60A5FA" : index % 3 === 1 ? "#93C5FD" : "#BFDBFE",
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                    delay: index * 0.01,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Particles for activation and processing */}
        {showParticles && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {state === "activating" ? (
              <div className="w-40 h-40">
                {Array.from({ length: 12 }).map((_, index) => (
                  <motion.div
                    key={index}
                    className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white"
                    initial={{
                      x: 0,
                      y: 0,
                      opacity: 0.8,
                    }}
                    animate={{
                      x: Math.cos(index * ((Math.PI * 2) / 12)) * 60,
                      y: Math.sin(index * ((Math.PI * 2) / 12)) * 60,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 1.5,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </div>
            ) : (
              <canvas ref={canvasRef} className="w-[200px] h-[200px]" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

