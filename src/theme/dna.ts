// CloneX DNA Theme System - JSON-Backed Color Palettes and Theme Variables
// Version: 3.7.0 - JSON Config as Canonical Source
// Uses /assets/dna-icons/dna-themes.json at runtime with typed fallback

// === TYPE DEFINITIONS ===

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

export interface MurakamiDripOverlay {
  finishGradient: string
  finishSpeed: string
  animation: string
  blendMode: string
  description?: string
}

export interface DNAThemesConfig {
  themes: Record<DNAType, DNATheme>
  murakamiDrip: { overlay: MurakamiDripOverlay }
}

// === VALIDATION ===

const VALID_DNA_TYPES: DNAType[] = ['human', 'robot', 'demon', 'angel', 'reptile', 'undead', 'alien', 'murakami']

function isValidDNAType(key: string): key is DNAType {
  return VALID_DNA_TYPES.includes(key as DNAType)
}

function validateThemeEntry(key: string, data: any): DNATheme | null {
  if (!data || typeof data !== 'object') return null
  if (!data.accent || !data.accentContrast) return null

  return {
    type: key as DNAType,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    icon: `/assets/dna-icons/${key}.svg`,
    accent: data.accent,
    accentContrast: data.accentContrast,
    background: data.background || undefined,
    shadow: data.shadow || undefined
  }
}

function validateMurakamiDrip(data: any): MurakamiDripOverlay {
  const overlay = data?.overlay || data || {}
  return {
    finishGradient: overlay.finishGradient || 'linear-gradient(135deg, #FF6BDA, #00FFA3, #5DA3FF, #F9B8E1)',
    finishSpeed: overlay.finishSpeed || '4s',
    animation: overlay.animation || 'dripFoil 4s ease-in-out infinite',
    blendMode: overlay.blendMode || 'overlay'
  }
}

// === FALLBACK THEME CONFIG (used if JSON fetch fails) ===

const FALLBACK_THEME: DNATheme = {
  type: 'human',
  name: 'Human',
  icon: '/assets/dna-icons/human.svg',
  accent: '#5DA3FF',
  accentContrast: '#FFFFFF',
  background: 'linear-gradient(135deg, #EAF4FF 0%, #C7E0FF 100%)',
  shadow: '0 0 60px rgba(93,163,255,0.3)'
}

const FALLBACK_MURAKAMI_DRIP: MurakamiDripOverlay = {
  finishGradient: 'linear-gradient(135deg, #FF6BDA, #00FFA3, #5DA3FF, #F9B8E1)',
  finishSpeed: '4s',
  animation: 'dripFoil 4s ease-in-out infinite',
  blendMode: 'overlay'
}

// Inline fallback themes (used only if JSON fails to load)
const FALLBACK_THEMES: Record<DNAType, DNATheme> = {
  human: { type: 'human', name: 'Human', icon: '/assets/dna-icons/human.svg', accent: '#5DA3FF', accentContrast: '#FFFFFF', background: 'linear-gradient(135deg, #EAF4FF 0%, #C7E0FF 100%)', shadow: '0 0 60px rgba(93,163,255,0.3)' },
  robot: { type: 'robot', name: 'Robot', icon: '/assets/dna-icons/robot.svg', accent: '#B673FF', accentContrast: '#FFFFFF', background: 'linear-gradient(135deg, #E9E1FF 0%, #D2B8FF 100%)', shadow: '0 0 60px rgba(182,115,255,0.3)' },
  demon: { type: 'demon', name: 'Demon', icon: '/assets/dna-icons/demon.svg', accent: '#FF4D4D', accentContrast: '#FFFFFF', background: 'linear-gradient(135deg, #FFD9D9 0%, #FF4D4D 100%)', shadow: '0 0 60px rgba(255,77,77,0.3)' },
  angel: { type: 'angel', name: 'Angel', icon: '/assets/dna-icons/angel.svg', accent: '#F9B8E1', accentContrast: '#000000', background: 'linear-gradient(135deg, #FFF0F9 0%, #F9B8E1 100%)', shadow: '0 0 60px rgba(249,184,225,0.3)' },
  reptile: { type: 'reptile', name: 'Reptile', icon: '/assets/dna-icons/reptile.svg', accent: '#9ADF4D', accentContrast: '#000000', background: 'linear-gradient(135deg, #E8F7D2 0%, #B2E673 100%)', shadow: '0 0 60px rgba(154,223,77,0.3)' },
  undead: { type: 'undead', name: 'Undead', icon: '/assets/dna-icons/undead.svg', accent: '#4A7AAF', accentContrast: '#FFFFFF', background: 'linear-gradient(135deg, #DDEAF8 0%, #4A7AAF 100%)', shadow: '0 0 60px rgba(74,122,175,0.3)' },
  alien: { type: 'alien', name: 'Alien', icon: '/assets/dna-icons/alien.svg', accent: '#00FFA3', accentContrast: '#000000', background: 'linear-gradient(135deg, #D6FFEF 0%, #00FFA3 100%)', shadow: '0 0 60px rgba(0,255,163,0.3)' },
  murakami: { type: 'murakami', name: 'Murakami', icon: '/assets/dna-icons/murakami.svg', accent: '#FF6BDA', accentContrast: '#000000', background: 'linear-gradient(135deg, #FFE6FA 0%, #FF6BDA 100%)', shadow: '0 0 60px rgba(255,107,218,0.3)' }
}

// === SESSION-CACHED JSON LOADER ===

let cachedConfig: DNAThemesConfig | null = null
let loadPromise: Promise<DNAThemesConfig> | null = null

/**
 * Load DNA themes from JSON config file
 * Fetches once per session and caches the result
 * Falls back to hardcoded themes if fetch fails
 */
export async function loadDNAThemes(): Promise<DNAThemesConfig> {
  // Return cached config if available
  if (cachedConfig) {
    return cachedConfig
  }

  // Return existing promise if load is in progress
  if (loadPromise) {
    return loadPromise
  }

  loadPromise = (async () => {
    try {
      const response = await fetch('/assets/dna-icons/dna-themes.json', {
        cache: 'default'
      })

      if (!response.ok) {
        throw new Error(`Failed to load dna-themes.json: ${response.status}`)
      }

      const json = await response.json()

      // Parse and validate the JSON
      const themes: Record<DNAType, DNATheme> = {} as Record<DNAType, DNATheme>

      for (const key of VALID_DNA_TYPES) {
        if (json[key]) {
          const validated = validateThemeEntry(key, json[key])
          if (validated) {
            themes[key] = validated
          } else {
            console.warn(`Invalid theme data for "${key}", using fallback`)
            themes[key] = FALLBACK_THEMES[key]
          }
        } else {
          console.warn(`Missing theme "${key}" in JSON, using fallback`)
          themes[key] = FALLBACK_THEMES[key]
        }
      }

      // Parse Murakami Drip overlay config
      const murakamiDrip = {
        overlay: validateMurakamiDrip(json.murakamiDrip)
      }

      cachedConfig = { themes, murakamiDrip }

      console.log('✅ DNA themes loaded from JSON:', {
        themeCount: Object.keys(themes).length,
        hasMurakamiOverlay: !!murakamiDrip.overlay.finishGradient
      })

      return cachedConfig

    } catch (error) {
      console.warn('⚠️ Failed to load dna-themes.json, using fallback themes:', error)

      // Use fallback config
      cachedConfig = {
        themes: FALLBACK_THEMES,
        murakamiDrip: { overlay: FALLBACK_MURAKAMI_DRIP }
      }

      return cachedConfig
    }
  })()

  return loadPromise
}

/**
 * Get themes synchronously (returns fallback if not yet loaded)
 * Prefer loadDNAThemes() for guaranteed latest config
 */
export function getDNAThemesSync(): DNAThemesConfig {
  return cachedConfig || {
    themes: FALLBACK_THEMES,
    murakamiDrip: { overlay: FALLBACK_MURAKAMI_DRIP }
  }
}

// === LEGACY EXPORTS (for backward compatibility) ===
// These now reference the sync getter, but callers should prefer loadDNAThemes()

export const DNA_THEMES = FALLBACK_THEMES // Initial reference, updated after load

// Murakami Drip special icon
export const MURAKAMI_DRIP_ICON = '/assets/dna-icons/mkDrip.svg'

// Murakami Drip finish gradient (legacy constant, prefer getMurakamiDripConfig())
export const MURAKAMI_DRIP_GRADIENT = FALLBACK_MURAKAMI_DRIP.finishGradient

// === THEME ACCESSORS ===

/**
 * Get theme by DNA type (async, loads from JSON)
 */
export async function getDNAThemeAsync(dnaType: string | undefined): Promise<DNATheme> {
  const config = await loadDNAThemes()

  if (!dnaType) return config.themes.human

  const normalizedType = dnaType.toLowerCase().replace(/[^a-z]/g, '')

  if (isValidDNAType(normalizedType)) {
    return config.themes[normalizedType]
  }

  return config.themes.human
}

/**
 * Get theme by DNA type (sync, uses cached or fallback)
 */
export function getDNATheme(dnaType: string | undefined): DNATheme {
  const config = getDNAThemesSync()

  if (!dnaType) return config.themes.human

  const normalizedType = dnaType.toLowerCase().replace(/[^a-z]/g, '')

  if (isValidDNAType(normalizedType)) {
    return config.themes[normalizedType]
  }

  return config.themes.human
}

/**
 * Get Murakami Drip overlay config
 */
export function getMurakamiDripConfig(): MurakamiDripOverlay {
  const config = getDNAThemesSync()
  return config.murakamiDrip.overlay
}

// === THEME APPLICATION ===

/**
 * Apply DNA theme to document root (following official spec)
 * Sets CSS custom properties and data attributes
 */
export function applyDNATheme(theme: DNATheme, hasMurakamiFinish: boolean = false): void {
  const root = document.documentElement
  const murakamiConfig = getMurakamiDripConfig()

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

  // Set Murakami finish overlay if applicable (additive luxury finish)
  if (hasMurakamiFinish) {
    root.setAttribute('data-finish', 'murakami')
    root.style.setProperty('--finish-gradient', murakamiConfig.finishGradient)
    root.style.setProperty('--finish-speed', murakamiConfig.finishSpeed)
    root.style.setProperty('--finish-animation', murakamiConfig.animation)
    root.style.setProperty('--finish-blend-mode', murakamiConfig.blendMode)
  } else {
    root.removeAttribute('data-finish')
    root.style.removeProperty('--finish-gradient')
    root.style.removeProperty('--finish-speed')
    root.style.removeProperty('--finish-animation')
    root.style.removeProperty('--finish-blend-mode')
  }
}

// === EXPORTS ===

export const DEFAULT_THEME = FALLBACK_THEME
export const STORAGE_KEY = 'clonex-dna-theme'
export { VALID_DNA_TYPES, isValidDNAType }
