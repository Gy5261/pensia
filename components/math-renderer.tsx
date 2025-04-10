"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import Latex from "react-latex-next"
import "katex/dist/katex.min.css"

interface MathRendererProps {
  formula: string
  display?: boolean
  id?: string
}

export default function MathRenderer({ formula, display = false, id }: MathRendererProps) {
  const [copied, setCopied] = useState(false)

  // Preparar la fórmula (eliminar los delimitadores si existen)
  let processedFormula = formula.trim()

  // Si es modo display y no tiene delimitadores $$, añadirlos
  if (display && !processedFormula.startsWith("$$") && !processedFormula.endsWith("$$")) {
    processedFormula = `$$${processedFormula}$$`
  }

  // Si es modo inline y no tiene delimitadores $, añadirlos
  if (
    !display &&
    !processedFormula.startsWith("$") &&
    !processedFormula.endsWith("$") &&
    !processedFormula.startsWith("$$") &&
    !processedFormula.endsWith("$$")
  ) {
    processedFormula = `$${processedFormula}$`
  }

  // Copiar la fórmula al portapapeles
  const copyFormula = () => {
    navigator.clipboard.writeText(formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`math-renderer ${display ? "block-math" : "inline-math"}`}>
      <div className="math-content">
        <Latex>{processedFormula}</Latex>
      </div>

      {display && (
        <button onClick={copyFormula} className="math-copy-button" title="Copiar fórmula">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </div>
  )
}

