"use client"

import { useEffect, useRef } from "react"
import { ShieldAlert } from "lucide-react"

export default function SecurityLayer() {
  const warningRef = useRef<HTMLDivElement>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Modificar la función useEffect para reducir la agresividad de las protecciones

  useEffect(() => {
    // Verificar si estamos en un entorno de desarrollo o vista previa
    const isDevOrPreview =
      process.env.NODE_ENV === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("v0.dev") ||
      window.location.hostname.includes("preview") ||
      window.location.hostname.includes("localhost")

    // Función para mostrar advertencia temporal
    const showWarning = (message: string) => {
      if (warningRef.current) {
        warningRef.current.textContent = message
        warningRef.current.style.display = "flex"

        // Limpiar timeout anterior si existe
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current)
        }

        // Ocultar después de 3 segundos
        warningTimeoutRef.current = setTimeout(() => {
          if (warningRef.current) {
            warningRef.current.style.display = "none"
          }
        }, 3000)
      }
    }

    // 1. Bloquear teclas de inspección principales, pero de forma menos agresiva
    const blockInspectKeys = (e: KeyboardEvent) => {
      // Bloquear F12
      if (e.key === "F12") {
        e.preventDefault()
        showWarning("Acceso al código fuente bloqueado")
        return false
      }

      // Bloquear Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
        (e.ctrlKey && (e.key === "U" || e.key === "u"))
      ) {
        e.preventDefault()
        showWarning("Acceso al código fuente bloqueado")
        return false
      }
    }

    // 2. Bloquear menú contextual solo en elementos específicos, no en toda la página
    const blockContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      // Solo bloquear en elementos específicos o en el body/html
      if (target.tagName === "HTML" || target.tagName === "BODY" || target.classList.contains("protected-element")) {
        e.preventDefault()
        showWarning("Menú contextual deshabilitado")
        return false
      }
    }

    // 3. Detectar DevTools de forma menos agresiva
    // Eliminar la detección por tamaño de ventana que causa falsos positivos

    // 4. Permitir selección de texto en elementos de entrada
    document.querySelectorAll("input, textarea").forEach((el) => {
      ;(el as HTMLElement).style.userSelect = "text"
    })

    // Añadir listeners solo si no estamos en modo desarrollo muy específico
    if (!window.location.hostname.includes("v0.dev")) {
      window.addEventListener("keydown", blockInspectKeys)
      window.addEventListener("contextmenu", blockContextMenu)

      // Eliminar la detección agresiva por debugger y resize
    }

    // Limpiar al desmontar
    return () => {
      window.removeEventListener("keydown", blockInspectKeys)
      window.removeEventListener("contextmenu", blockContextMenu)

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Mensaje de advertencia flotante */}
      <div
        ref={warningRef}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-md shadow-lg z-[9999] items-center gap-2 hidden"
        style={{ display: "none" }}
      >
        <ShieldAlert className="w-4 h-4" />
        <span>Acceso al código fuente bloqueado</span>
      </div>

      {/* CSS para bloquear selección de texto */}
      <style jsx global>{`
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Permitir selección solo en campos de entrada */
        input, textarea {
          -webkit-user-select: text;
          -khtml-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
      `}</style>
    </>
  )
}

