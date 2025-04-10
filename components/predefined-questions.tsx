"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface QuestionCategory {
  emoji: string
  title: string
  questions: string[]
}

interface PredefinedQuestionsProps {
  onSelectQuestion: (question: string) => void
}

export default function PredefinedQuestions({ onSelectQuestion }: PredefinedQuestionsProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const categories: QuestionCategory[] = [
    {
      emoji: "🔹",
      title: "Salud",
      questions: [
        "¿Cuáles son los síntomas de la gripe y cómo tratarla?",
        "¿Qué alimentos ayudan a fortalecer el sistema inmunológico?",
        "¿Cuáles son los beneficios del ejercicio para la salud mental?",
      ],
    },
    {
      emoji: "🏛️",
      title: "Filosofía",
      questions: [
        "¿Cuál es el significado de la vida según diferentes filosofías?",
        "¿Qué opinaba Aristóteles sobre la felicidad?",
        "¿Por qué se dice que 'pienso, luego existo'?",
      ],
    },
    {
      emoji: "🌍",
      title: "Cambio Climático",
      questions: [
        "¿Cuáles son las principales causas del cambio climático?",
        "¿Qué acciones individuales pueden ayudar a reducir la huella de carbono?",
        "¿Cómo impacta la deforestación en el calentamiento global?",
      ],
    },
    {
      emoji: "📜",
      title: "Historia",
      questions: [
        "¿Cuáles fueron las principales causas de la Segunda Guerra Mundial?",
        "¿Quién fue Simón Bolívar y qué hizo por América Latina?",
        "¿Cómo cayó el Imperio Romano?",
      ],
    },
    {
      emoji: "🧠",
      title: "Ciencia",
      questions: [
        "¿Cómo funciona la inteligencia artificial?",
        "¿Qué es la computación cuántica?",
        "¿Cuáles son los avances más recientes en medicina?",
      ],
    },
    {
      emoji: "🚀",
      title: "Espacio",
      questions: [
        "¿Cómo nació el universo según la teoría del Big Bang?",
        "¿Qué es la materia oscura?",
        "¿Cuándo será posible viajar a Marte?",
      ],
    },
    {
      emoji: "📈",
      title: "Economía",
      questions: [
        "¿Qué es la inflación y cómo afecta la economía?",
        "¿Cómo funciona el mercado de criptomonedas?",
        "¿Qué estrategias existen para ahorrar dinero?",
      ],
    },
    {
      emoji: "🎭",
      title: "Arte",
      questions: [
        "¿Quién fue Leonardo da Vinci y cuáles fueron sus aportes?",
        "¿Cómo influyó el Renacimiento en el arte?",
        "¿Qué impacto tuvo la música clásica en la historia?",
      ],
    },
    {
      emoji: "🏆",
      title: "Deportes",
      questions: [
        "¿Qué ejercicios son ideales para ganar masa muscular?",
        "¿Cómo puedo mejorar mi resistencia al correr?",
        "¿Cuáles son los beneficios del yoga para la salud?",
      ],
    },
    {
      emoji: "🛠️",
      title: "Desarrollo",
      questions: [
        "¿Cómo mejorar mis habilidades de comunicación?",
        "¿Cuáles son las mejores técnicas de estudio?",
        "¿Cómo desarrollar una mentalidad de crecimiento?",
      ],
    },
  ]

  const toggleCategory = (title: string) => {
    if (expandedCategory === title) {
      setExpandedCategory(null)
    } else {
      setExpandedCategory(title)
    }
  }

  const handleQuestionClick = (question: string) => {
    onSelectQuestion(question)
    setExpandedCategory(null)
  }

  // Dividir las categorías en dos filas de 5
  const firstRow = categories.slice(0, 5)
  const secondRow = categories.slice(5, 10)

  return (
    <div className="w-full max-w-3xl mx-auto mb-4 relative">
      <AnimatePresence>
        {expandedCategory && (
          <motion.div
            className="fixed inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandedCategory(null)}
          />
        )}
      </AnimatePresence>

      {/* Primera fila */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-2">
        {firstRow.map((category) => (
          <div key={category.title} className="relative">
            <motion.button
              className="w-full backdrop-blur-md bg-white/10 border border-white/5 rounded-full px-2 py-1.5 text-xs text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors"
              onClick={() => toggleCategory(category.title)}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
              animate={
                expandedCategory === category.title
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }
                  : {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      scale: 1,
                      transition: { duration: 0.2 },
                    }
              }
            >
              <span>{category.emoji}</span>
              <span className="truncate">{category.title}</span>
            </motion.button>

            <AnimatePresence>
              {expandedCategory === category.title && (
                <motion.div
                  className="absolute z-10 left-0 top-full mt-2 bg-gray-800/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl w-64 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9, y: -5, transformOrigin: "top center" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -5,
                    transition: {
                      duration: 0.2,
                      ease: [0.32, 0.72, 0, 1],
                    },
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.2, 0],
                      transition: {
                        times: [0, 0.5, 1],
                        duration: 1.5,
                        ease: "easeOut",
                      },
                    }}
                  />
                  <motion.div
                    className="p-2 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        delay: 0.1,
                        duration: 0.2,
                      },
                    }}
                  >
                    {category.questions.map((question, index) => (
                      <motion.button
                        key={index}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 rounded-md hover:bg-white/10 transition-colors"
                        onClick={() => handleQuestionClick(question)}
                        initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          filter: "blur(0px)",
                          transition: {
                            duration: 0.3,
                            delay: 0.1 + index * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Segunda fila */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {secondRow.map((category) => (
          <div key={category.title} className="relative">
            <motion.button
              className="w-full backdrop-blur-md bg-white/10 border border-white/5 rounded-full px-2 py-1.5 text-xs text-gray-200 flex items-center justify-center gap-1.5 hover:bg-white/15 transition-colors"
              onClick={() => toggleCategory(category.title)}
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{
                scale: 0.95,
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
              animate={
                expandedCategory === category.title
                  ? {
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }
                  : {
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      scale: 1,
                      transition: { duration: 0.2 },
                    }
              }
            >
              <span>{category.emoji}</span>
              <span className="truncate">{category.title}</span>
            </motion.button>

            <AnimatePresence>
              {expandedCategory === category.title && (
                <motion.div
                  className="absolute z-10 left-0 top-full mt-2 bg-gray-800/80 backdrop-blur-xl rounded-lg border border-white/10 shadow-xl w-64 overflow-hidden"
                  initial={{ opacity: 0, scale: 0.9, y: -5, transformOrigin: "top center" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      mass: 0.8,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: -5,
                    transition: {
                      duration: 0.2,
                      ease: [0.32, 0.72, 0, 1],
                    },
                  }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 0.2, 0],
                      transition: {
                        times: [0, 0.5, 1],
                        duration: 1.5,
                        ease: "easeOut",
                      },
                    }}
                  />
                  <motion.div
                    className="p-2 space-y-1"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        delay: 0.1,
                        duration: 0.2,
                      },
                    }}
                  >
                    {category.questions.map((question, index) => (
                      <motion.button
                        key={index}
                        className="w-full text-left px-3 py-2 text-xs text-gray-300 rounded-md hover:bg-white/10 transition-colors"
                        onClick={() => handleQuestionClick(question)}
                        initial={{ opacity: 0, x: -10, filter: "blur(2px)" }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          filter: "blur(0px)",
                          transition: {
                            duration: 0.3,
                            delay: 0.1 + index * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }}
                      >
                        {question}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  )
}

