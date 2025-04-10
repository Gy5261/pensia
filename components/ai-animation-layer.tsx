"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

type AnimationState = "idle" | "activating" | "thinking" | "searching" | "responding" | "continuous" | "ending"

interface AIAnimationLayerProps {
  state: AnimationState
  complexity?: "simple" | "medium" | "complex"
  onAnimationComplete?: (state: AnimationState) => void
}

export default function AIAnimationLayer({
  state = "idle",
  complexity = "medium",
  onAnimationComplete,
}: AIAnimationLayerProps) {
  // Track previous state for transition effects
  const prevStateRef = useRef<AnimationState>("idle")

  // Actualizar las transiciones para que coincidan con las especificaciones de iOS 18.2
  // Modificar las variantes de animación para una respuesta más inmediata

  // Actualizar la función useEffect para incluir optimizaciones de rendimiento
  useEffect(() => {
    prevStateRef.current = state

    // Optimización: Precomputar animaciones para reducir la latencia
    if (state !== "idle") {
      // Forzar reflow para activar el procesamiento GPU inmediato
      document.body.offsetHeight
    }

    // Call onAnimationComplete callback if provided
    if (onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete(state)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [state, onAnimationComplete])

  // Actualizar las variantes de animación para que coincidan con iOS 18.2
  const edgeGlowVariants = {
    idle: {
      opacity: 0,
      boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
    },
    activating: {
      opacity: 1,
      boxShadow:
        "inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 255, 255, 0.15)",
      transition: { duration: 0.275, type: "spring", stiffness: 100, damping: 15 },
    },
    thinking: {
      opacity: 1,
      boxShadow:
        "inset 0 0 25px rgba(255, 255, 255, 0.4), inset 0 0 12px rgba(255, 255, 255, 0.3), 0 0 20px rgba(255, 255, 255, 0.2)",
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1], repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    searching: {
      opacity: 1,
      boxShadow:
        "inset 0 0 30px rgba(255, 255, 255, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.4), 0 0 25px rgba(255, 255, 255, 0.25)",
      transition: { duration: 1, ease: [0.4, 0, 0.2, 1], repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    responding: {
      opacity: 0.7,
      boxShadow:
        "inset 0 0 20px rgba(255, 255, 255, 0.3), inset 0 0 10px rgba(255, 255, 255, 0.2), 0 0 15px rgba(255, 255, 255, 0.15)",
      transition: { duration: 0.275, type: "spring", stiffness: 80, damping: 20 },
    },
    continuous: {
      opacity: 0.5,
      boxShadow:
        "inset 0 0 15px rgba(255, 255, 255, 0.25), inset 0 0 8px rgba(255, 255, 255, 0.15), 0 0 12px rgba(255, 255, 255, 0.1)",
      transition: { duration: 2, ease: [0.4, 0, 0.2, 1], repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    ending: {
      opacity: 0,
      boxShadow: "inset 0 0 0px rgba(0, 0, 0, 0)",
      transition: { duration: 0.275, ease: [0.4, 0, 0.2, 1] },
    },
  }

  // Corner light effect variants
  const cornerLightVariants = {
    idle: { opacity: 0, scale: 0 },
    activating: {
      opacity: [0, 0.5, 0.3],
      scale: [0, 1.2, 1],
      transition: { duration: 1.5, ease: "easeOut" },
    },
    thinking: {
      opacity: [0.2, 0.5],
      scale: [0.9, 1.1],
      transition: { duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    searching: {
      opacity: [0.3, 0.6],
      scale: [0.8, 1.2],
      transition: { duration: 2.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    responding: {
      opacity: 0.4,
      scale: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
    continuous: {
      opacity: [0.2, 0.4],
      scale: [0.95, 1.05],
      transition: { duration: 3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    ending: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
    },
  }

  // Edge wave effect variants
  const edgeWaveVariants = {
    idle: { opacity: 0, pathLength: 0 },
    activating: {
      opacity: [0, 0.5, 0.3],
      pathLength: [0, 1],
      transition: { duration: 2, ease: "easeOut" },
    },
    thinking: {
      opacity: [0.2, 0.5],
      pathLength: 1,
      transition: { duration: 3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    searching: {
      opacity: [0.3, 0.6],
      pathLength: 1,
      transition: { duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
    },
    responding: {
      opacity: 0.4,
      pathLength: 1,
      transition: { duration: 1, ease: "easeOut" },
    },
    continuous: {
      opacity: [0.2, 0.4],
      pathLength: 1,
      transition: { duration: 4, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    ending: {
      opacity: 0,
      pathLength: 0,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
    },
  }

  // Gradient overlay variants
  const gradientVariants = {
    idle: { opacity: 0 },
    activating: {
      opacity: [0, 0.12, 0.08],
      transition: { duration: 1.5, ease: "easeOut" },
    },
    thinking: {
      opacity: [0.04, 0.12],
      transition: { duration: 2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    searching: {
      opacity: [0.06, 0.15],
      transition: { duration: 2.5, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    responding: {
      opacity: 0.1,
      transition: { duration: 1, ease: "easeOut" },
    },
    continuous: {
      opacity: [0.04, 0.08],
      transition: { duration: 3, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" },
    },
    ending: {
      opacity: 0,
      transition: { duration: 0.8, ease: [0.32, 0.72, 0, 1] },
    },
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden perspective-1000">
      {/* Main edge glow effect */}
      <motion.div
        className="absolute inset-0 rounded-[32px]"
        variants={edgeGlowVariants}
        initial="idle"
        animate={state}
      />

      {/* Subtle gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[32px]"
        variants={gradientVariants}
        initial="idle"
        animate={state}
      />

      {/* Corner light effects */}
      <div className="absolute inset-0">
        {/* Top left corner */}
        <motion.div
          className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/8 blur-xl"
          variants={cornerLightVariants}
          initial="idle"
          animate={state}
        />

        {/* Top right corner */}
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/8 blur-xl"
          variants={cornerLightVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.1 }}
        />

        {/* Bottom left corner */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-white/8 blur-xl"
          variants={cornerLightVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.2 }}
        />

        {/* Bottom right corner */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/8 blur-xl"
          variants={cornerLightVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.3 }}
        />
      </div>

      {/* Edge wave effect - SVG paths that animate along the edges */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Top edge wave */}
        <motion.path
          d="M0,0 Q25,5 50,0 T100,0"
          fill="none"
          stroke="url(#edgeGradient)"
          strokeWidth="0.4"
          variants={edgeWaveVariants}
          initial="idle"
          animate={state}
        />

        {/* Bottom edge wave */}
        <motion.path
          d="M0,100 Q25,95 50,100 T100,100"
          fill="none"
          stroke="url(#edgeGradient)"
          strokeWidth="0.4"
          variants={edgeWaveVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.2 }}
        />

        {/* Left edge wave */}
        <motion.path
          d="M0,0 Q5,25 0,50 T0,100"
          fill="none"
          stroke="url(#edgeGradient)"
          strokeWidth="0.4"
          variants={edgeWaveVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.1 }}
        />

        {/* Right edge wave */}
        <motion.path
          d="M100,0 Q95,25 100,50 T100,100"
          fill="none"
          stroke="url(#edgeGradient)"
          strokeWidth="0.4"
          variants={edgeWaveVariants}
          initial="idle"
          animate={state}
          transition={{ delay: 0.3 }}
        />
      </svg>

      {/* State-specific additional effects */}
      {state === "thinking" && (
        <motion.div
          className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full"
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "100%" }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}

      {state === "searching" && (
        <motion.div
          className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-transparent via-white/20 to-transparent rounded-full"
          initial={{ opacity: 0, y: "-100%" }}
          animate={{ opacity: 1, y: "100%" }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}

      {/* Efecto de partículas flotantes para estados activos */}
      {(state === "thinking" || state === "searching" || state === "responding") && (
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20"
              initial={{
                x: Math.random() * 100 + "%",
                y: Math.random() * 100 + "%",
                opacity: 0,
              }}
              animate={{
                x: [null, Math.random() * 100 + "%", Math.random() * 100 + "%"],
                y: [null, Math.random() * 100 + "%", Math.random() * 100 + "%"],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

