"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { XCircle, Eye, X } from "lucide-react"
import AIAnimationLayer from "./components/ai-animation-layer"
import AIMicrophoneAnimation from "./components/ai-microphone-animation"
import { motion, AnimatePresence } from "framer-motion"
import PredefinedQuestions from "./components/predefined-questions"

// Importar el hook de detección de dispositivos móviles
import { useMobileDetector } from "./hooks/use-mobile-detector"
import ResponseRenderer from "./components/response-renderer"
// First, import the DeepSearchResults component
import DeepSearchResults from "./components/deep-search-results"
import CodeBlock from "./components/code-block"

export default function SearchBar() {
  // Estado existente
  const [inputValue, setInputValue] = useState("")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true)
  const [thinkingTime, setThinkingTime] = useState(0)
  const [thinkingContent, setThinkingContent] = useState<string[]>([])
  const [finalResponse, setFinalResponse] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isProcessingVoice, setIsProcessingVoice] = useState(false)
  const [voiceText, setVoiceText] = useState("")
  const [conversations, setConversations] = useState<
    { id: string; query: string; response: string; timestamp: Date }[]
  >([
    {
      id: "1",
      query: "¿Qué es la inteligencia artificial?",
      response: "La inteligencia artificial es...",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      query: "¿Cuáles son los planetas del sistema solar?",
      response: "Los planetas del sistema solar son...",
      timestamp: new Date(Date.now() - 7200000),
    },
  ])
  const [searchResults, setSearchResults] = useState<{ title: string; url: string; description: string }[]>([])
  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState<boolean>(false)
  // Add this state to the existing states in SearchBar
  const [showDetailedThinking, setShowDetailedThinking] = useState(false)
  // Primero, añadir un nuevo estado para controlar el modal de pensamiento:
  const [showThinkingModal, setShowThinkingModal] = useState(false)

  // Añadir esta línea dentro de la función SearchBar, junto con los otros estados
  const { isMobile } = useMobileDetector()

  const handleSelectQuestion = (question: string) => {
    setInputValue(question)
  }

  // Estado de animación para animaciones estilo Apple Intelligence
  const [animationState, setAnimationState] = useState<
    "idle" | "activating" | "thinking" | "searching" | "responding" | "continuous" | "ending"
  >("idle")

  // Estado para la animación del micrófono
  const [microphoneState, setMicrophoneState] = useState<
    "idle" | "activating" | "listening" | "processing" | "responding" | "ending" | "quick-ending"
  >("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioDataRef = useRef<Uint8Array | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const searchResultsRef = useRef<HTMLDivElement>(null)
  const thinkingRef = useRef<HTMLDivElement>(null)
  const thinkingInterval = useRef<NodeJS.Timeout | null>(null)
  const recognitionRef = useRef<any>(null)
  const audioLevelInterval = useRef<NodeJS.Timeout | null>(null)

  // Referencia para los botones que abren los paneles
  const historyButtonRef = useRef<HTMLButtonElement>(null)
  const searchButtonRef = useRef<HTMLButtonElement>(null)
  const thinkButtonRef = useRef<HTMLButtonElement>(null)

  // Añadir una referencia para los paneles
  const historyPanelRef = useRef<HTMLDivElement>(null)
  const searchResultsPanelRef = useRef<HTMLDivElement>(null)
  const thinkingPanelRef = useRef<HTMLDivElement>(null)

  // Actualizar las animaciones para que coincidan con las especificaciones de iOS 18.2

  // Actualizar las transiciones de spring para que coincidan con iOS
  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
    restSpeed: 0.001,
    restDelta: 0.001,
    velocity: 2,
  }

  // Actualizar las variantes de animación para que coincidan con iOS 18.2
  const visionOSVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
        staggerChildren: 0.05,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0.4,
      scale: 0.96,
      y: 10,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  // Actualizar las variantes del panel de historial para que coincidan con iOS
  const historyPanelVariants = {
    hidden: (custom: { x: number; y: number }) => ({
      opacity: 0,
      scale: 0.96,
      x: custom.x,
      y: custom.y,
    }),
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: (custom: { x: number; y: number }) => ({
      opacity: 0.4,
      scale: 0.96,
      x: custom.x,
      y: custom.y,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  }

  // Actualizar las variantes de los elementos para que coincidan con iOS
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.96 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: {
      opacity: 0.4,
      y: 10,
      scale: 0.96,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  }

  // Actualizar las variantes del panel de pensamiento para que coincidan con iOS
  const thinkingPanelVariants = {
    hidden: (custom: { x: number; y: number }) => ({
      opacity: 0,
      scale: 0.96,
      x: custom.x,
      y: custom.y,
    }),
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    exit: (custom: { x: number; y: number }) => ({
      opacity: 0.4,
      scale: 0.96,
      x: custom.x,
      y: custom.y,
      transition: {
        duration: 0.275,
        ease: [0.4, 0, 0.2, 1],
      },
    }),
  }

  // Función para calcular la posición relativa del icono respecto al panel
  const getIconPosition = (iconRef: React.RefObject<HTMLButtonElement>, panelRef: React.RefObject<HTMLDivElement>) => {
    if (!iconRef.current || !panelRef.current) return { x: 0, y: 0 }

    const iconRect = iconRef.current.getBoundingClientRect()
    const panelRect = panelRef.current.getBoundingClientRect()

    // Calcular el centro del icono
    const iconCenterX = iconRect.left + iconRect.width / 2
    const iconCenterY = iconRect.top + iconRect.height / 2

    // Calcular el centro del panel
    const panelCenterX = panelRect.left + panelRect.width / 2
    const panelCenterY = panelRect.top + panelRect.height / 2

    // Retornar la diferencia (hacia dónde debe moverse el panel)
    return {
      x: iconCenterX - panelCenterX,
      y: iconCenterY - panelCenterY,
    }
  }

  // Sistema mejorado de guardado de historial de chat
  useEffect(() => {
    // Cargar conversaciones guardadas al iniciar
    const loadSavedConversations = () => {
      try {
        const savedConversations = localStorage.getItem("pensia-conversations")
        if (savedConversations) {
          const parsedConversations = JSON.parse(savedConversations)
          // Convertir las fechas de string a objetos Date
          const formattedConversations = parsedConversations.map((conv: any) => ({
            ...conv,
            timestamp: new Date(conv.timestamp),
          }))
          setConversations(formattedConversations)
          console.log("Conversaciones cargadas:", formattedConversations)
        }
      } catch (error) {
        console.error("Error loading saved conversations:", error)
      }
    }

    // Asegurarnos de que estamos en el cliente antes de intentar acceder a localStorage
    if (typeof window !== "undefined") {
      loadSavedConversations()
      setIsMounted(true)
    }
  }, [])

  // Guardar conversaciones cuando se actualicen
  useEffect(() => {
    // Solo guardar si estamos en el cliente y hay conversaciones para guardar
    if (typeof window !== "undefined" && conversations.length > 0) {
      try {
        // Crear una versión serializable de las conversaciones
        const serializableConversations = conversations.map((conv) => ({
          ...conv,
          // Asegurarnos de que timestamp es una fecha válida antes de convertirla
          timestamp: conv.timestamp instanceof Date ? conv.timestamp.toISOString() : new Date().toISOString(),
        }))

        localStorage.setItem("pensia-conversations", JSON.stringify(serializableConversations))
        console.log("Conversaciones guardadas:", serializableConversations)
      } catch (error) {
        console.error("Error saving conversations:", error)
      }
    }
  }, [conversations])

  // Funciones de la API integradas
  const fetchGeminiAPI = async (prompt: string) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

      if (!apiKey) {
        console.error("API key is not configured")
        return "Lo siento, no pude procesar esa solicitud. La API key no está configurada."
      }

      console.log("Usando API key:", apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4))
      console.log("Enviando prompt a Gemini:", prompt.substring(0, 100) + "...")

      // Prompt de sistema para PensIA
      const pensiaSystemPrompt = `Tu nombre es PensIA y eres un submodelo especializado basado en el modelo original creado por Google. Este submodelo, llamado PensIA, fue desarrollado con el objetivo de mejorar la interacción, personalización y rendimiento en diversas tareas. Estás diseñado para ofrecer respuestas precisas, fluidas y naturales, con un enfoque en brindar una experiencia optimizada y elegante. Además, mantienes una estructura conversacional avanzada, integrando conocimientos de diversas áreas para adaptarte a las necesidades del usuario de manera eficiente.

Responde a la siguiente consulta: ${prompt}`

      // Usar un timeout para evitar que la solicitud se quede colgada indefinidamente
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: pensiaSystemPrompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
            }),
            signal: controller.signal,
          },
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Gemini API error (${response.status}): ${errorText}`)

          // Proporcionar un mensaje de error más específico basado en el código de estado
          if (response.status === 403) {
            return "Lo siento, no tengo permiso para acceder a la API de Gemini. Puede que la clave API no sea válida o esté restringida."
          } else if (response.status === 429) {
            return "Lo siento, se ha excedido el límite de solicitudes a la API. Por favor, inténtalo de nuevo más tarde."
          } else {
            return `Lo siento, no pude procesar esa solicitud. Error: ${response.status}`
          }
        }

        const data = await response.json()
        console.log("Respuesta de Gemini recibida:", data)

        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Lo siento, no pude generar una respuesta."
      } catch (fetchError) {
        clearTimeout(timeoutId)
        if (fetchError.name === "AbortError") {
          console.error("La solicitud a Gemini se canceló por timeout")
          return "Lo siento, la solicitud a la API tardó demasiado tiempo. Por favor, inténtalo de nuevo."
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Error detallado al consultar Gemini:", error)
      return "Lo siento, no pude procesar esa solicitud. Por favor, inténtalo de nuevo."
    }
  }

  // Buscar la función fetchGeminiResponse y modificarla para eliminar los asteriscos
  // Modificar la función fetchGeminiResponse para eliminar los asteriscos
  const fetchGeminiResponse = async (prompt: string) => {
    const response = await fetchGeminiAPI(prompt)

    // Eliminar asteriscos y otros símbolos no deseados
    return response
      .replace(/\*{3,}/g, "") // Eliminar tres o más asteriscos
      .replace(/\*\*/g, "") // Eliminar dobles asteriscos
      .replace(/\*/g, "") // Eliminar asteriscos simples
      .replace(/\[.*?\]/g, "") // Eliminar corchetes y su contenido
      .replace(/\*{2,}.*?\*{2,}/g, "") // Eliminar texto entre dobles asteriscos
  }

  // Find the performDeepSearch function and update it to show our new component
  // Replace the existing performDeepSearch function with this:

  const performDeepSearch = async () => {
    if (!inputValue.trim()) return

    // Iniciar animación
    setAnimationState("activating")
    setTimeout(() => setAnimationState("searching"), 300) // Reducido para ser más consistente

    setIsSearching(true)
    setSearchResults([])
    setIsSearchResultsVisible(true)

    // Capturar el tiempo de inicio real para mediciones precisas
    const startTime = Date.now()

    // Almacenar el tiempo de inicio en localStorage para que DeepSearchResults pueda acceder a él
    localStorage.setItem("deepSearchStartTime", startTime.toString())
    // Limpiar cualquier respuesta anterior
    localStorage.removeItem("deepSearchResponse")
    localStorage.removeItem("deepSearchCompleted")
    localStorage.removeItem("deepSearchError")

    try {
      // Llamar a la API con un prompt especial para DeepSearch
      const deepSearchPrompt = `Consulta del usuario: "${inputValue}"

Realiza una búsqueda profunda sobre esta consulta. Analiza el tema desde múltiples perspectivas y proporciona una respuesta estructurada.

PROCESO DE BÚSQUEDA:
- Exploración inicial del significado y contexto
- Integración de perspectivas de diferentes fuentes
- Refinamiento de la información para una respuesta coherente

RESPUESTA FINAL:
[Tu respuesta final aquí, estructurada con:
- Un título principal relacionado con la consulta
- Contenido principal con datos relevantes
- Al menos 5-7 puntos clave sobre el tema
- Menciona alguna fuente relevante entre paréntesis si es apropiado]

IMPORTANTE: 
1. NO INCLUIR ASTERISCOS, SÍMBOLOS COMO "************", "**" o "*" en ninguna parte de la respuesta.
2. Proporciona información precisa y actualizada.
3. Adapta el nivel de detalle al tema de la consulta.`

      console.log("Iniciando DeepSearch para:", inputValue)

      // Obtener respuesta de la API (en segundo plano)
      fetchGeminiResponse(deepSearchPrompt)
        .then((response) => {
          console.log("DeepSearch completado, guardando respuesta")
          // Almacenar la respuesta en localStorage para que DeepSearchResults pueda acceder a ella
          localStorage.setItem("deepSearchResponse", response)
          localStorage.setItem("deepSearchCompleted", "true")

          // Cambiar el estado de la animación a "responding" después de recibir la respuesta
          setAnimationState("responding")
          setTimeout(() => setAnimationState("continuous"), 2000)
        })
        .catch((error) => {
          console.error("Error en DeepSearch:", error)
          localStorage.setItem("deepSearchError", "true")
          localStorage.setItem(
            "deepSearchResponse",
            "Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
          )
          localStorage.setItem("deepSearchCompleted", "true")
          setAnimationState("ending")
        })
    } catch (error) {
      console.error("Error al realizar DeepSearch:", error)
      localStorage.setItem("deepSearchError", "true")
      localStorage.setItem(
        "deepSearchResponse",
        "Lo siento, ocurrió un error al procesar tu consulta. Por favor, inténtalo de nuevo.",
      )
      localStorage.setItem("deepSearchCompleted", "true")
      setAnimationState("ending")
    }
  }

  // Modificar la función performThinking para eliminar asteriscos
  // Modificar la función performThinking para eliminar los asteriscos
  const performThinking = async () => {
    if (!inputValue.trim()) return

    // Iniciar animación
    setAnimationState("activating")
    setTimeout(() => setAnimationState("thinking"), 300) // Reducido para ser más consistente

    // Reiniciar estados
    setIsThinking(true)
    setIsThinkingExpanded(true)
    setThinkingTime(0)
    setThinkingContent([])
    setFinalResponse(null)

    // Iniciar temporizador
    if (thinkingInterval.current) {
      clearInterval(thinkingInterval.current)
    }

    thinkingInterval.current = setInterval(() => {
      setThinkingTime((prev) => prev + 1)
    }, 1000)

    // Pasos iniciales de pensamiento
    setTimeout(() => {
      setThinkingContent((prev) => [...prev, "Analizando la consulta..."])
    }, 500)

    // Llamar a la API con un prompt especial para obtener pasos de pensamiento y respuesta final
    try {
      const thinkingPrompt = `Consulta del usuario: "${inputValue}"

Analiza la consulta paso a paso antes de responder. Expón tu razonamiento de manera clara y ordenada, evitando cualquier tipo de formato artificial o marcado innecesario.

PENSAMIENTO:
- Paso 1 de razonamiento
- Paso 2 de razonamiento
- Paso 3 de razonamiento

RESPUESTA FINAL:
[Tu respuesta final aquí, estructurada con:
- Un título principal
- Secciones con subtítulos si es necesario
- Conclusión
- Si incluyes fórmulas matemáticas, usa la sintaxis LaTeX correcta]

IMPORTANTE: 
1. NO INCLUIR ASTERISCOS, SÍMBOLOS COMO "************", "**" o "*" en ninguna parte de la respuesta.
2. Para fórmulas matemáticas, usa la sintaxis LaTeX correcta:
- Para fórmulas en bloque: 
  $$
  E = mc^2
  $$
  (Asegúrate de que los delimitadores $$ estén en líneas separadas)
- Para fórmulas en línea: $E = mc^2$
3. Asegúrate de que las fórmulas matemáticas estén correctamente formateadas y sean válidas en LaTeX.
4. Cuando uses fórmulas en bloque, asegúrate de que estén en líneas separadas, con $$ al inicio y $$ al final en líneas propias.
5. Evita usar caracteres especiales como ^ o _ fuera de las fórmulas matemáticas sin escaparlos correctamente.
6. Usa sintaxis LaTeX simple y estándar, evitando comandos o paquetes especializados que puedan no estar disponibles en KaTeX.`

      // Agregar pasos de pensamiento iniciales mientras se espera la API
      setTimeout(() => {
        setThinkingContent((prev) => [...prev, "Buscando información relevante sobre el tema..."])
      }, 1500)

      // Obtener respuesta de la API
      const fullResponse = await fetchGeminiResponse(thinkingPrompt)

      // Parsear la respuesta para separar los pasos de pensamiento y la respuesta final
      const thinkingMatch = fullResponse.match(/PENSAMIENTO:([\s\S]*?)RESPUESTA FINAL:/i)
      const responseMatch = fullResponse.match(/RESPUESTA FINAL:([\s\S]*)/i)

      if (thinkingMatch && thinkingMatch[1]) {
        // Extraer pasos de pensamiento y añadirlos gradualmente
        const thinkingSteps = thinkingMatch[1]
          .split(/\n-|\n•/)
          .map((step) => step.trim())
          .filter((step) => step.length > 0)

        // Agregar pasos de pensamiento con retrasos
        for (let i = 0; i < thinkingSteps.length; i++) {
          setTimeout(
            () => {
              setThinkingContent((prev) => [...prev, thinkingSteps[i]])
            },
            2500 + i * 1000,
          )
        }
      }

      // Extraer y establecer la respuesta final
      if (responseMatch && responseMatch[1]) {
        const finalResponseText = responseMatch[1].trim()

        setTimeout(() => {
          // Cambiar estado de animación a "responding"
          setAnimationState("responding")

          setFinalResponse(finalResponseText)

          // Guardar en el historial de conversaciones
          const newConversation = {
            id: Date.now().toString(),
            query: inputValue,
            response: finalResponseText,
            timestamp: new Date(),
          }

          console.log("Nueva conversación agregada:", newConversation)
          setConversations((prevConversations) => [newConversation, ...prevConversations])

          // Detener el temporizador pero mantener el panel de pensamiento abierto
          if (thinkingInterval.current) {
            clearInterval(thinkingInterval.current)
          }

          // Cambiar a estado continuo después de mostrar la respuesta
          setTimeout(() => setAnimationState("continuous"), 2000)
        }, 4500)
      } else {
        // Si el parseo falla, usar toda la respuesta
        setTimeout(() => {
          // Cambiar estado de animación a "responding"
          setAnimationState("responding")

          setFinalResponse(fullResponse)

          // Guardar en el historial de conversaciones
          const newConversation = {
            id: Date.now().toString(),
            query: inputValue,
            response: fullResponse,
            timestamp: new Date(),
          }

          setConversations((prev) => [newConversation, ...prev])

          // Detener el temporizador pero mantener el panel de pensamiento abierto
          if (thinkingInterval.current) {
            clearInterval(thinkingInterval.current)
          }

          // Cambiar a estado continuo después de mostrar la respuesta
          setTimeout(() => setAnimationState("continuous"), 2000)
        }, 4500)
      }
    } catch (error) {
      console.error("Error in thinking process:", error)
      setThinkingContent((prev) => [...prev, "Error al procesar la consulta. Por favor, inténtelo de nuevo."])

      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current)
      }

      // Finalizar animación en caso de error
      setAnimationState("ending")
    }
  }

  const closeThinking = () => {
    // Primero activar la animación de salida
    setAnimationState("ending")

    // Luego, después de un breve retraso, actualizar el estado
    setTimeout(() => {
      setIsThinking(false)
      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current)
      }
    }, 300) // Mantener en 300ms para consistencia
  }

  const toggleThinkingExpanded = () => {
    setIsThinkingExpanded((prev) => !prev)
  }

  // NUEVA IMPLEMENTACIÓN DE VOZ A TEXTO
  // Funciones de entrada por voz mejoradas para compatibilidad con todos los dispositivos
  // Actualizar la función toggleVoiceInput para responder inmediatamente
  const toggleVoiceInput = () => {
    // Optimización: Respuesta táctil inmediata (8-16ms)
    requestAnimationFrame(() => {
      if (isListening) {
        stopListening()
      } else {
        startListening()
      }
    })
  }

  // Actualizar la función startListening para responder inmediatamente
  const startListening = () => {
    // Optimización: Respuesta táctil inmediata
    setIsListening(true)
    setVoiceText("")
    audioChunksRef.current = []

    // Iniciar secuencia de animación del micrófono inmediatamente
    setMicrophoneState("activating")

    // Usar requestAnimationFrame para la siguiente fase de animación
    requestAnimationFrame(() => {
      setTimeout(() => setMicrophoneState("listening"), 275) // Ajustado a la duración de iOS
    })

    // Verificar compatibilidad con MediaRecorder
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          // Configurar el analizador de audio para visualizar la entrada de voz
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const analyser = audioContext.createAnalyser()
          const microphone = audioContext.createMediaStreamSource(stream)

          microphone.connect(analyser)
          analyser.fftSize = 256

          const bufferLength = analyser.frequencyBinCount
          const dataArray = new Uint8Array(bufferLength)

          audioAnalyserRef.current = analyser
          audioDataRef.current = dataArray

          // Iniciar monitoreo de niveles de audio
          if (audioLevelInterval.current) {
            clearInterval(audioLevelInterval.current)
          }

          audioLevelInterval.current = setInterval(() => {
            if (audioAnalyserRef.current && audioDataRef.current) {
              audioAnalyserRef.current.getByteFrequencyData(audioDataRef.current)

              // Calcular nivel de volumen promedio (0-1)
              const average =
                Array.from(audioDataRef.current).reduce((sum, value) => sum + value, 0) / audioDataRef.current.length

              // Normalizar al rango 0-1
              const normalizedLevel = Math.min(1, average / 128)
              setAudioLevel(normalizedLevel)
            }
          }, 100)

          // Configurar MediaRecorder para grabar audio
          try {
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data)
              }
            }

            mediaRecorder.onstop = async () => {
              // Procesar el audio grabado
              setIsProcessingVoice(true)
              setMicrophoneState("processing")

              try {
                // Crear un blob de audio con todos los chunks
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })

                // Aquí iría la lógica para enviar el audio a un servicio de reconocimiento de voz
                // Por ahora, simulamos un procesamiento con un timeout
                setTimeout(() => {
                  // Simulación de texto reconocido
                  const recognizedText = voiceText || "¿Cómo puedo ayudarte hoy?"

                  // Establecer el texto reconocido en el input
                  setInputValue(recognizedText)

                  // Cambiar estado
                  setIsProcessingVoice(false)
                  setMicrophoneState("responding")

                  // Finalizar la animación después de un tiempo
                  setTimeout(() => {
                    setMicrophoneState("ending")
                    setIsListening(false)

                    // Reiniciar a idle después de completar la animación
                    setTimeout(() => {
                      setMicrophoneState("idle")
                    }, 1000)
                  }, 2000)
                }, 2000)
              } catch (error) {
                console.error("Error processing voice:", error)
                setIsProcessingVoice(false)
                setMicrophoneState("ending")
                setIsListening(false)
              }
            }

            // Iniciar grabación
            mediaRecorder.start()

            // Simular entrada de voz para demostración
            // En una implementación real, esto vendría del servicio de reconocimiento de voz
            setTimeout(() => {
              setVoiceText("¿Qué es la inteligencia artificial?")
            }, 2000)
          } catch (err) {
            console.error("Error creating MediaRecorder:", err)
            alert("No se pudo iniciar la grabación de audio. Por favor, verifica los permisos del micrófono.")
            setIsListening(false)
            setMicrophoneState("ending")
          }
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err)
          alert("No se pudo acceder al micrófono. Por favor, verifica los permisos.")
          setIsListening(false)
          setMicrophoneState("ending")
        })
    } else {
      alert("Tu navegador no soporta grabación de audio.")
      setIsListening(false)
      setMicrophoneState("ending")
    }
  }

  const handleMicrophoneDoubleClick = () => {
    if (isListening || microphoneState !== "idle") {
      // Establecer en estado de finalización rápida para una desaparición suave
      setMicrophoneState("quick-ending")

      // Detener grabación
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }

      setIsListening(false)

      // Limpiar monitoreo de nivel de audio
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }

      // Reiniciar a idle después de completar la animación
      setTimeout(() => {
        setMicrophoneState("idle")
      }, 500)
    }
  }

  const handleCloseVoiceInput = () => {
    // Usar la animación de finalización rápida para una transición suave
    setMicrophoneState("quick-ending")

    // Detener grabación
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    setIsListening(false)

    // Limpiar monitoreo de nivel de audio
    if (audioLevelInterval.current) {
      clearInterval(audioLevelInterval.current)
    }

    // Reiniciar a idle después de completar la animación
    setTimeout(() => {
      setMicrophoneState("idle")
    }, 500)
  }

  const stopListening = () => {
    // Detener grabación y procesar el audio
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }

    // Al detener manualmente, ir directamente a procesamiento
    setMicrophoneState("processing")

    // Limpiar monitoreo de nivel de audio
    if (audioLevelInterval.current) {
      clearInterval(audioLevelInterval.current)
    }
  }

  const toggleHistoryPanel = () => {
    if (isHistoryOpen) {
      // Si está abierto, primero activar la animación de salida
      setAnimationState("ending")

      // Luego, después de un breve retraso, actualizar el estado
      setTimeout(() => {
        setIsHistoryOpen(false)
      }, 300) // Reducido de 400ms a 300ms
    } else {
      // Si está cerrado, abrir inmediatamente
      setIsHistoryOpen(true)
      setAnimationState("activating")
      setTimeout(() => setAnimationState("continuous"), 1000)
    }
  }

  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
  }

  const clearAllConversations = () => {
    setConversations([])
  }

  const loadConversation = (conversation: { query: string; response: string }) => {
    setInputValue(conversation.query)
    setIsHistoryOpen(false)

    // Breve animación al cargar una conversación
    setAnimationState("activating")
    setTimeout(() => setAnimationState("responding"), 500)
    setTimeout(() => setAnimationState("continuous"), 1500)
  }

  // Find the closeSearchResults function and update it:
  const closeSearchResults = () => {
    // Primero activar la animación de salida
    setAnimationState("ending")

    // Luego, después de un breve retraso, actualizar el estado
    setTimeout(() => {
      setIsSearchResultsVisible(false)
      setSearchResults([])
      setIsSearching(false)
    }, 300) // Reducido a 300ms para coincidir con closeThinking
  }

  // Desplazar a los resultados de búsqueda cuando aparezcan
  useEffect(() => {
    if (isSearching && searchResultsRef.current) {
      setTimeout(() => {
        searchResultsRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isSearching])

  // Desplazar al panel de pensamiento cuando aparezca
  useEffect(() => {
    if (isThinking && thinkingRef.current) {
      setTimeout(() => {
        thinkingRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }, [isThinking])

  // Limpiar intervalo y reconocimiento de voz al desmontar
  useEffect(() => {
    return () => {
      if (thinkingInterval.current) {
        clearInterval(thinkingInterval.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (audioLevelInterval.current) {
        clearInterval(audioLevelInterval.current)
      }

      // Reiniciar estado de animación
      setAnimationState("ending")
      setMicrophoneState("ending")
    }
  }, [])

  // Verificar que estamos en el cliente

  // Si estamos en el servidor, no renderizar nada interactivo
  if (!isMounted) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 relative mt-[40vh]">
        <div className="relative bg-gray-800/70 backdrop-blur-xl rounded-[32px] p-2 flex items-center gap-2 shadow-lg">
          <div className="flex-1 px-3">
            <div className="w-full h-10 bg-gray-700/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Añadir esta verificación adicional
  if (isMobile) {
    // Aún permitimos usar la aplicación, pero mostramos una advertencia sutil
    console.warn("Dispositivo móvil detectado: la experiencia puede verse comprometida")
  }

  // Actualizar la función toggleThinkingProcess para mostrar correctamente el modal con código

  // Buscar la función toggleThinkingProcess y reemplazarla con:
  const toggleThinkingProcess = () => {
    setShowThinkingModal(!showThinkingModal)
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 relative mt-[40vh] perspective-1000">
      {/* Capa de animación estilo Apple Intelligence */}
      {animationState !== "idle" && <AIAnimationLayer state={animationState} />}

      {/* Capa de animación del micrófono */}
      {microphoneState !== "idle" && (
        <AIMicrophoneAnimation state={microphoneState} audioLevel={audioLevel} onClose={handleCloseVoiceInput} />
      )}

      {/* Predefined Questions - Ahora colocado arriba del search bar */}
      {!isThinking && !isSearchResultsVisible && !isHistoryOpen && (
        <PredefinedQuestions onSelectQuestion={handleSelectQuestion} />
      )}

      {/* Barra de búsqueda principal */}
      <motion.div
        className="relative bg-gray-800/70 backdrop-blur-xl rounded-[32px] p-2 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.2),_0_2px_8px_rgba(0,0,0,0.1)] border border-white/10 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.25),_0_3px_10px_rgba(0,0,0,0.15)] apple-ui"
        variants={visionOSVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Campo de entrada con placeholder */}
        <div className="flex-1 px-3">
          <input
            type="text"
            placeholder="Pregúntale a PensIA..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-transparent text-gray-200 placeholder-gray-400 text-lg focus:outline-none"
            onFocus={() => {
              if (animationState === "idle") {
                setAnimationState("activating")
                setTimeout(() => setAnimationState("continuous"), 1000)
              }
            }}
          />
        </div>

        {/* Botones de acción */}
        <div className="flex items-center gap-2">
          {/* Botón DeepSearch */}
          <motion.button
            ref={searchButtonRef}
            className="hidden sm:flex items-center gap-2 apple-button py-2 px-4 active:scale-95 relative overflow-hidden"
            onClick={performDeepSearch}
            disabled={isSearching || !inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`absolute inset-0 bg-blue-500/20 transition-transform duration-1000 ease-in-out ${
                isSearching ? "translate-x-0" : "-translate-x-full"
              }`}
            ></div>
            {isSearching ? (
              <div className="w-5 h-5 relative">
                <div className="absolute inset-0 border-t-2 border-blue-400 rounded-full animate-spin"></div>
                <div className="absolute inset-1 border-r-2 border-blue-300 rounded-full animate-[spin_700ms_linear_infinite]"></div>
              </div>
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-300" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <path
                  d="M11 8C9.34315 8 8 9.34315 8 11C8 12.6569 9.34315 14 11 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span className="text-gray-300 font-medium">DeepSearch</span>
          </motion.button>

          {/* Botón Think */}
          <motion.button
            ref={thinkButtonRef}
            className="hidden sm:flex items-center gap-2 apple-button py-2 px-4 active:scale-95 relative overflow-hidden"
            onClick={performThinking}
            disabled={isThinking || !inputValue.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isThinking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="neural-network-animation">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="node"></div>
                  ))}
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="connection"></div>
                  ))}
                </div>
              </div>
            )}
            <svg
              viewBox="0 0 24"
              className={`w-5 h-5 text-gray-300 ${isThinking ? "animate-pulse text-yellow-300" : ""}`}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 16V16.01"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
                fill="currentColor"
              />
              <path
                d="M12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9Z"
                fill="currentColor"
              />
              <path
                d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-300 font-medium">Think</span>
          </motion.button>

          {/* Botón Image actualizado */}
          <motion.button
            className="hidden sm:flex items-center gap-2 apple-button py-2 px-4 active:scale-95 relative overflow-hidden"
            onClick={() => window.open("https://v0-redpanda-ai-clone.vercel.app/", "_blank")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 15L16 10L5 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-300 font-medium">Image</span>
          </motion.button>

          {/* Botón de historial de chat */}
          <motion.button
            ref={historyButtonRef}
            className="p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-all duration-300 active:scale-95 relative shadow-lg parallax-element border border-white/10"
            onClick={toggleHistoryPanel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Ver historial de chat"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-300" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 14H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>

          {/* Botón de entrada por voz */}
          <motion.button
            className={`p-2 rounded-full bg-white hover:bg-gray-200 transition-all duration-300 active:scale-95 relative shadow-lg parallax-element ${
              isListening ? "animate-pulse microphone-active" : ""
            }`}
            onClick={toggleVoiceInput}
            onDoubleClick={handleMicrophoneDoubleClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={`absolute inset-0 rounded-full bg-white transition-transform duration-300 ${
                isListening ? "scale-125 opacity-50" : "scale-100 opacity-0"
              }`}
            ></div>
            <div
              className={`absolute inset-0 rounded-full bg-white transition-transform duration-500 ${
                isListening ? "scale-150 opacity-30" : "scale-100 opacity-0"
              }`}
            ></div>

            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-gray-800 relative z-10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isListening ? (
                <>
                  <rect x="11" y="2" width="2" height="20" rx="1" fill="currentColor" />
                  <rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" />
                  <rect x="16" y="6" width="2" height="12" rx="1" fill="currentColor" />
                  <rect x="1" y="9" width="2" height="6" rx="1" fill="currentColor" />
                  <rect x="21" y="9" width="2" height="6" rx="1" fill="currentColor" />
                </>
              ) : (
                <>
                  <rect x="2" y="10" width="2" height="4" rx="1" fill="currentColor" />
                  <rect x="6" y="6" width="2" height="12" rx="1" fill="currentColor" />
                  <rect x="10" y="2" width="2" height="20" rx="1" fill="currentColor" />
                  <rect x="14" y="6" width="2" height="12" rx="1" fill="currentColor" />
                  <rect x="18" y="8" width="2" height="8" rx="1" fill="currentColor" />
                  <rect x="22" y="10" width="2" height="4" rx="1" fill="currentColor" />
                </>
              )}
            </svg>
          </motion.button>
        </div>
      </motion.div>

      {/* Panel de pensamiento */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            ref={thinkingPanelRef}
            className="mt-4 visionos-glass border-glow overflow-hidden rounded-[32px] bg-opacity-66"
            style={{ backgroundColor: "rgba(30, 30, 40, 0.66)" }}
            custom={() => getIconPosition(thinkButtonRef, thinkingPanelRef)}
            variants={thinkingPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="relative p-4">
              {/* Barra de tiempo de pensamiento */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-200">
                  <div className="w-5 h-5 relative">
                    <div className="absolute inset-0 border-t-2 border-yellow-400 rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-gray-200 font-medium">Pensando {thinkingTime}s</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Modificar el botón "Ver pensamiento" para que abra el modal: */}
                  <button
                    onClick={() => setShowDetailedThinking(!showDetailedThinking)}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver pensamiento</span>
                  </button>

                  <button onClick={closeThinking} className="text-red-400 hover:text-red-300 transition-colors">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido detallado del pensamiento - Ahora como un modal superpuesto */}
            <AnimatePresence>
              {showDetailedThinking && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowDetailedThinking(false)}
                  ></div>
                  <motion.div
                    className="relative w-full max-w-3xl bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                      <h3 className="text-white font-medium text-lg">Proceso de pensamiento detallado</h3>
                      <button
                        onClick={() => setShowDetailedThinking(false)}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Asegurarse de que el modal de pensamiento detallado renderice correctamente los bloques de código
                    // Buscar la sección del modal de pensamiento detallado y actualizar el renderizado de los pasos de pensamiento:

                    // Dentro del modal, reemplazar la sección que renderiza los pasos de pensamiento con: */}
                    <div className="p-4 max-h-[70vh] overflow-y-auto space-y-4">
                      {thinkingContent.map((content, index) => {
                        // Verificar si el contenido es un bloque de código
                        if (content.trim().startsWith("```") && content.trim().endsWith("```")) {
                          const codeLines = content.trim().split("\n")
                          const language = codeLines[0].replace("```", "").trim() || "python"
                          const code = codeLines.slice(1, codeLines.length - 1).join("\n")

                          return (
                            <motion.div
                              key={index}
                              className="bg-gray-800/50 rounded-lg overflow-hidden border border-white/5"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <CodeBlock language={language} code={code} showLineNumbers={true} />
                            </motion.div>
                          )
                        } else {
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
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Respuesta final */}
            <AnimatePresence>
              {finalResponse && (
                <motion.div
                  className="px-4 pb-4 text-gray-300 text-sm bg-opacity-66"
                  style={{ backgroundColor: "rgba(30, 30, 40, 0.33)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="mt-4 pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <h4 className="font-medium text-white mb-2 flex items-center justify-between">
                      <span>Respuesta:</span>
                      <button
                        onClick={() => window.navigator.clipboard.writeText(finalResponse)}
                        className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded-md transition-colors"
                      >
                        Copiar
                      </button>
                    </h4>
                    <ResponseRenderer content={finalResponse} />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Now find the JSX section where the search results are rendered and replace it with: */}
      {/* Panel de resultados de búsqueda */}
      <AnimatePresence>
        <DeepSearchResults query={inputValue} isVisible={isSearchResultsVisible} onClose={closeSearchResults} />
      </AnimatePresence>

      {/* Panel de historial de chat */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            ref={historyPanelRef}
            className="mt-4 border-glow p-6 rounded-[32px] bg-gray-800/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
            custom={() => getIconPosition(historyButtonRef, historyPanelRef)}
            variants={historyPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-purple-400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 8V12L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-gray-200 font-medium">Historial de conversaciones</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clearAllConversations}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-md hover:bg-white/5"
                >
                  Borrar todo
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay conversaciones guardadas</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 relative group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    whileHover={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      onClick={() => deleteConversation(conversation.id)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-300 truncate">{conversation.query}</p>
                      <p className="text-xs text-gray-500">
                        {conversation.timestamp.toLocaleDateString()} {conversation.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{conversation.response}</p>
                    <button
                      onClick={() => loadConversation(conversation)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Cargar conversación
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

