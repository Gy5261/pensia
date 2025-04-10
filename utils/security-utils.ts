// Archivo con código ofuscado para protección adicional

// Función para generar una clave aleatoria para ofuscación
const generateKey = () => {
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))
    .map((n) => String.fromCharCode(n))
    .join("")
}

// Clave de ofuscación
const _0x4f2a = generateKey()

// Función para ofuscar una cadena
const _0x3e7b = (str: string): string => {
  let result = ""
  for (let i = 0; i < str.length; i++) {
    result += String.fromCharCode(str.charCodeAt(i) ^ _0x4f2a.charCodeAt(i % _0x4f2a.length))
  }
  return btoa(result)
}

// Función para desofuscar una cadena
const _0x2c9d = (str: string): string => {
  const decoded = atob(str)
  let result = ""
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ _0x4f2a.charCodeAt(i % _0x4f2a.length))
  }
  return result
}

// Funciones de seguridad ofuscadas
export const securityFunctions = {
  // Detectar herramientas de desarrollo
  detectDevTools: () => {
    const devToolsOpened = false

    // Método 1: Diferencia de tamaño
    const checkSize = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160
      const heightThreshold = window.outerHeight - window.innerHeight > 160
      return widthThreshold || heightThreshold
    }

    // Método 2: Tiempo de ejecución
    const checkDebugger = () => {
      const start = Date.now()
      debugger
      return Date.now() - start > 100
    }

    // Método 3: Detección por console.profile
    const checkConsoleProfile = () => {
      let devToolsOpened = false

      const handler = {
        get: (target: any, name: string) => {
          if (name === "length") {
            devToolsOpened = true
          }
          return target[name]
        },
      }

      const proxy = new Proxy([], handler)
      console.profile(proxy)
      console.profileEnd()

      return devToolsOpened
    }

    return checkSize() || checkDebugger() || checkConsoleProfile()
  },

  // Bloquear teclas de inspección
  blockInspectKeys: (e: KeyboardEvent) => {
    // Bloquear F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) ||
      (e.ctrlKey && (e.key === "U" || e.key === "u"))
    ) {
      e.preventDefault()
      return true
    }
    return false
  },

  // Proteger contra extracción de código
  protectSource: () => {
    // Sobrescribir toString de Function
    const originalToString = Function.prototype.toString

    Function.prototype.toString = () => "[Código fuente protegido]"

    // Sobrescribir getters de propiedades críticas
    Object.defineProperty(window, "React", {
      get: () => undefined,
      set: () => {},
    })

    Object.defineProperty(window, "ReactDOM", {
      get: () => undefined,
      set: () => {},
    })

    return originalToString
  },

  // Inicializar todas las protecciones
  initSecurity: () => {
    // Detectar herramientas de desarrollo periódicamente
    setInterval(() => {
      if (securityFunctions.detectDevTools()) {
        // Tomar contramedidas
        document.body.innerHTML = ""
        window.location.href = "about:blank"
      }
    }, 1000)

    // Bloquear teclas de inspección
    window.addEventListener("keydown", securityFunctions.blockInspectKeys, true)

    // Proteger código fuente
    securityFunctions.protectSource()

    // Mensaje ofuscado en consola
    console.log("%c⚠️ Advertencia", "color: red; font-size: 24px; font-weight: bold;")
    console.log(
      "%cEsta es una aplicación protegida. Cualquier intento de manipulación será registrado.",
      "color: white; background: black; font-size: 16px; padding: 10px;",
    )
  },
}

// Exportar funciones ofuscadas
export const initSecurity = securityFunctions.initSecurity
export const detectDevTools = securityFunctions.detectDevTools
export const blockInspectKeys = securityFunctions.blockInspectKeys
export const protectSource = securityFunctions.protectSource

