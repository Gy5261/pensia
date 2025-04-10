"use client"

import { useEffect, useRef } from "react"

interface TouchFeedbackOptions {
  targetSelector?: string
  feedbackDuration?: number
  feedbackOpacity?: number
  useGPU?: boolean
}

export function useTouchFeedback(options: TouchFeedbackOptions = {}) {
  const { targetSelector = ".touch-feedback", feedbackDuration = 0.275, feedbackOpacity = 0.2, useGPU = true } = options

  const touchStartTimeRef = useRef<number>(0)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent | MouseEvent) => {
      // Registrar el tiempo de inicio para medir la latencia
      touchStartTimeRef.current = performance.now()

      // Obtener el elemento objetivo
      const target = e.target as HTMLElement
      const feedbackElement = target.closest(targetSelector) as HTMLElement

      if (!feedbackElement) return

      // Optimización: Forzar el uso de GPU para renderizado
      if (useGPU) {
        feedbackElement.style.willChange = "transform, opacity"
        feedbackElement.style.transform = "translateZ(0)"
      }

      // Calcular la posición del toque relativa al elemento
      let x, y

      if ("touches" in e) {
        const touch = e.touches[0]
        const rect = feedbackElement.getBoundingClientRect()
        x = ((touch.clientX - rect.left) / rect.width) * 100
        y = ((touch.clientY - rect.top) / rect.height) * 100
      } else {
        const rect = feedbackElement.getBoundingClientRect()
        x = ((e.clientX - rect.left) / rect.width) * 100
        y = ((e.clientY - rect.top) / rect.height) * 100
      }

      // Aplicar las variables CSS para el efecto de feedback
      feedbackElement.style.setProperty("--touch-x", `${x}%`)
      feedbackElement.style.setProperty("--touch-y", `${y}%`)

      // Crear y añadir el elemento de feedback
      const feedback = document.createElement("div")
      feedback.className = "touch-feedback-ripple"
      feedback.style.position = "absolute"
      feedback.style.top = "0"
      feedback.style.left = "0"
      feedback.style.right = "0"
      feedback.style.bottom = "0"
      feedback.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, ${feedbackOpacity}) 0%, transparent 70%)`
      feedback.style.opacity = "0"
      feedback.style.pointerEvents = "none"
      feedback.style.transition = `opacity ${feedbackDuration}s cubic-bezier(0.4, 0, 0.2, 1)`

      feedbackElement.appendChild(feedback)

      // Forzar reflow para activar la transición
      feedback.offsetHeight

      // Mostrar el feedback
      requestAnimationFrame(() => {
        feedback.style.opacity = "1"
      })

      // Medir y registrar la latencia
      const latency = performance.now() - touchStartTimeRef.current
      console.log(`Touch feedback latency: ${latency.toFixed(2)}ms`)
    }

    const handleTouchEnd = (e: TouchEvent | MouseEvent) => {
      // Obtener el elemento objetivo
      const target = e.target as HTMLElement
      const feedbackElement = target.closest(targetSelector) as HTMLElement

      if (!feedbackElement) return

      // Encontrar y eliminar todos los elementos de feedback
      const feedbacks = feedbackElement.querySelectorAll(".touch-feedback-ripple")

      feedbacks.forEach((feedback) => {
        const element = feedback as HTMLElement
        element.style.opacity = "0"

        // Eliminar el elemento después de la transición
        setTimeout(() => {
          if (element.parentNode === feedbackElement) {
            feedbackElement.removeChild(element)
          }
        }, feedbackDuration * 1000)
      })

      // Restaurar las propiedades de optimización
      if (useGPU) {
        setTimeout(() => {
          feedbackElement.style.willChange = "auto"
        }, feedbackDuration * 1000)
      }
    }

    // Registrar los eventos de toque y clic
    document.addEventListener("touchstart", handleTouchStart, { passive: true })
    document.addEventListener("mousedown", handleTouchStart)
    document.addEventListener("touchend", handleTouchEnd)
    document.addEventListener("mouseup", handleTouchEnd)

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
      document.removeEventListener("mousedown", handleTouchStart)
      document.removeEventListener("touchend", handleTouchEnd)
      document.removeEventListener("mouseup", handleTouchEnd)
    }
  }, [targetSelector, feedbackDuration, feedbackOpacity, useGPU])
}

