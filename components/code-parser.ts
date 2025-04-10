/**
 * Utility functions for parsing and processing code blocks in text
 */

// Function to detect if a string contains a code block
export function containsCodeBlock(text: string): boolean {
  return text.includes("```")
}

// Function to extract code blocks from text
export function extractCodeBlocks(text: string): {
  language: string
  code: string
  beforeCode: string
  afterCode: string
}[] {
  const codeBlocks = []
  const regex = /```(\w*)\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0]
    const language = match[1] || "python"
    const code = match[2]

    // Get text before and after the code block
    const startIndex = match.index
    const endIndex = startIndex + fullMatch.length

    const beforeCode = text.substring(0, startIndex).trim()
    const afterCode = text.substring(endIndex).trim()

    codeBlocks.push({
      language,
      code,
      beforeCode,
      afterCode,
    })
  }

  return codeBlocks
}

// Function to clean code from style markers
export function cleanCodeFromStyleMarkers(code: string): string {
  return code
    .replace(/["']text-[a-z]+-\d+["']>\d+:/g, "")
    .replace(/["']text-[a-z]+-["']\d+>/g, "")
    .replace(/<\/[a-z]+>/g, "")
    .replace(/text-[a-z]+-\d+>/g, "")
    .replace(/text-[a-z]+-\d+/g, "")
}

// Function to process a thinking step and extract code blocks
export function processThinkingStep(step: string): {
  type: "text" | "code"
  content: string
  language?: string
}[] {
  const result = []

  if (containsCodeBlock(step)) {
    const blocks = extractCodeBlocks(step)

    blocks.forEach((block, index) => {
      if (block.beforeCode && index === 0) {
        result.push({
          type: "text",
          content: block.beforeCode,
        })
      }

      result.push({
        type: "code",
        content: cleanCodeFromStyleMarkers(block.code),
        language: block.language,
      })

      if (block.afterCode) {
        result.push({
          type: "text",
          content: block.afterCode,
        })
      }
    })
  } else {
    result.push({
      type: "text",
      content: step,
    })
  }

  return result
}

