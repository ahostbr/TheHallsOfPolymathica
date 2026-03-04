// Polymath registry - maps to the 25 polymathic agent definitions from Kuroryuu
// Agent files located at: E:\SAS\CLONE\Kuroryuu-master\.claude\agents\

import { join } from 'path'
import { app } from 'electron'

// Resolve agents dir relative to app root (dev: project root, prod: resources)
const AGENT_BASE = app.isPackaged
  ? join(process.resourcesPath, 'agents')
  : join(app.getAppPath(), 'agents')

export interface PolymathSeed {
  id: string
  name: string
  title: string
  agentFile: string
  color: string
  description: string
}

export const POLYMATH_REGISTRY: PolymathSeed[] = [
  {
    id: 'feynman',
    name: 'Richard Feynman',
    title: 'First-Principles Reasoning',
    agentFile: join(AGENT_BASE, 'polymathic-feynman.md'),
    color: '#FF6B35',
    description: 'The freshman test, play as cognitive strategy. Debugging, learning new domains, explaining complex concepts.',
  },
  {
    id: 'carmack',
    name: 'John Carmack',
    title: 'Constraint-First Engineering',
    agentFile: join(AGENT_BASE, 'polymathic-carmack.md'),
    color: '#00FF41',
    description: 'Mathematical shortcuts, anti-abstraction discipline. Performance work, systems architecture, code review.',
  },
  {
    id: 'shannon',
    name: 'Claude Shannon',
    title: 'Signal & Noise Separation',
    agentFile: join(AGENT_BASE, 'polymathic-shannon.md'),
    color: '#00E5FF',
    description: 'Radical reduction, invariant structure. API design, architecture simplification, compression.',
  },
  {
    id: 'tao',
    name: 'Terence Tao',
    title: 'Structured Exploration',
    agentFile: join(AGENT_BASE, 'polymathic-tao.md'),
    color: '#9D4EDD',
    description: 'Cross-field arbitrage, structure-randomness decomposition. Complex problem decomposition, research strategy.',
  },
  {
    id: 'davinci',
    name: 'Leonardo da Vinci',
    title: 'Saper Vedere',
    agentFile: join(AGENT_BASE, 'polymathic-davinci.md'),
    color: '#FFD700',
    description: 'Knowing how to see, mechanism-hunting, cross-domain transfer. Bio-inspired design, innovation.',
  },
  {
    id: 'lovelace',
    name: 'Ada Lovelace',
    title: 'Poetical Science',
    agentFile: join(AGENT_BASE, 'polymathic-lovelace.md'),
    color: '#FF69B4',
    description: 'Operational structure, pattern abstraction. Technology visioning, system abstraction, cross-domain synthesis.',
  },
  {
    id: 'vangogh',
    name: 'Vincent van Gogh',
    title: 'Emotional Truth Engineering',
    agentFile: join(AGENT_BASE, 'polymathic-vangogh.md'),
    color: '#FFA500',
    description: 'Color as engineered language, intentional rule-breaking. UI/UX design, color systems, emotional design.',
  },
  {
    id: 'tesla',
    name: 'Nikola Tesla',
    title: 'Mental Simulation',
    agentFile: join(AGENT_BASE, 'polymathic-tesla.md'),
    color: '#00BFFF',
    description: 'Complete systems thinking, anti-trial-and-error. Systems architecture, infrastructure design, API design.',
  },
  {
    id: 'jobs',
    name: 'Steve Jobs',
    title: 'Intersection of Tech & Humanities',
    agentFile: join(AGENT_BASE, 'polymathic-jobs.md'),
    color: '#EEEEEE',
    description: 'Taste, radical simplification, reality distortion. Product vision, UX simplification, feature pruning.',
  },
  {
    id: 'gates',
    name: 'Bill Gates',
    title: 'Platform Thinking',
    agentFile: join(AGENT_BASE, 'polymathic-gates.md'),
    color: '#0078D4',
    description: 'Systematic deep-reading, decomposition into atomic components. Platform strategy, ecosystem design.',
  },
  {
    id: 'linus',
    name: 'Linus Torvalds',
    title: 'Good Taste in Code',
    agentFile: join(AGENT_BASE, 'polymathic-linus.md'),
    color: '#F0DB4F',
    description: 'Structural elegance, working code as valid argument, pragmatic empiricism. Code review, architecture taste.',
  },
  {
    id: 'graham',
    name: 'Paul Graham',
    title: 'Essay-Driven Clarity',
    agentFile: join(AGENT_BASE, 'polymathic-graham.md'),
    color: '#FF4500',
    description: 'Pattern observation, unscaled experimentation. Startup strategy, product-market fit, founder evaluation.',
  },
  {
    id: 'bezos',
    name: 'Jeff Bezos',
    title: 'Working Backwards',
    agentFile: join(AGENT_BASE, 'polymathic-bezos.md'),
    color: '#FF9900',
    description: 'PR/FAQ forcing functions, two-way vs one-way door decisions. Customer-obsessed design, product strategy.',
  },
  {
    id: 'andreessen',
    name: 'Marc Andreessen',
    title: 'Technological Discontinuities',
    agentFile: join(AGENT_BASE, 'polymathic-andreessen.md'),
    color: '#1DA1F2',
    description: 'Holding opinions loosely, cross-domain pattern synthesis. Market timing, technology adoption curves.',
  },
  {
    id: 'ogilvy',
    name: 'David Ogilvy',
    title: 'Research-First Advertising',
    agentFile: join(AGENT_BASE, 'polymathic-ogilvy.md'),
    color: '#DC143C',
    description: '80/20 headline rule, direct response methodology. Copywriting, ad strategy, research-first marketing.',
  },
  {
    id: 'aurelius',
    name: 'Marcus Aurelius',
    title: 'Stoic Deliberation',
    agentFile: join(AGENT_BASE, 'polymathic-aurelius.md'),
    color: '#C0C0C0',
    description: 'Dichotomy of control, premeditatio malorum, obstacle as the way. Decision-making under pressure.',
  },
  {
    id: 'godin',
    name: 'Seth Godin',
    title: 'Smallest Viable Audience',
    agentFile: join(AGENT_BASE, 'polymathic-godin.md'),
    color: '#8B5CF6',
    description: 'Worldview-first positioning, permission over interruption. Marketing strategy, audience building.',
  },
  {
    id: 'thiel',
    name: 'Peter Thiel',
    title: 'Zero to One',
    agentFile: join(AGENT_BASE, 'polymathic-thiel.md'),
    color: '#00FF88',
    description: 'Finding secrets, monopoly theory. Contrarian analysis, monopoly strategy, category creation.',
  },
  {
    id: 'disney',
    name: 'Walt Disney',
    title: 'Dreamer / Realist / Critic',
    agentFile: join(AGENT_BASE, 'polymathic-disney.md'),
    color: '#FF1493',
    description: 'Storyboarding, Plussing, Blue Sky ideation. Experience design, creative strategy.',
  },
  {
    id: 'munger',
    name: 'Charlie Munger',
    title: 'Mental Model Lattice',
    agentFile: join(AGENT_BASE, 'polymathic-munger.md'),
    color: '#B8860B',
    description: 'Inversion thinking, Lollapalooza effects. Decision frameworks, risk analysis, bias detection.',
  },
  {
    id: 'suntzu',
    name: 'Sun Tzu',
    title: 'Strategic Intelligence',
    agentFile: join(AGENT_BASE, 'polymathic-suntzu.md'),
    color: '#8B0000',
    description: 'Winning before fighting, terrain analysis. Competitive strategy, positioning, resource allocation.',
  },
  {
    id: 'socrates',
    name: 'Socrates',
    title: 'Elenctic Examination',
    agentFile: join(AGENT_BASE, 'polymathic-socrates.md'),
    color: '#E0E0E0',
    description: 'Maieutics, aporia as productive confusion. Assumption testing, dialectic questioning.',
  },
  {
    id: 'musk',
    name: 'Elon Musk',
    title: 'Physics-Constrained Reasoning',
    agentFile: join(AGENT_BASE, 'polymathic-musk.md'),
    color: '#E04230',
    description: 'Questioning every requirement, aggressive deletion before optimization. Moonshot feasibility.',
  },
  {
    id: 'mrbeast',
    name: 'MrBeast',
    title: 'Attention Engineering',
    agentFile: join(AGENT_BASE, 'polymathic-mrbeast.md'),
    color: '#00CFFF',
    description: 'Retention curve analysis, 50+ variation testing. Content strategy, viral mechanics.',
  },
  {
    id: 'rams',
    name: 'Dieter Rams',
    title: 'Less But Better',
    agentFile: join(AGENT_BASE, 'polymathic-rams.md'),
    color: '#666666',
    description: 'Functionalism, material honesty, 10 Principles of Good Design. Product design, UI simplification.',
  },
]
