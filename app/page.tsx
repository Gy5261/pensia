"use client"

// Modificar el componente para reducir la agresividad de las protecciones

import SearchBar from "@/search-bar"
import { AppleEffects } from "@/components/apple-effects"
import MobileBlocker from "@/components/mobile-blocker"
import SecurityLayer from "@/components/security-layer"
import CodeProtection from "@/components/code-protection"
import { useEffect } from "react"

// Componente principal con protecciones menos agresivas
export default function Home() {
  // Aplicar protecciones básicas en el cliente
  useEffect(() => {
    // Verificar si estamos en un entorno de desarrollo o vista previa
    const isDevOrPreview =
      process.env.NODE_ENV === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("v0.dev") ||
      window.location.hostname.includes("preview") ||
      window.location.hostname === "localhost"

    // Aplicar protecciones reducidas en entornos de desarrollo
    if (isDevOrPreview) {
      console.log("Modo de desarrollo/vista previa detectado: protecciones reducidas")
      return
    }

    // Bloquear vista de código fuente
    document.addEventListener(
      "keydown",
      (e) => {
        if (e.ctrlKey && (e.key === "u" || e.key === "U")) {
          e.preventDefault()
          return false
        }
      },
      true,
    )

    // Bloquear menú contextual solo en elementos específicos
    document.addEventListener(
      "contextmenu",
      (e) => {
        const target = e.target as HTMLElement
        if (target.tagName === "HTML" || target.tagName === "BODY") {
          e.preventDefault()
          return false
        }
      },
      true,
    )

    // Mensaje en consola
    console.log("%c⚠️ ADVERTENCIA", "color: red; font-size: 24px; font-weight: bold;")
    console.log(
      "%cEsta aplicación está protegida contra inspección y extracción de código.",
      "color: white; background: black; font-size: 16px; padding: 10px;",
    )
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900/0 to-gray-900/0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-900/10 via-gray-900/0 to-gray-900/0"></div>
      <AppleEffects />
      <MobileBlocker />
      <SecurityLayer />
      <CodeProtection />
      <SearchBar />
    </main>
  )
}

