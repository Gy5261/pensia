"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"
import CodeBlock from "./code-block"
import { MathRenderer, validateAndFixMathFormula } from "./enhanced-math-renderer"

interface DeepSearchResultsProps {
  query: string
  isVisible: boolean
  onClose: () => void
}

type SearchStep = "exploring" | "integrating" | "refining" | "finished"

export default function DeepSearchResults({ query, isVisible, onClose }: DeepSearchResultsProps) {
  const [currentStep, setCurrentStep] = useState<SearchStep>("exploring")
  const [searchTime, setSearchTime] = useState(0)
  const [contentReady, setContentReady] = useState(false)
  const [contentItems, setContentItems] = useState<any[]>([])
  const [contentTitle, setContentTitle] = useState<string>("")
  const [apiResponse, setApiResponse] = useState<string | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)
  const [animationState, setAnimationState] = useState<"idle" | "entering" | "active" | "ending">("idle")

  // Refs for intervals
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)
  const apiCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Definir los pasos y sus porcentajes correspondientes
  const steps = [
    { id: "exploring", label: "Explorando", percentage: 25 },
    { id: "integrating", label: "Integrando", percentage: 50 },
    { id: "refining", label: "Refinando", percentage: 75 },
    { id: "finished", label: "Finalizado", percentage: 100 },
  ]

  // Reset state when component becomes visible
  useEffect(() => {
    if (!isVisible) return

    // Reset all states
    setCurrentStep("exploring")
    setSearchTime(0)
    setContentReady(false)
    setContentItems([])
    setContentTitle("")
    setApiResponse(null)
    setProgressPercentage(0)

    // Establecer el estado de animación a "entering" y luego a "active"
    setAnimationState("entering")
    setTimeout(() => setAnimationState("active"), 300)

    // Obtener el tiempo de inicio almacenado por performDeepSearch
    const storedStartTime = localStorage.getItem("deepSearchStartTime")
    startTimeRef.current = storedStartTime ? Number.parseInt(storedStartTime) : Date.now()

    // Timer for search time
    timeIntervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setSearchTime(elapsedSeconds)
    }, 1000)

    // Iniciar la animación de progreso suave
    startProgressAnimation()

    // Simulate step progression
    const stepProgression = [
      { step: "exploring", delay: 1500 },
      { step: "integrating", delay: 3000 },
      { step: "refining", delay: 4500 },
      { step: "finished", delay: 6000 },
    ]

    const stepTimeouts = stepProgression.map(({ step, delay }) =>
      setTimeout(() => {
        setCurrentStep(step as SearchStep)

        if (step === "finished") {
          if (timeIntervalRef.current) {
            clearInterval(timeIntervalRef.current)
            const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
            setSearchTime(finalTime)
          }

          checkForApiResponse()

          apiCheckIntervalRef.current = setInterval(() => {
            checkForApiResponse()
          }, 1000)

          setTimeout(() => {
            if (apiCheckIntervalRef.current) {
              clearInterval(apiCheckIntervalRef.current)
            }
          }, 30000)
        }
      }, delay),
    )

    // Cleanup function
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current)
      if (apiCheckIntervalRef.current) clearInterval(apiCheckIntervalRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
      stepTimeouts.forEach((timeout) => clearTimeout(timeout))
    }
  }, [isVisible, query])

  // Función para iniciar la animación de progreso suave
  const startProgressAnimation = () => {
    // Limpiar cualquier intervalo existente
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Iniciar con 0%
    setProgressPercentage(0)

    // Actualizar el progreso cada 50ms para una animación más suave
    progressIntervalRef.current = setInterval(() => {
      setProgressPercentage((prev) => {
        // Encontrar el porcentaje objetivo basado en el paso actual
        const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
        const targetPercentage = steps[currentStepIndex].percentage

        // Si ya alcanzamos o superamos el objetivo, mantener el valor actual
        if (prev >= targetPercentage) return prev

        // Incrementar suavemente con una curva de aceleración natural
        // Más lento para una animación más suave
        const distanceToTarget = targetPercentage - prev
        const increment = Math.max(0.1, distanceToTarget * 0.01)

        return Math.min(targetPercentage, prev + increment)
      })
    }, 50)
  }

  // Actualizar la animación de progreso cuando cambia el paso actual
  useEffect(() => {
    // No es necesario reiniciar la animación, ya que el intervalo existente
    // detectará el nuevo paso y ajustará el objetivo automáticamente
  }, [currentStep])

  // Verificar si hay una respuesta de la API
  const checkForApiResponse = () => {
    const storedResponse = localStorage.getItem("deepSearchResponse")
    const isCompleted = localStorage.getItem("deepSearchCompleted") === "true"

    if (storedResponse && isCompleted) {
      setApiResponse(storedResponse)
      setContentReady(true)
      processApiResponse(storedResponse)

      if (apiCheckIntervalRef.current) {
        clearInterval(apiCheckIntervalRef.current)
      }
    }
  }

  // Procesar la respuesta de la API
  const processApiResponse = (response: string) => {
    const processedResponse = response
    const lines = processedResponse.split(/\n+/).filter((line) => line.trim().length > 0)
    const titleIndex = lines.findIndex((line) => line.length < 100 && (line.includes(":") || /^[A-Z]/.test(line)))
    const title = titleIndex >= 0 ? lines[titleIndex] : "Resultados de la búsqueda"
    const content = titleIndex >= 0 ? lines.slice(titleIndex + 1) : lines

    // Procesar bloques de código y fórmulas matemáticas
    let inCodeBlock = false
    let currentCodeBlock = ""
    let currentLanguage = ""
    let inMathBlock = false
    let currentMathBlock = ""
    const processedContent = []

    for (let i = 0; i < content.length; i++) {
      const line = content[i]

      // Detectar bloques de código
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true
          currentLanguage = line.trim().replace("```", "").trim() || "python"
          currentCodeBlock = ""
        } else {
          inCodeBlock = false
          processedContent.push({
            type: "code",
            language: currentLanguage,
            content: currentCodeBlock.trim(),
          })
          currentCodeBlock = ""
          currentLanguage = ""
        }
        continue
      }

      // Detectar bloques de matemáticas
      if (line.trim() === "$$" && !inMathBlock) {
        inMathBlock = true
        currentMathBlock = ""
        continue
      }

      if (line.trim() === "$$" && inMathBlock) {
        inMathBlock = false
        // Validar y corregir la fórmula matemática
        const fixedFormula = validateAndFixMathFormula(currentMathBlock.trim())
        processedContent.push({
          type: "math",
          content: fixedFormula,
        })
        currentMathBlock = ""
        continue
      }

      // Acumular contenido según el estado actual
      if (inCodeBlock) {
        currentCodeBlock += line + "\n"
      } else if (inMathBlock) {
        currentMathBlock += line + "\n"
      } else {
        // Buscar fórmulas matemáticas inline
        const mathRegex = /\$([^$]+)\$/g
        let lastIndex = 0
        let match
        let processedLine = ""

        while ((match = mathRegex.exec(line)) !== null) {
          // Añadir texto antes de la fórmula
          processedLine += line.substring(lastIndex, match.index)

          // Validar y corregir la fórmula inline
          const fixedInlineFormula = validateAndFixMathFormula(match[1])

          // Añadir la fórmula corregida
          processedLine += `$${fixedInlineFormula}$`

          lastIndex = match.index + match[0].length
        }

        // Añadir el resto del texto
        processedLine += line.substring(lastIndex)

        processedContent.push(processedLine)
      }
    }

    // Manejar bloques no cerrados
    if (inCodeBlock) {
      processedContent.push({
        type: "code",
        language: currentLanguage,
        content: currentCodeBlock.trim(),
      })
    }

    if (inMathBlock) {
      const fixedFormula = validateAndFixMathFormula(currentMathBlock.trim())
      processedContent.push({
        type: "math",
        content: fixedFormula,
      })
    }

    setContentTitle(title)
    setContentItems(processedContent)
  }

  // Actualizar las animaciones para que coincidan con las especificaciones de iOS 18.2

  // Actualizar las variantes de animación del contenedor
  const containerVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    entering: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    active: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
    ending: {
      opacity: 0.4,
      y: 10,
      scale: 0.96,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  // Actualizar la función handleClose para responder inmediatamente
  const handleClose = () => {
    // Optimización: Respuesta táctil inmediata
    requestAnimationFrame(() => {
      // Primero activar la animación de salida
      setAnimationState("ending")

      // Luego, después de un breve retraso, actualizar el estado
      setTimeout(() => {
        if (timeIntervalRef.current) clearInterval(timeIntervalRef.current)
        if (apiCheckIntervalRef.current) clearInterval(apiCheckIntervalRef.current)
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
        onClose()
      }, 275) // Ajustado a la duración de iOS
    })
  }

  // Animation variants
  // const containerVariants = {
  //   hidden: { opacity: 0, y: 20, scale: 0.98 },
  //   entering: {
  //     opacity: 1,
  //     y: 0,
  //     scale: 1,
  //     transition: {
  //       duration: 0.3,
  //       ease: [0.32, 0.72, 0, 1],
  //     },
  //   },
  //   active: {
  //     opacity: 1,
  //     y: 0,
  //     scale: 1,
  //   },
  //   ending: {
  //     opacity: 0,
  //     y: 10,
  //     scale: 0.98,
  //     transition: {
  //       duration: 0.3,
  //       ease: [0.32, 0.72, 0, 1],
  //     },
  //   },
  // }

  // // Handle close button click
  // const handleClose = () => {
  //   // Primero activar la animación de salida
  //   setAnimationState("ending")

  //   // Luego, después de un breve retraso, actualizar el estado
  //   setTimeout(() => {
  //     if (timeIntervalRef.current) clearInterval(timeIntervalRef.current)
  //     if (apiCheckIntervalRef.current) clearInterval(apiCheckIntervalRef.current)
  //     if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
  //     onClose()
  //   }, 300) // Reducido a 300ms para coincidir con el componente "think"
  // }

  // Obtener el índice del paso actual
  const getCurrentStepIndex = () => {
    return steps.findIndex((step) => step.id === currentStep)
  }

  // Verificar si un paso está completado
  const isStepCompleted = (stepId: string) => {
    const stepIndex = steps.findIndex((step) => step.id === stepId)
    const currentStepIndex = getCurrentStepIndex()
    return stepIndex < currentStepIndex
  }

  // Verificar si un paso está activo
  const isStepActive = (stepId: string) => {
    return currentStep === stepId
  }

  // Renderizar contenido con soporte para fórmulas matemáticas
  const renderContent = (item: any, index: number) => {
    if (typeof item === "object") {
      if (item.type === "code") {
        return <CodeBlock key={index} language={item.language || "python"} code={item.content} showLineNumbers={true} />
      } else if (item.type === "math") {
        return (
          <div key={index} className="my-4 flex justify-center">
            <MathRenderer formula={item.content} display={true} />
          </div>
        )
      }
    }

    // Procesar texto normal con posibles fórmulas matemáticas inline
    const mathRegex = /\$([^$]+)\$/g
    const parts = []
    let lastIndex = 0
    let match
    const text = item.toString()

    while ((match = mathRegex.exec(text)) !== null) {
      // Añadir texto antes de la fórmula
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        })
      }

      // Añadir la fórmula
      parts.push({
        type: "inline-math",
        content: match[1],
      })

      lastIndex = match.index + match[0].length
    }

    // Añadir el resto del texto
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      })
    }

    // Si no hay fórmulas, simplemente devolver el texto
    if (parts.length === 0) {
      return (
        <p key={index} className="mb-4">
          {text}
        </p>
      )
    }

    // Renderizar texto con fórmulas inline
    return (
      <p key={index} className="mb-4">
        {parts.map((part, i) => {
          if (part.type === "text") {
            return <span key={i}>{part.content}</span>
          } else {
            return <MathRenderer key={i} formula={part.content} display={false} />
          }
        })}
      </p>
    )
  }

  // Asegurarnos de que el componente DeepSearchResults use el estado de animación correctamente
  // Actualizar el return para usar el estado de animación
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="mt-4 bg-gray-800/80 backdrop-blur-[30px] rounded-3xl border border-white/10 overflow-hidden shadow-lg"
          variants={containerVariants}
          initial="hidden"
          animate={animationState}
          exit="ending"
          style={{
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05) inset",
          }}
        >
          {/* Header */}
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-700/60 flex items-center justify-center backdrop-blur-sm border border-white/5">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-gray-300"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 21L16.65 16.65"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-200">DeepSearch</h3>
              </div>

              {/* Close button */}
              <motion.button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-200 transition-colors bg-gray-700/40 hover:bg-gray-700/60 rounded-full p-1.5 backdrop-blur-sm border border-white/5 visionos-transition"
                whileHover={{ scale: 1.05, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
                whileTap={{ scale: 0.95, transition: { duration: 0.9, ease: [0.32, 0.72, 0, 1] } }}
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Content area */}
            <div className="flex flex-col items-center">
              {!contentReady ? (
                /* Loading state */
                <div className="w-full max-w-md mx-auto">
                  {/* Progress bar container */}
                  <div className="relative mb-10">
                    {/* Background track */}
                    <div className="h-1 bg-gray-700/50 rounded-full w-full absolute"></div>

                    {/* Animated progress bar */}
                    <motion.div
                      className="h-1 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-full absolute overflow-hidden"
                      style={{ width: `${progressPercentage}%` }}
                      initial={{ width: "0%" }}
                      transition={{
                        duration: 0.9,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {/* Efecto de brillo que se desplaza */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{
                          x: ["-100%", "200%"],
                        }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: 2.5,
                          ease: "linear",
                        }}
                      />
                    </motion.div>

                    {/* Steps indicators */}
                    <div className="flex justify-between relative pt-6">
                      {steps.map((step, index) => (
                        <div key={step.id} className="flex flex-col items-center relative">
                          {/* Línea de conexión entre pasos */}
                          {index < steps.length - 1 && (
                            <div
                              className="absolute h-0.5 bg-gray-700/50 top-4 left-4 z-0"
                              style={{ width: `${100 / (steps.length - 1)}%` }}
                            ></div>
                          )}

                          {/* Step marker */}
                          <motion.div
                            className={`
                            relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                            visionos-transition
                            ${
                              isStepCompleted(step.id)
                                ? "bg-green-500 text-white"
                                : isStepActive(step.id)
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-700/60 text-gray-400"
                            }
                          `}
                            initial={{ scale: 0.8, opacity: 0.5 }}
                            animate={{
                              scale: isStepActive(step.id) ? [1, 1.05, 1] : 1,
                              opacity: 1,
                              boxShadow: isStepCompleted(step.id)
                                ? "0 0 0 4px rgba(16, 185, 129, 0.2), 0 0 20px rgba(16, 185, 129, 0.4)"
                                : isStepActive(step.id)
                                  ? "0 0 0 4px rgba(59, 130, 246, 0.2), 0 0 20px rgba(59, 130, 246, 0.4)"
                                  : "none",
                            }}
                            transition={{
                              duration: 0.9,
                              repeat: isStepActive(step.id) ? Number.POSITIVE_INFINITY : 0,
                              repeatType: "reverse",
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            style={{
                              backdropFilter: "blur(8px)",
                              border: "1px solid rgba(255, 255, 255, 0.1)",
                            }}
                          >
                            {isStepCompleted(step.id) ? (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                              >
                                <Check className="w-4 h-4" />
                              </motion.div>
                            ) : (
                              <span className="text-xs">{index + 1}</span>
                            )}

                            {/* Efecto de resplandor para el paso activo */}
                            {isStepActive(step.id) && (
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                animate={{
                                  boxShadow: [
                                    "0 0 0 0px rgba(59, 130, 246, 0)",
                                    "0 0 0 8px rgba(59, 130, 246, 0.1)",
                                    "0 0 0 16px rgba(59, 130, 246, 0)",
                                  ],
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Number.POSITIVE_INFINITY,
                                  ease: "easeInOut",
                                }}
                              />
                            )}

                            {/* Efecto de completado */}
                            {isStepCompleted(step.id) && (
                              <motion.div
                                className="absolute inset-0 rounded-full bg-green-500"
                                initial={{ scale: 1.5, opacity: 0.3 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{
                                  duration: 1,
                                  ease: "easeOut",
                                }}
                              />
                            )}
                          </motion.div>

                          {/* Step label */}
                          <motion.span
                            className={`
                            text-xs mt-2 font-medium
                            ${
                              isStepCompleted(step.id)
                                ? "text-green-400"
                                : isStepActive(step.id)
                                  ? "text-blue-400"
                                  : "text-gray-500"
                            }
                          `}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: index * 0.1,
                              duration: 0.3,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                          >
                            {step.label}
                          </motion.span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Query */}
                  <div className="text-center mb-8">
                    <motion.h2
                      className="text-xl font-medium text-gray-200 mb-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.2,
                        duration: 0.5,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {query}
                    </motion.h2>
                    <motion.p
                      className="text-gray-400 text-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: 0.4,
                        duration: 0.5,
                      }}
                    >
                      Buscando información relevante...
                    </motion.p>
                  </div>

                  {/* Loading animation - Enhanced elegant glowing pill */}
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="relative">
                      {/* Main glowing pill */}
                      <motion.div
                        className="w-16 h-6 bg-white/10 backdrop-blur-xl rounded-full border border-white/30"
                        animate={{
                          boxShadow: [
                            "0 0 5px 0 rgba(255, 255, 255, 0.3), 0 0 10px 0 rgba(255, 255, 255, 0.2), inset 0 0 5px 0 rgba(255, 255, 255, 0.1)",
                            "0 0 10px 2px rgba(255, 255, 255, 0.5), 0 0 20px 0 rgba(255, 255, 255, 0.3), inset 0 0 10px 0 rgba(255, 255, 255, 0.2)",
                            "0 0 5px 0 rgba(255, 255, 255, 0.3), 0 0 10px 0 rgba(255, 255, 255, 0.2), inset 0 0 5px 0 rgba(255, 255, 255, 0.1)",
                          ],
                          scale: [1, 1.05, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                          ease: "easeInOut",
                        }}
                      >
                        {/* Inner moving light effect */}
                        <motion.div
                          className="absolute inset-0 rounded-full overflow-hidden"
                          initial={{ opacity: 0.6 }}
                          animate={{ opacity: [0.6, 0.8, 0.6] }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              ease: "easeInOut",
                            }}
                          />
                        </motion.div>

                        {/* Pulsing border effect */}
                        <motion.div
                          className="absolute -inset-0.5 rounded-full"
                          animate={{
                            boxShadow: [
                              "0 0 0 1px rgba(255, 255, 255, 0.3)",
                              "0 0 0 2px rgba(255, 255, 255, 0.5)",
                              "0 0 0 1px rgba(255, 255, 255, 0.3)",
                            ],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          }}
                        />

                        {/* Floating particles */}
                        {[...Array(5)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/60 rounded-full"
                            initial={{
                              x: Math.random() * 16 - 8,
                              y: Math.random() * 6 - 3,
                              opacity: 0,
                            }}
                            animate={{
                              y: [0, -10, 0],
                              opacity: [0, 0.8, 0],
                              scale: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 2 + Math.random() * 2,
                              repeat: Number.POSITIVE_INFINITY,
                              delay: i * 0.4,
                            }}
                          />
                        ))}
                      </motion.div>

                      {/* Outer glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            "0 0 15px 0px rgba(255, 255, 255, 0.2)",
                            "0 0 30px 5px rgba(255, 255, 255, 0.4)",
                            "0 0 15px 0px rgba(255, 255, 255, 0.2)",
                          ],
                        }}
                        transition={{
                          duration: 3.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Expanding rings */}
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 rounded-full border border-white/20"
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{
                            scale: [1, 2 + i * 0.3],
                            opacity: [0.8, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.6,
                            ease: "easeOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Results state */
                <div className="w-full max-w-2xl mx-auto">
                  {/* Query centered */}
                  <motion.h2
                    className="text-xl font-medium text-gray-200 mb-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {query}
                  </motion.h2>

                  {/* Content */}
                  <motion.div
                    className="space-y-4 text-gray-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {contentTitle && contentTitle !== query && (
                      <h3 className="text-lg font-medium text-gray-200 mb-2">{contentTitle}</h3>
                    )}

                    {contentItems.length > 0 ? (
                      <>
                        {contentItems.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.99 }}
                            transition={{
                              duration: 0.9,
                              delay: 0.1 + index * 0.05,
                              ease: [0.16, 1, 0.3, 1],
                            }}
                            className="visionos-transition"
                          >
                            {renderContent(item, index)}
                          </motion.div>
                        ))}
                      </>
                    ) : (
                      <p className="text-center text-gray-400">No se encontraron resultados.</p>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

