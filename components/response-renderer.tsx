"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import MathRenderer from "./math-renderer"
import CodeBlock from "./code-block"

interface ResponseRendererProps {
  content: string
}

export default function ResponseRenderer({ content }: ResponseRendererProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [copiedBlock, setCopiedBlock] = useState<string | null>(null)
  const [parsedContent, setParsedContent] = useState<any[]>([])

  // Función para preprocesar el texto antes de analizarlo
  const preprocessText = (text: string) => {
    // Convertir guiones seguidos de espacio en listas con guiones
    text = text.replace(/(?<=\n|^)- /gm, "- ")

    // Asegurar que los párrafos estén separados por líneas en blanco
    text = text.replace(/\n(?=\S)/g, "\n\n")

    // Detectar secciones con títulos (texto seguido de dos puntos)
    text = text.replace(/(?<=\n|^)([A-Z][^:]+):\s+/g, "### $1\n")

    return text
  }

  // Función para procesar el contenido y dividirlo en secciones, código, matemáticas, etc.
  useEffect(() => {
    if (!content) return

    const processContent = () => {
      // Preprocesar el texto
      const preprocessedContent = preprocessText(content)

      // Limpiar símbolos no deseados - eliminamos asteriscos y otros símbolos
      const cleanedContent = preprocessedContent
        .replace(/\*{3,}/g, "") // Eliminar tres o más asteriscos
        .replace(/\*\*/g, "") // Eliminar dobles asteriscos
        .replace(/\*/g, "") // Eliminar asteriscos simples
        .replace(/^Consulta:/gm, "") // Eliminar "Consulta:" al inicio de líneas
        .replace(/^:📜/gm, "") // Eliminar ":📜" al inicio de líneas
        .replace(/\[.*?\]/g, "") // Eliminar corchetes y su contenido
        .replace(/\*{2,}.*?\*{2,}/g, "") // Eliminar texto entre dobles asteriscos

      // Dividir el contenido en secciones basadas en títulos
      const sections = []
      let currentText = ""
      let inCodeBlock = false
      let codeContent = ""
      let codeLanguage = ""
      let inMathBlock = false
      let mathContent = ""
      let inListBlock = false
      let listItems = []
      let listType = ""

      // Dividir por líneas
      const lines = cleanedContent.split("\n")

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const trimmedLine = line.trim()

        // Detectar listas con guiones (- item)
        const bulletListMatch = trimmedLine.match(/^-\s+(.+)/)

        // Detectar listas numeradas (1. 2. 3. etc)
        const numberedListMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/)

        // Si estamos en una lista y la línea actual no es un elemento de lista, terminamos la lista
        if (inListBlock && !bulletListMatch && !numberedListMatch && trimmedLine !== "") {
          // Guardar la lista acumulada
          sections.push({
            type: "list",
            listType: listType,
            items: listItems,
          })
          inListBlock = false
          listItems = []
          listType = ""
        }

        // Detectar bloques de código
        if (trimmedLine.startsWith("```") && !inCodeBlock) {
          // Guardar el texto acumulado antes del bloque de código
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          inCodeBlock = true
          codeLanguage = trimmedLine.replace("```", "").trim() || "javascript"
          continue
        }

        if (trimmedLine === "```" && inCodeBlock) {
          sections.push({
            type: "code",
            language: codeLanguage,
            content: codeContent.trim(),
            id: `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })
          inCodeBlock = false
          codeContent = ""
          continue
        }

        if (inCodeBlock) {
          codeContent += line + "\n"
          continue
        }

        // Detectar bloques de matemáticas ($$...$$)
        if (trimmedLine === "$$" && !inMathBlock) {
          // Guardar el texto acumulado antes del bloque de matemáticas
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          inMathBlock = true
          mathContent = ""
          continue
        }

        if (trimmedLine === "$$" && inMathBlock) {
          sections.push({
            type: "math",
            content: mathContent.trim(),
            id: `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })
          inMathBlock = false
          mathContent = ""
          continue
        }

        // También detectar bloques de matemáticas en una sola línea
        if (trimmedLine.startsWith("$$") && trimmedLine.endsWith("$$") && !inMathBlock) {
          // Guardar el texto acumulado antes del bloque de matemáticas
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          const mathContent = trimmedLine.slice(2, -2).trim()
          sections.push({
            type: "math",
            content: mathContent,
            id: `math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })
          continue
        }

        if (inMathBlock) {
          mathContent += line + "\n"
          continue
        }

        // Detectar elementos de lista con guiones
        if (bulletListMatch) {
          // Si no estábamos en una lista, guardar el texto acumulado
          if (!inListBlock) {
            if (currentText.trim()) {
              sections.push({ type: "text", content: currentText.trim() })
              currentText = ""
            }
            inListBlock = true
            listType = "bullet"
          }

          // Extraer el contenido
          const content = bulletListMatch[1]

          // Buscar si hay un título en negrita
          const titleMatch = content.match(/^([^:]+):\s+(.+)/)

          if (titleMatch) {
            listItems.push({
              title: titleMatch[1].trim(),
              content: titleMatch[2].trim(),
            })
          } else {
            listItems.push({
              content: content.trim(),
            })
          }

          continue
        }

        // Detectar elementos de lista numerada
        if (numberedListMatch) {
          // Si no estábamos en una lista, guardar el texto acumulado
          if (!inListBlock) {
            if (currentText.trim()) {
              sections.push({ type: "text", content: currentText.trim() })
              currentText = ""
            }
            inListBlock = true
            listType = "numbered"
          }

          // Extraer el número y el contenido
          const number = numberedListMatch[1]
          const content = numberedListMatch[2]

          // Buscar si hay un título en negrita
          const titleMatch = content.match(/^([^:]+):\s+(.+)/)

          if (titleMatch) {
            listItems.push({
              number: Number.parseInt(number),
              title: titleMatch[1].trim(),
              content: titleMatch[2].trim(),
            })
          } else {
            listItems.push({
              number: Number.parseInt(number),
              content: content.trim(),
            })
          }

          continue
        }

        // Detectar títulos y subtítulos
        if (trimmedLine.startsWith("# ")) {
          // Guardar el texto acumulado antes del título
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          sections.push({
            type: "heading",
            level: 1,
            content: trimmedLine.replace("# ", ""),
          })
          continue
        }

        if (trimmedLine.startsWith("## ")) {
          // Guardar el texto acumulado antes del subtítulo
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          sections.push({
            type: "heading",
            level: 2,
            content: trimmedLine.replace("## ", ""),
          })
          continue
        }

        if (trimmedLine.startsWith("### ")) {
          // Guardar el texto acumulado antes del subtítulo
          if (currentText.trim()) {
            sections.push({ type: "text", content: currentText.trim() })
            currentText = ""
          }

          sections.push({
            type: "heading",
            level: 3,
            content: trimmedLine.replace("### ", ""),
          })
          continue
        }

        // Detectar líneas en blanco para separar párrafos
        if (trimmedLine === "" && currentText.trim() !== "") {
          sections.push({ type: "text", content: currentText.trim() })
          currentText = ""
          continue
        }

        // Texto normal
        currentText += line + "\n"
      }

      // Añadir la última lista si existe
      if (inListBlock && listItems.length > 0) {
        sections.push({
          type: "list",
          listType: listType,
          items: listItems,
        })
      }

      // Añadir el último bloque de texto si existe
      if (currentText.trim()) {
        sections.push({ type: "text", content: currentText.trim() })
      }

      // Procesar el texto para detectar fórmulas matemáticas inline
      const processedSections = sections.map((section) => {
        if (section.type === "text") {
          // Buscar fórmulas matemáticas inline con $...$
          const parts = []
          let lastIndex = 0
          let inMath = false
          let mathText = ""

          for (let i = 0; i < section.content.length; i++) {
            if (section.content[i] === "$" && (i === 0 || section.content[i - 1] !== "\\")) {
              if (!inMath) {
                // Inicio de fórmula
                if (i > lastIndex) {
                  parts.push({
                    type: "plaintext",
                    content: section.content.substring(lastIndex, i),
                  })
                }
                inMath = true
                mathText = ""
              } else {
                // Fin de fórmula
                parts.push({
                  type: "inline-math",
                  content: mathText,
                  id: `inline-math-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                })
                inMath = false
                lastIndex = i + 1
              }
              continue
            }

            if (inMath) {
              mathText += section.content[i]
            }
          }

          // Añadir el último trozo de texto
          if (lastIndex < section.content.length) {
            parts.push({
              type: "plaintext",
              content: section.content.substring(lastIndex),
            })
          }

          return { ...section, parts }
        }
        return section
      })

      setParsedContent(processedSections)
    }

    processContent()
  }, [content])

  // Función para copiar código al portapapeles
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedBlock(text)
    setTimeout(() => setCopiedBlock(null), 2000)
  }

  // Función para alternar la expansión de secciones largas
  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Renderizar texto con posibles fórmulas matemáticas inline
  const renderTextWithMath = (section: any) => {
    if (!section.parts) return <div className="text-gray-300 leading-relaxed">{section.content}</div>

    return (
      <div className="text-gray-300 leading-relaxed">
        {section.parts.map((part: any, i: number) => {
          if (part.type === "plaintext") {
            return <span key={i}>{part.content}</span>
          } else if (part.type === "inline-math") {
            return (
              <span key={i} className="inline-block math-inline">
                <MathRenderer formula={part.content} display={false} id={part.id} />
              </span>
            )
          }
          return null
        })}
      </div>
    )
  }

  // Renderizar cada sección del contenido
  const renderSection = (section: any, index: number) => {
    switch (section.type) {
      case "heading":
        if (section.level === 1) {
          return (
            <h1 key={index} className="text-xl font-bold text-white mb-4 mt-2 font-sf-pro">
              {section.content}
            </h1>
          )
        } else if (section.level === 2) {
          return (
            <h2 key={index} className="text-lg font-semibold text-white mb-3 mt-4 font-sf-pro">
              {section.content}
            </h2>
          )
        } else {
          return (
            <h3 key={index} className="text-base font-medium text-white mb-2 mt-3 font-sf-pro">
              {section.content}
            </h3>
          )
        }

      case "text":
        const isLong = section.content.length > 500
        const isExpanded = expandedSections[index] !== false

        // Dividir el texto en párrafos
        const paragraphs = section.parts
          ? [section] // Si ya tiene parts, es que ha sido procesado para matemáticas
          : section.content.split(/\n\s*\n/).map((p) => ({ type: "plaintext", content: p.trim() }))

        return (
          <div key={index} className="mb-4">
            <div className={`overflow-hidden ${isLong && !isExpanded ? "max-h-32" : ""}`}>
              {section.parts ? (
                renderTextWithMath(section)
              ) : (
                <div className="space-y-4">
                  {paragraphs.map((paragraph, i) => (
                    <p key={i} className="text-gray-300">
                      {paragraph.content}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {isLong && (
              <button
                onClick={() => toggleSection(index)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1 transition-colors"
              >
                {isExpanded ? "Mostrar menos" : "Mostrar más"}
                <ChevronDown className={`ml-1 w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        )

      case "list":
        if (section.listType === "bullet") {
          return (
            <div key={index} className="mb-6">
              <ul className="space-y-3 list-disc pl-8">
                {section.items.map((item: any, itemIndex: number) => (
                  <li key={itemIndex} className="pl-1">
                    {item.title ? (
                      <div>
                        <span className="font-medium text-white">{item.title}:</span>{" "}
                        <span className="text-gray-300">{item.content}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">{item.content}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        } else {
          return (
            <div key={index} className="mb-6">
              <ol className="space-y-3 list-decimal pl-8">
                {section.items.map((item: any, itemIndex: number) => (
                  <li key={itemIndex} className="pl-1">
                    {item.title ? (
                      <div>
                        <span className="font-medium text-white">{item.title}:</span>{" "}
                        <span className="text-gray-300">{item.content}</span>
                      </div>
                    ) : (
                      <span className="text-gray-300">{item.content}</span>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          )
        }

      case "code":
        return (
          <CodeBlock
            key={index}
            language={section.language}
            code={section.content}
            showLineNumbers={true}
            className="mb-6"
          />
        )

      case "math":
        return (
          <div key={index} className="my-6 py-2">
            <motion.div
              className="math-block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 120, damping: 10 }}
            >
              <MathRenderer formula={section.content} display={true} id={section.id} />
            </motion.div>
          </div>
        )

      default:
        return null
    }
  }

  // Si no hay contenido, mostrar un mensaje
  if (!content) {
    return <div className="text-gray-400 italic">No hay contenido disponible</div>
  }

  return (
    <>
      <style jsx global>{`
        /* Estilos para fórmulas matemáticas */
        .math-block {
          background-color: rgba(30, 30, 40, 0.6);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .math-block:hover {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .math-block::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
        }

        .math-renderer {
          position: relative;
          min-height: 24px;
          width: 100%;
        }

        .math-renderer.block-math {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0;
        }

        .math-renderer.inline-math {
          display: inline-flex;
          align-items: center;
          margin: 0 0.25rem;
        }

        .math-content {
          font-size: 1.1rem;
          line-height: 1.5;
          width: 100%;
          text-align: center;
        }

        .math-copy-button {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background-color: rgba(60, 60, 70, 0.7);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 0.25rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.2s ease, background-color 0.2s ease;
        }

        .math-renderer:hover .math-copy-button {
          opacity: 1;
        }

        .math-copy-button:hover {
          background-color: rgba(80, 80, 90, 0.8);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .math-inline {
          background-color: rgba(40, 40, 50, 0.4);
          border-radius: 0.25rem;
          padding: 0 0.25rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .math-inline:hover {
          background-color: rgba(50, 50, 60, 0.5);
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* Estilos para KaTeX */
        .katex {
          font-size: 1.1em !important;
          color: rgba(255, 255, 255, 0.9) !important;
        }

        .katex-display {
          margin: 0.5em 0 !important;
          overflow-x: auto;
          overflow-y: hidden;
          padding: 0.5em 0;
        }

        .katex-display > .katex {
          max-width: 100%;
        }

        /* Animación para fórmulas matemáticas */
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .katex-display > .katex {
          animation: fadeInScale 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
      <div className="text-gray-300 text-sm leading-relaxed">{parsedContent.map(renderSection)}</div>
    </>
  )
}

