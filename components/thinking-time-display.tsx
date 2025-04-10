"use client"

import { motion } from "framer-motion"
import { Clock, ChevronRight, Eye } from "lucide-react"
import { useState } from "react"

interface ThinkingTimeDisplayProps {
  thinkingTime: number
  onViewThinking?: () => void
}

export default function ThinkingTimeDisplay({ thinkingTime, onViewThinking }: ThinkingTimeDisplayProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className="thinking-time-display visionos-card"
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 text-gray-200">
          <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-medium">Se ejecutó el modo Thinking durante {thinkingTime} s</span>
            <motion.div className="inline-block ml-2" animate={{ x: isHovered ? 5 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronRight className="w-4 h-4 inline" />
            </motion.div>
          </div>
        </div>

        {onViewThinking && (
          <motion.button
            onClick={onViewThinking}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm visionos-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="w-4 h-4" />
            <span>Ver pensamiento</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

