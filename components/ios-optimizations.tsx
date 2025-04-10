"use client"

import { useEffect } from "react"
import { useTouchFeedback } from "@/hooks/use-touch-feedback"

export default function IOSOptimizations() {
  // Aplicar efectos de feedback táctil
  useTouchFeedback({
    targetSelector: ".touch-feedback, button, .ios-button",
    feedbackDuration: 0.275,
    feedbackOpacity: 0.15,
  })

  useEffect(() => {
    // Optimizaciones para reducir la latencia de entrada
    const optimizeInputLatency = () => {
      // Aplicar clases de optimización a elementos interactivos
      const interactiveElements = document.querySelectorAll("button, a, input, .interactive")

      interactiveElements.forEach((element) => {
        // Añadir clases de optimización
        element.classList.add("touch-responsive", "gpu-accelerated")

        // Optimizar para eventos táctiles
        element.setAttribute("touch-action", "manipulation")

        // Eliminar delay táctil en móviles
        if (element instanceof HTMLElement) {
          element.style.touchAction = "manipulation"
        }
      })

      // Optimizar animaciones
      const animatedElements = document.querySelectorAll(".animated, .motion-div, [data-animate]")

      animatedElements.forEach((element) => {
        element.classList.add("gpu-accelerated")

        if (element instanceof HTMLElement) {
          element.style.willChange = "transform, opacity"
        }
      })
    }

    // Optimizaciones para el renderizado paralelo
    const optimizeParallelRendering = () => {
      // Precargar recursos críticos
      const preloadResources = () => {
        // Precargar imágenes críticas
        const criticalImages = document.querySelectorAll("img[data-critical='true']")
        criticalImages.forEach((img) => {
          if (img instanceof HTMLImageElement && img.dataset.src) {
            const preloadLink = document.createElement("link")
            preloadLink.rel = "preload"
            preloadLink.as = "image"
            preloadLink.href = img.dataset.src
            document.head.appendChild(preloadLink)
          }
        })

        // Precomputar animaciones
        const precomputeAnimations = () => {
          const animatedElements = document.querySelectorAll(".ios-animation")
          animatedElements.forEach((element) => {
            if (element instanceof HTMLElement) {
              // Forzar reflow para precomputar estilos
              element.offsetHeight
            }
          })
        }

        // Ejecutar precomputación en idle
        if ("requestIdleCallback" in window) {
          ;(window as any).requestIdleCallback(precomputeAnimations)
        } else {
          setTimeout(precomputeAnimations, 1)
        }
      }

      preloadResources()
    }

    // Optimizaciones para la respuesta táctil
    const optimizeTouchResponse = () => {
      // Capturar eventos táctiles en la fase de captura para reducir latencia
      document.addEventListener("touchstart", () => {}, { passive: true, capture: true })

      // Optimizar scrolling
      const scrollContainers = document.querySelectorAll(".scroll-container, [data-scroll]")
      scrollContainers.forEach((container) => {
        container.classList.add("ios-scroll")
      })
    }

    // Aplicar todas las optimizaciones
    optimizeInputLatency()
    optimizeParallelRendering()
    optimizeTouchResponse()

    // Monitorear el rendimiento
    const monitorPerformance = () => {
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry) => {
            if (entry.entryType === "first-input") {
              console.log(`First Input Delay: ${entry.processingStart - entry.startTime}ms`)
            }
          })
        })

        observer.observe({ entryTypes: ["first-input", "layout-shift", "largest-contentful-paint"] })
      }
    }

    monitorPerformance()

    return () => {
      // Limpiar optimizaciones si es necesario
    }
  }, [])

  return null
}

