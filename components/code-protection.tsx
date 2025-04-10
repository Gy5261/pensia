"use client"

import { useEffect } from "react"

export default function CodeProtection() {
  // Modificar la función useEffect para reducir la agresividad de las protecciones

  useEffect(() => {
    // Verificar si estamos en un entorno de desarrollo o vista previa
    const isDevOrPreview =
      process.env.NODE_ENV === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("v0.dev") ||
      window.location.hostname.includes("preview") ||
      window.location.hostname.includes("localhost") ||
      window.location.hostname === "localhost"

    // Si estamos en entorno de desarrollo o vista previa, aplicar protecciones mínimas
    if (isDevOrPreview) {
      console.log("Modo de desarrollo/vista previa detectado: protecciones reducidas")

      // Aplicar solo protecciones básicas
      const blockViewSource = (e: KeyboardEvent) => {
        if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
          e.preventDefault()
          return false
        }
      }

      window.addEventListener("keydown", blockViewSource)

      return () => {
        window.removeEventListener("keydown", blockViewSource)
      }
    }

    // Verificación de integridad básica
    const verifyIntegrity = () => {
      // Verificar que el componente no ha sido modificado
      // Esta es una implementación simplificada
      const selfChecksum = "pensia-2025-integrity"
      const storedChecksum = localStorage.getItem("integrity_check")

      if (!storedChecksum) {
        localStorage.setItem("integrity_check", selfChecksum)
      }
      // Eliminar la redirección que causa problemas
    }

    // Protección contra inyecciones
    const preventInjection = () => {
      // Verificar si hay scripts inyectados
      const scripts = document.querySelectorAll("script:not([data-integrity])")
      const allowedScripts = ["react", "next", "framer", "vercel"]

      scripts.forEach((script) => {
        const src = script.getAttribute("src") || ""
        const isAllowed = allowedScripts.some((allowed) => src.includes(allowed))

        if (!isAllowed && src && !src.startsWith("/")) {
          console.warn("Script potencialmente malicioso detectado:", src)
          // No eliminar scripts, solo advertir
        }
      })
    }

    // Validación de origen
    const validateOrigin = () => {
      // Lista ampliada de dominios permitidos
      const allowedOrigins = [
        "localhost",
        "vercel.app",
        "pensia.com",
        "v0.dev",
        "preview.app.github.dev",
        "github.dev",
        "stackblitz.io",
        "codesandbox.io",
        "replit.com",
        "glitch.me",
      ]

      // Permitir cualquier subdominio de vercel.app
      const isVercelPreview = window.location.hostname.endsWith("vercel.app")

      // Permitir dominios de vista previa de v0
      const isV0Preview = window.location.hostname.includes("v0.dev")

      // Comprobar si el dominio está en la lista o es un dominio de vista previa
      const isAllowedOrigin =
        allowedOrigins.some((origin) => window.location.hostname.includes(origin)) ||
        isVercelPreview ||
        isV0Preview ||
        // En desarrollo, permitir cualquier dominio
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost"

      if (!isAllowedOrigin) {
        console.error("Ejecución en dominio no autorizado:", window.location.hostname)
        // No modificar el DOM, solo advertir
      }
    }

    // Protección contra extracción de código
    const protectSourceCode = () => {
      // Deshabilitar selección de texto solo en elementos críticos
      document.querySelectorAll(".protected-code").forEach((el) => {
        ;(el as HTMLElement).style.userSelect = "none"
      })

      // Deshabilitar vista de código fuente
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "u") {
          e.preventDefault()
          return false
        }
      })
    }

    // Ejecutar verificaciones básicas
    verifyIntegrity()
    preventInjection()
    validateOrigin()
    protectSourceCode()

    // Verificación periódica menos frecuente
    const integrityInterval = setInterval(() => {
      verifyIntegrity()
      preventInjection()
    }, 10000) // Reducir frecuencia a 10 segundos

    return () => {
      clearInterval(integrityInterval)
    }
  }, [])

  return null
}

