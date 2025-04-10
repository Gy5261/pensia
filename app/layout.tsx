import type React from "react"
import "@/styles/ai-animations.css"
import "@/styles/apple-intelligence.css"
import "@/styles/search-bar.css"
import "@/styles/response-styles.css"
import "@/styles/deep-search.css"
import "@/styles/code-block.css"
import "@/styles/ios-optimizations.css" // Añadir los nuevos estilos de optimización
import "@/styles/voice-recording.css" // Añadir los estilos de grabación de voz
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import IOSOptimizations from "@/components/ios-optimizations" // Importar el componente de optimizaciones

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Cargar fuentes para código */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jetbrains-mono@1.0.6/css/jetbrains-mono.min.css" />

        {/* Meta tags para optimizaciones móviles */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <IOSOptimizations />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
