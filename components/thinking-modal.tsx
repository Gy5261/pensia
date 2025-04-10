"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import CodeBlock from "./code-block"

interface ThinkingModalProps {
  isOpen: boolean
  onClose: () => void
  thinkingContent: string[]
}

export default function ThinkingModal({ isOpen, onClose, thinkingContent }: ThinkingModalProps) {
  // Función para detectar y renderizar bloques de código
  const renderContent = (content: string, index: number) => {
    // Verificar si es un bloque de código
    if (content.includes("```")) {
      const parts = content.split("```")

      // Si hay al menos 3 partes (texto antes, código, texto después)
      if (parts.length >= 3) {
        const beforeCode = parts[0]
        const codeWithLang = parts[1]
        const afterCode = parts.slice(2).join("```")

        // Extraer lenguaje y código
        const codeLines = codeWithLang.trim().split("\n")
        const language = codeLines[0].trim() || "python"
        const code = codeLines.slice(1).join("\n")

        return (
          <motion.div
            key={index}
            className="bg-gray-800/50 rounded-lg p-3 border border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            {beforeCode && <p className="text-gray-300 text-sm mb-3">{beforeCode}</p>}
            <CodeBlock language={language} code={code} showLineNumbers={true} />
            {afterCode && <p className="text-gray-300 text-sm mt-3">{afterCode}</p>}
          </motion.div>
        )
      }
    }

    // Si no es un bloque de código o no se pudo procesar correctamente
    return (
      <motion.div
        key={index}
        className="bg-gray-800/50 rounded-lg p-3 border border-white/5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <p className="text-gray-300 text-sm">{content}</p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
          <motion.div
            className="relative w-full max-w-3xl bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-white font-medium text-lg">Proceso de pensamiento detallado</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
              {thinkingContent.map((content, index) => renderContent(content, index))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

