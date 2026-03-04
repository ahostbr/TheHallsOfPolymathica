// src/main/services/agent-content-service.ts
import { readFileSync } from 'fs'
import { POLYMATH_REGISTRY } from '../polymath-seed'

export interface Phase {
  name: string
  description: string
}

export interface CorridorContent {
  name: string
  description: string
  color: string
  kernel: string
  identityTraits: string[]
  phases: Phase[]
  outputFormat: string
  decisionGates: string[]
  keyQuotes: string[]
}

const cache = new Map<string, CorridorContent>()

/** Parse a single agent markdown file into corridor content */
function parseAgentFile(filePath: string): CorridorContent {
  const raw = readFileSync(filePath, 'utf-8')

  // Extract YAML frontmatter
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/)
  const fm = fmMatch?.[1] ?? ''
  const name = fm.match(/name:\s*(.+)/)?.[1]?.trim() ?? ''
  const description = fm.match(/description:\s*(.+)/)?.[1]?.trim() ?? ''
  const color = fm.match(/color:\s*(.+)/)?.[1]?.trim() ?? ''

  const body = raw.slice(fmMatch?.[0]?.length ?? 0)

  // Extract kernel (text under ## The Kernel)
  const kernelMatch = body.match(/## The Kernel\n\n([\s\S]*?)(?=\n## )/)
  const kernel = kernelMatch?.[1]?.trim()?.replace(/\*\*/g, '') ?? ''

  // Extract identity traits (bullet list under ## Identity)
  const identityMatch = body.match(/## Identity\n\n([\s\S]*?)(?=\n## )/)
  const identityTraits = (identityMatch?.[1] ?? '')
    .split('\n')
    .filter(l => l.startsWith('- '))
    .map(l => l.slice(2).replace(/\*\*/g, '').trim())
    .map(t => t.split('. ')[0] + '.')

  // Extract phases from ## Mandatory Workflow
  const workflowMatch = body.match(/## Mandatory Workflow\n\n([\s\S]*?)(?=\n## )/)
  const workflowText = workflowMatch?.[1] ?? ''
  const phaseRegex =
    /### Phase \d+:\s*(\w[\w\s]*?)(?:\s*[—\-–]\s*.*)?\n\n([\s\S]*?)(?=\n### Phase|\n\*\*Gate|$)/g
  const phases: Phase[] = []
  let phaseMatch
  while ((phaseMatch = phaseRegex.exec(workflowText)) !== null) {
    phases.push({
      name: phaseMatch[1].trim(),
      description: phaseMatch[2].trim().split('\n')[0]
    })
  }

  // Extract output format
  const outputMatch = body.match(/## Output Format\n\n([\s\S]*?)(?=\n## )/)
  const outputFormat = outputMatch?.[1]?.trim() ?? ''

  // Extract decision gates
  const gatesMatch = body.match(/## Decision Gates[\s\S]*?\n\n([\s\S]*?)(?=\n## )/)
  const gatesText = gatesMatch?.[1] ?? ''
  const decisionGates = gatesText
    .split('\n')
    .filter(l => l.includes('**') && !l.startsWith('|--') && !l.startsWith('| Gate'))
    .map(l => {
      const cells = l.split('|').filter(c => c.trim())
      if (cells.length >= 2) {
        return `${cells[0].replace(/\*\*/g, '').trim()}: ${cells[cells.length - 1].trim()}`
      }
      return l.replace(/\*\*/g, '').trim()
    })

  // Extract blockquotes as key quotes
  const keyQuotes = (body.match(/> \*?"?(.+?)"?\*?$/gm) ?? [])
    .map(q => q.replace(/^>\s*\*?"?/, '').replace(/"?\*?$/, '').trim())
    .filter(q => q.length > 10 && q.length < 200)

  return {
    name,
    description,
    color,
    kernel,
    identityTraits,
    phases,
    outputFormat,
    decisionGates,
    keyQuotes
  }
}

export function initCorridorContent(): void {
  for (const entry of POLYMATH_REGISTRY) {
    try {
      const content = parseAgentFile(entry.agentFile)
      cache.set(entry.id, content)
    } catch (err) {
      console.error(`Failed to parse agent file for ${entry.id}:`, err)
    }
  }
  console.log(`Parsed corridor content for ${cache.size} polymaths`)
}

export function getCorridorContent(polymathId: string): CorridorContent | null {
  return cache.get(polymathId) ?? null
}

export function getAllCorridorContent(): Record<string, CorridorContent> {
  return Object.fromEntries(cache)
}
