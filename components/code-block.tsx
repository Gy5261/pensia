"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  language: string
  code: string
  fileName?: string
  showLineNumbers?: boolean
  className?: string
}

export default function CodeBlock({ language, code, fileName, showLineNumbers = false, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Actualizar la función highlightCode para mejorar el resaltado de sintaxis de Python

  // Reemplazar la función highlightCode con esta versión mejorada:
  const highlightCode = (code: string, language: string) => {
    // Primero, eliminar cualquier marcador de estilo que pueda estar en el código
    const cleanedCode = code
      .replace(/["']text-[a-z]+-\d+["']>\d+:/g, "")
      .replace(/["']text-[a-z]+-["']\d+>/g, "")
      .replace(/<\/[a-z]+>/g, "")

    if (language === "python") {
      return cleanedCode
        .replace(
          /\b(import|from|def|class|if|elif|else|for|while|return|try|except|finally|with|as|in|is|not|and|or|True|False|None|print)\b/g,
          '<span class="text-purple-400">$1</span>',
        )
        .replace(/\b(\d+)\b/g, '<span class="text-blue-300">$1</span>')
        .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-green-300">$&</span>')
        .replace(/(#.+)$/gm, '<span class="text-gray-500">$1</span>')
        .replace(/\b(random|operator|choice|randint|shuffle|seed)\b/g, '<span class="text-yellow-300">$1</span>')
        .replace(/\b(f["'].*?["'])\b/g, '<span class="text-cyan-300">$1</span>')
    } else if (language === "javascript" || language === "typescript" || language === "jsx" || language === "tsx") {
      return cleanedCode
        .replace(
          /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|async|await|try|catch|finally|new|this|typeof|instanceof)\b/g,
          '<span class="text-purple-400">$1</span>',
        )
        .replace(/\b(\d+)\b/g, '<span class="text-blue-300">$1</span>')
        .replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-green-300">$&</span>')
        .replace(/\/\/.+$/gm, '<span class="text-gray-500">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="text-gray-500">$&</span>')
    }
    return cleanedCode
  }

  // Generar números de línea si se solicitan
  const renderLineNumbers = () => {
    if (!showLineNumbers) return null

    const lines = code.split("\n")
    return (
      <div className="select-none text-right pr-4 text-gray-500 text-xs border-r border-gray-700 mr-4">
        {lines.map((_, i) => (
          <div key={i} className="leading-relaxed">
            {i + 1}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("my-6 rounded-lg overflow-hidden", className)}>
      {/* Contenedor principal con fondo oscuro */}
      <div className="bg-[#1E1E1E] rounded-lg overflow-hidden shadow-xl">
        {/* Contenedor secundario con efecto de desenfoque */}
        <div className="bg-[#2A2A2A]/80 backdrop-blur-[5px] border border-[#444444] rounded-lg overflow-hidden">
          {/* Barra superior con lenguaje y botón de copiar */}
          <div className="flex justify-between items-center px-4 py-2 bg-[#252525] border-b border-[#444444]">
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-xs font-medium">{language}</span>
              {fileName && (
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <span>{fileName}</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-200 text-xs flex items-center gap-1 bg-[#333333] hover:bg-[#444444] px-2 py-1 rounded transition-colors"
              aria-label="Copiar código"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {/* Área del código */}
          <div className="overflow-x-auto">
            <div className="p-4 flex">
              {renderLineNumbers()}
              <pre className="text-gray-300 text-sm font-mono leading-relaxed overflow-visible">
                <code
                  dangerouslySetInnerHTML={{
                    __html: highlightCode(code, language),
                  }}
                />
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

