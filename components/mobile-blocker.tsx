"use client"

import { motion } from "framer-motion"
import { useMobileDetector } from "@/hooks/use-mobile-detector"
import { Laptop, Smartphone, X } from "lucide-react"
import { useState } from "react"

export default function MobileBlocker() {
  const { isMobile, isClient } = useMobileDetector()
  const [dismissed, setDismissed] = useState(false)

  // No renderizar nada durante SSR o si no es un dispositivo móvil
  if (!isClient || !isMobile || dismissed) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="visionos-glass border-glow p-8 rounded-3xl max-w-md w-full relative"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
          delay: 0.2,
        }}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Cerrar notificación"
        >
          <X size={20} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="relative">
            <motion.div
              className="text-red-500 absolute"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
            >
              <Smartphone size={64} />
            </motion.div>
            <motion.div
              className="absolute -right-8 top-0 text-green-500"
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.5 }}
            >
              <Laptop size={64} />
            </motion.div>
            <div className="w-16 h-16"></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-3">Dispositivo no compatible</h2>

        <p className="text-gray-300 mb-6">
          Esta aplicación está optimizada exclusivamente para computadoras de escritorio. Por favor, accede desde un PC
          para disfrutar de la experiencia completa.
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            className="w-full py-3 px-4 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium transition-colors"
            onClick={() => setDismissed(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            Continuar de todos modos
          </motion.button>

          <p className="text-xs text-gray-400 mt-2">
            Nota: La experiencia puede verse comprometida en dispositivos móviles.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

