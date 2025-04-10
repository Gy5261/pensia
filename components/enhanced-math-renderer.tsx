"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Copy, Check } from "lucide-react"
import Latex from "react-latex-next"
import "katex/dist/katex.min.css"

interface MathRendererProps {
  formula: string
  display?: boolean
  id?: string
}

// Función para validar y corregir fórmulas matemáticas
export function validateAndFixMathFormula(formula: string): string {
  if (!formula) return formula

  let fixedFormula = formula.trim()

  // Corregir errores comunes en fórmulas LaTeX

  // 1. Corregir fracciones mal formadas
  fixedFormula = fixedFormula.replace(/\\frac\s*{([^{}]*)}\s*{([^{}]*)}/g, "\\frac{$1}{$2}")

  // 2. Corregir potencias y subíndices sin llaves
  fixedFormula = fixedFormula.replace(/\^([a-zA-Z0-9])(?![{}])/g, "^{$1}")
  fixedFormula = fixedFormula.replace(/_([a-zA-Z0-9])(?![{}])/g, "_{$1}")

  // 3. Corregir paréntesis, corchetes y llaves desbalanceados
  const brackets = [
    { open: "(", close: ")", latex: ["\\left(", "\\right)"] },
    { open: "[", close: "]", latex: ["\\left[", "\\right]"] },
    { open: "{", close: "}", latex: ["\\{", "\\}"] },
  ]

  for (const bracket of brackets) {
    const openCount = (fixedFormula.match(new RegExp(`\\${bracket.open}|${bracket.latex[0]}`, "g")) || []).length
    const closeCount = (fixedFormula.match(new RegExp(`\\${bracket.close}|${bracket.latex[1]}`, "g")) || []).length

    // Añadir paréntesis faltantes
    if (openCount > closeCount) {
      for (let i = 0; i < openCount - closeCount; i++) {
        fixedFormula += bracket.close
      }
    } else if (closeCount > openCount) {
      // Añadir paréntesis de apertura faltantes al principio
      fixedFormula = bracket.open.repeat(closeCount - openCount) + fixedFormula
    }
  }

  // 4. Corregir comandos LaTeX mal escritos
  const commonCommands = {
    "\\alfa": "\\alpha",
    "\\Beta": "\\beta",
    "\\Gamma": "\\gamma",
    "\\delta": "\\delta",
    "\\Epsilon": "\\epsilon",
    "\\teta": "\\theta",
    "\\lamda": "\\lambda",
    "\\Sigma": "\\sigma",
    "\\Fi": "\\phi",
    "\\Omega": "\\omega",
    "\\sqr": "\\sqrt",
    "\\raiz": "\\sqrt",
    "\\sen": "\\sin",
    "\\tg": "\\tan",
    "\\cotg": "\\cot",
    "\\arcsen": "\\arcsin",
    "\\arctg": "\\arctan",
    "\\coseno": "\\cos",
    "\\seno": "\\sin",
    "\\tangente": "\\tan",
    "\\lim_": "\\lim_{",
    "\\int_": "\\int_{",
    "\\sum_": "\\sum_{",
    "\\prod_": "\\prod_{",
  }

  for (const [incorrect, correct] of Object.entries(commonCommands)) {
    fixedFormula = fixedFormula.replace(new RegExp(incorrect, "g"), correct)
  }

  // 5. Corregir espacios en comandos LaTeX
  fixedFormula = fixedFormula.replace(/\\([a-zA-Z]+)\s+/g, "\\$1 ")

  // 6. Asegurar que las matrices estén bien formadas
  if (fixedFormula.includes("\\begin{matrix}") && !fixedFormula.includes("\\end{matrix}")) {
    fixedFormula += "\\end{matrix}"
  }

  // 7. Corregir integrales, sumas y productos mal formados
  const operators = ["\\int", "\\sum", "\\prod"]
  for (const op of operators) {
    // Si hay un operador seguido de límites pero sin llaves
    const regex = new RegExp(`${op}_([^{].*)\\^`, "g")
    fixedFormula = fixedFormula.replace(regex, `${op}_{$1}^`)
  }

  return fixedFormula
}

// Función para verificar si una fórmula se renderiza correctamente
function testFormulaRendering(formula: string): boolean {
  try {
    // Intentar crear un elemento temporal para renderizar la fórmula
    const tempDiv = document.createElement("div")
    tempDiv.style.position = "absolute"
    tempDiv.style.visibility = "hidden"
    document.body.appendChild(tempDiv)

    // Intentar renderizar con KaTeX
    tempDiv.innerHTML = `<span class="katex-display"><span class="katex">${formula}</span></span>`

    // Verificar si hay errores en la renderización
    const hasError = tempDiv.querySelector(".katex-error") !== null

    // Limpiar
    document.body.removeChild(tempDiv)

    return !hasError
  } catch (error) {
    console.warn("Error testing formula rendering:", error)
    return false
  }
}

export function MathRenderer({ formula, display = false, id }: MathRendererProps) {
  const [copied, setCopied] = useState(false)
  const [fixedFormula, setFixedFormula] = useState(formula)
  const [renderSuccess, setRenderSuccess] = useState(true)
  const formulaRef = useRef<HTMLDivElement>(null)

  // Validar y corregir la fórmula al montar el componente
  useEffect(() => {
    // Primero intentar con la fórmula original
    let currentFormula = formula.trim()

    // Preparar la fórmula (eliminar los delimitadores si existen)
    if (display && !currentFormula.startsWith("$$") && !currentFormula.endsWith("$$")) {
      currentFormula = `$$${currentFormula}$$`
    } else if (
      !display &&
      !currentFormula.startsWith("$") &&
      !currentFormula.endsWith("$") &&
      !currentFormula.startsWith("$$") &&
      !currentFormula.endsWith("$$")
    ) {
      currentFormula = `$${currentFormula}$`
    }

    // Verificar si la fórmula se renderiza correctamente
    const renders = testFormulaRendering(currentFormula)

    if (!renders) {
      // Si no se renderiza correctamente, intentar corregirla
      const correctedFormula = validateAndFixMathFormula(formula)

      // Preparar la fórmula corregida
      let processedCorrectedFormula = correctedFormula

      if (display && !processedCorrectedFormula.startsWith("$$") && !processedCorrectedFormula.endsWith("$$")) {
        processedCorrectedFormula = `$$${processedCorrectedFormula}$$`
      } else if (
        !display &&
        !processedCorrectedFormula.startsWith("$") &&
        !processedCorrectedFormula.endsWith("$") &&
        !processedCorrectedFormula.startsWith("$$") &&
        !processedCorrectedFormula.endsWith("$$")
      ) {
        processedCorrectedFormula = `$${processedCorrectedFormula}$`
      }

      // Verificar si la fórmula corregida se renderiza correctamente
      const correctedRenders = testFormulaRendering(processedCorrectedFormula)

      if (correctedRenders) {
        setFixedFormula(processedCorrectedFormula)
        setRenderSuccess(true)
      } else {
        // Si aún no se renderiza correctamente, usar la fórmula original
        setFixedFormula(currentFormula)
        setRenderSuccess(false)
        console.warn("Formula rendering failed:", formula)
      }
    } else {
      setFixedFormula(currentFormula)
      setRenderSuccess(true)
    }
  }, [formula, display])

  // Copiar la fórmula al portapapeles
  const copyFormula = () => {
    navigator.clipboard.writeText(formula)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={formulaRef}
      className={`math-renderer ${display ? "block-math" : "inline-math"} ${!renderSuccess ? "math-render-error" : ""}`}
    >
      <motion.div
        className="math-content"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{
          duration: 0.9,
          type: "spring",
          stiffness: 70,
          damping: 20,
        }}
      >
        <Latex>{fixedFormula}</Latex>
      </motion.div>

      {display && (
        <motion.button
          onClick={copyFormula}
          className="math-copy-button"
          title="Copiar fórmula"
          initial={{ opacity: 0 }}
          animate={{ opacity: copied ? 1 : 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </motion.button>
      )}
    </div>
  )
}

