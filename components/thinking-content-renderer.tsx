"use client"

import { motion } from "framer-motion"
import CodeBlock from "./code-block"
import { processThinkingStep } from "./code-parser"

interface ThinkingContentRendererProps {
  content: string
  index: number
  delay?: number
}

export default function ThinkingContentRenderer({ content, index, delay = 0.1 }: ThinkingContentRendererProps) {
  // Procesar el contenido para extraer bloques de código
  const processedContent = processThinkingStep(content)

  return (
    <motion.div
      className="bg-gray-800/50 rounded-lg p-3 border border-white/5 overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * delay }}
    >
      {processedContent.map((item, itemIndex) => (
        <div key={itemIndex} className={item.type === "code" ? "my-3" : ""}>
          {item.type === "text" ? (
            <p className="text-gray-300 text-sm">{item.content}</p>
          ) : (
            <CodeBlock language={item.language || "python"} code={item.content} showLineNumbers={true} />
          )}
        </div>
      ))}
    </motion.div>
  )
}

