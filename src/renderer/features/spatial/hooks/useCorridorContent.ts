import { useState, useEffect } from 'react'

export interface CorridorContent {
  name: string
  description: string
  color: string
  kernel: string
  identityTraits: string[]
  phases: { name: string; description: string }[]
  outputFormat: string
  decisionGates: string[]
  keyQuotes: string[]
}

export function useCorridorContent(polymathId: string | null): CorridorContent | null {
  const [content, setContent] = useState<CorridorContent | null>(null)

  useEffect(() => {
    if (!polymathId) {
      setContent(null)
      return
    }
    window.api.corridor
      .getContent(polymathId)
      .then((data: CorridorContent | null) => setContent(data))
  }, [polymathId])

  return content
}
