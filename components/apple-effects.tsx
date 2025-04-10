"use client"

import { useEffect, useRef } from "react"

export function AppleEffects() {
  const ambientLightRef = useRef<HTMLDivElement | null>(null)

  // Efecto de brillo dinámico para elementos PensIA
  const handleMouseMove = (e: MouseEvent) => {
    const pensiaGlowElements = document.querySelectorAll(".pensia-glow") as NodeListOf<HTMLElement>

    pensiaGlowElements.forEach((element) => {
      const rect = element.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Solo aplicar el efecto si el mouse está cerca del elemento
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2))
      const maxDistance = Math.max(window.innerWidth, window.innerHeight) / 2

      if (distance < maxDistance) {
        element.style.setProperty("--x", `${x}%`)
        element.style.setProperty("--y", `${y}%`)

        // Aplicar un sutil efecto 3D
        const tiltX = (y - 50) / 20
        const tiltY = (x - 50) / -20
        element.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`
      } else {
        element.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)"
      }
    })
  }

  useEffect(() => {
    // Parallax effect based on device orientation
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return

      const containers = document.querySelectorAll(".parallax-container") as NodeListOf<HTMLElement>

      containers.forEach((container) => {
        // Limit the tilt effect
        const tiltX = Math.min(Math.max(e.gamma / 3, -10), 10)
        const tiltY = Math.min(Math.max(e.beta / 3, -10), 10)

        container.style.transform = `rotateX(${-tiltY}deg) rotateY(${tiltX}deg)`

        const elements = container.querySelectorAll(".parallax-element") as NodeListOf<HTMLElement>
        elements.forEach((element) => {
          element.style.transform = `translateZ(20px) rotateX(${tiltY * 0.5}deg) rotateY(${-tiltX * 0.5}deg)`
        })
      })
    }

    // Efecto de desplazamiento suave en scroll
    const handleScroll = () => {
      const floatElements = document.querySelectorAll(".float-on-scroll") as NodeListOf<HTMLElement>

      floatElements.forEach((element) => {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0

        if (isVisible) {
          const scrollProgress = 1 - rect.top / window.innerHeight
          const translateY = Math.min(scrollProgress * 20, 20)
          element.style.transform = `translateY(-${translateY}px)`
          element.style.opacity = Math.min(0.5 + scrollProgress, 1).toString()
        }
      })
    }

    // Add event listeners
    window.addEventListener("deviceorientation", handleDeviceOrientation)
    window.addEventListener("scroll", handleScroll)
    window.addEventListener("mousemove", handleMouseMove)

    // Add dynamic-light class to elements
    const appleUiElements = document.querySelectorAll(".apple-ui") as NodeListOf<HTMLElement>
    appleUiElements.forEach((element) => {
      element.classList.add("parallax-container")
      element.classList.add("edge-highlight")
      element.classList.add("pensia-glow")

      // Find child elements to add parallax effect
      const children = element.querySelectorAll("button, input")
      children.forEach((child) => {
        child.classList.add("parallax-element")
      })
    })

    // Añadir clases de PensIA a elementos específicos
    const visionosGlassElements = document.querySelectorAll(".visionos-glass") as NodeListOf<HTMLElement>
    visionosGlassElements.forEach((element) => {
      element.classList.add("pensia-glow")
      element.classList.add("float-subtle")
    })

    // Cleanup
    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  return null
}

