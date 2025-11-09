// CloneX DNA Theme System - Color Palettes and Theme Variables
// Version: 3.6.1 - Official Integration Specification
// Updated: Aligned with official CloneX DNA Theme Integration specs + dna-themes.json

export type DNAType = 
  | 'human' 
  | 'robot' 
  | 'demon' 
  | 'angel' 
  | 'reptile' 
  | 'undead' 
  | 'alien'
  | 'murakami'

export interface DNATheme {
  type: DNAType
  name: string
  icon: string
  accent: string
  accentContrast: string
  background?: string
  shadow?: string
}

// Official DNA Theme Definitions (from integration spec + dna-themes.json)
export const DNA_THEMES: Record<DNAType, DNATheme> = {
  'human': {
    type: 'human',
    name: 'Human',
    icon: '/assets/dna-icons/human.svg',
    accent: '#5DA3FF',
    accentContrast: '#FFFFFF',
    background: 'linear-gradient(135deg, #EAF4FF 0%, #C7E0FF 100%)',
    shadow: '0 0 60px rgba(93,163,255,0.3)'
  },
  
  'robot': {
    type: 'robot',
    name: 'Robot',
    icon: '/assets/dna-icons/robot.svg',
    accent: '#B673FF',
    accentContrast: '#FFFFFF',
    background: 'linear-gradient(135deg, #E9E1FF 0%, #D2B8FF 100%)',
    shadow: '0 0 60px rgba(182,115,255,0.3)'
  },
  
  'demon': {
    type: 'demon',
    name: 'Demon',
    icon: '/assets/dna-icons/demon.svg',
    accent: '#FF4D4D',
    accentContrast: '#FFFFFF',
    background: 'linear-gradient(135deg, #FFD9D9 0%, #FF4D4D 100%)',
    shadow: '0 0 60px rgba(255,77,77,0.3)'
  },
  
  'angel': {
    type: 'angel',
    name: 'Angel',
    icon: '/assets/dna-icons/angel.svg',
    accent: '#F9B8E1',
    accentContrast: '#000000',
    background: 'linear-gradient(135deg, #FFF0F9 0%, #F9B8E1 100%)',
    shadow: '0 0 60px rgba(249,184,225,0.3)'
  },
  
  'reptile': {
    type: 'reptile',
    name: 'Reptile',
    icon: '/assets/dna-icons/reptile.svg',
    accent: '#9ADF4D',
    accentContrast: '#000000',
    background: 'linear-gradient(135deg, #E8F7D2 0%, #B2E673 100%)',
    shadow: '0 0 60px rgba(154,223,77,0.3)'
  },
  
  'undead': {
    type: 'undead',
    name: 'Undead',
    icon: '/assets/dna-icons/undead.svg',
    accent: '#4A7AAF',
    accentContrast: '#FFFFFF',
    background: 'linear-gradient(135deg, #DDEAF8 0%, #4A7AAF 100%)',
    shadow: '0 0 60px rgba(74,122,175,0.3)'
  },
  
  'alien': {
    type: 'alien',
    name: 'Alien',
    icon: '/assets/dna-icons/alien.svg',
    accent: '#00FFA3',
    accentContrast: '#000000',
    background: 'linear-gradient(135deg, #D6FFEF 0%, #00FFA3 100%)',
    shadow: '0 0 60px rgba(0,255,163,0.3)'
  },
  
  'murakami': {
    type: 'murakami',
    name: 'Murakami',
    icon: '/assets/dna-icons/murakami.svg',
    accent: '#FF6BDA',
    accentContrast: '#000000',
    background: 'linear-gradient(135deg, #FFE6FA 0%, #FF6BDA 100%)',
    shadow: '0 0 60px rgba(255,107,218,0.3)'
  }
}

// Murakami Drip special icon
export const MURAKAMI_DRIP_ICON = '/assets/dna-icons/mkDrip.svg'

// Murakami Drip finish gradient (from dna-themes.json)
export const MURAKAMI_DRIP_GRADIENT = 'linear-gradient(135deg, #FF6BDA, #00FFA3, #5DA3FF, #F9B8E1)'

// Helper function to get theme by DNA type
export const getDNATheme = (dnaType: string | undefined): DNATheme => {
  if (!dnaType) return DNA_THEMES.human
  
  const normalizedType = dnaType.toLowerCase().replace(/[^a-z]/g, '') as DNAType
  return DNA_THEMES[normalizedType] || DNA_THEMES.human
}

// Apply DNA theme to document root (following official spec)
export const applyDNATheme = (theme: DNATheme, hasMurakamiFinish: boolean = false): void => {
  const root = document.documentElement
  
  // Set data-dna-theme attribute (official spec requirement)
  root.setAttribute('data-dna-theme', theme.type)
  
  // Set CSS custom properties for accent color and contrast
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-contrast', theme.accentContrast)
  
  // Set optional background and shadow properties if available
  if (theme.background) {
    root.style.setProperty('--dna-background', theme.background)
  }
  if (theme.shadow) {
    root.style.setProperty('--dna-shadow', theme.shadow)
  }
  
  // Set Murakami finish attribute if applicable
  if (hasMurakamiFinish) {
    root.setAttribute('data-finish', 'murakami')
    root.style.setProperty('--finish-gradient', MURAKAMI_DRIP_GRADIENT)
    root.style.setProperty('--finish-speed', '4s')
  } else {
    root.removeAttribute('data-finish')
    root.style.removeProperty('--finish-gradient')
    root.style.removeProperty('--finish-speed')
  }
  
  console.log('🎨 DNA Theme applied:', {
    type: theme.type,
    name: theme.name,
    accent: theme.accent,
    hasMurakamiFinish
  })
}

// Export constants
export const DEFAULT_THEME = DNA_THEMES.human
export const STORAGE_KEY = 'clonex-dna-theme'
