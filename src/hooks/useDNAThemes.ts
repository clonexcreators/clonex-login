// CloneX DNA Theme Hook - JSON-Backed Theme System
// Version: 3.7.0 - Uses dna-themes.json as canonical source

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  DNAType,
  DNATheme,
  loadDNAThemes,
  getDNAThemesSync,
  getDNATheme,
  applyDNATheme,
  DEFAULT_THEME,
  STORAGE_KEY,
  isValidDNAType
} from '../theme/dna'

interface DNAThemeState {
  activeDNA: DNAType | null
  availableDNA: DNAType[]
  hasMurakamiDrip: boolean
  isLoading: boolean
  configLoaded: boolean
}

interface UseDNAThemesReturn extends Omit<DNAThemeState, 'configLoaded'> {
  setActiveDNA: (dnaType: DNAType) => void
  refreshOwnedDNA: (nfts: any[]) => void
  resetTheme: () => void
}

/**
 * Hook to manage DNA theme selection and persistence
 * Uses dna-themes.json as canonical source with fallback
 *
 * Features:
 * - Loads themes from JSON config on mount
 * - Sets data-dna-theme attribute on document.documentElement
 * - Persists theme selection in localStorage
 * - Detects Murakami Drip finish from NFT metadata
 * - Applies CSS variables: --accent, --accent-contrast, --dna-background, --dna-shadow
 * - Applies Murakami overlay variables when detected: --finish-gradient, --finish-speed, etc.
 */
export function useDNAThemes(userDNA?: DNAType[]): UseDNAThemesReturn {
  const [state, setState] = useState<DNAThemeState>({
    activeDNA: null,
    availableDNA: [],
    hasMurakamiDrip: false,
    isLoading: false,
    configLoaded: false
  })

  const initRef = useRef(false)

  // Load JSON config and saved theme on mount
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initThemes = async () => {
      // Load themes from JSON (cached after first load)
      await loadDNAThemes()

      // Get saved theme from localStorage
      const savedDNAType = localStorage.getItem(STORAGE_KEY)

      if (savedDNAType && isValidDNAType(savedDNAType)) {
        const theme = getDNATheme(savedDNAType)
        setState(prev => ({
          ...prev,
          activeDNA: savedDNAType as DNAType,
          configLoaded: true
        }))
        applyDNATheme(theme, false)
      } else {
        // Apply default theme
        applyDNATheme(DEFAULT_THEME, false)
        setState(prev => ({
          ...prev,
          activeDNA: 'human',
          configLoaded: true
        }))
      }
    }

    initThemes()
  }, [])

  // Update available DNA when userDNA prop changes
  useEffect(() => {
    if (userDNA && userDNA.length > 0) {
      setState(prev => ({
        ...prev,
        availableDNA: userDNA,
        activeDNA: prev.activeDNA || userDNA[0]
      }))

      // Apply first available theme if none selected
      if (!state.activeDNA && userDNA[0]) {
        const theme = getDNATheme(userDNA[0])
        applyDNATheme(theme, state.hasMurakamiDrip)
      }
    }
  }, [userDNA])

  // Apply selected DNA theme globally when activeDNA or murakami status changes
  useEffect(() => {
    if (state.activeDNA && state.configLoaded) {
      const theme = getDNATheme(state.activeDNA)
      if (theme) {
        applyDNATheme(theme, state.hasMurakamiDrip)
      }
    }
  }, [state.activeDNA, state.hasMurakamiDrip, state.configLoaded])

  // Set active DNA theme
  const setActiveDNA = useCallback((dnaType: DNAType) => {
    if (!isValidDNAType(dnaType)) {
      console.warn('Invalid DNA type:', dnaType)
      return
    }

    const theme = getDNATheme(dnaType)

    setState(prev => ({ ...prev, activeDNA: dnaType }))
    applyDNATheme(theme, state.hasMurakamiDrip)
    localStorage.setItem(STORAGE_KEY, dnaType)
  }, [state.hasMurakamiDrip])

  // Extract DNA types from user's NFT collection
  const refreshOwnedDNA = useCallback((nfts: any[]) => {
    if (!nfts || nfts.length === 0) {
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const dnaTypes = new Set<DNAType>()
      let hasMurakami = false

      nfts.forEach(nft => {
        // Check if it's a CloneX NFT - support multiple field names
        const collection = (nft.collection || nft.collectionName || '').toLowerCase()
        const isCloneX = collection === 'clonex' || collection.includes('clonex')

        if (isCloneX) {
          // Get metadata - it might be at top level or nested
          const metadata = nft.metadata || nft

          // Extract DNA type from metadata - check multiple possible field names
          const dna = metadata.dna || metadata.DNA ||
            metadata.attributes?.find((a: any) =>
              a.trait_type?.toLowerCase() === 'dna' ||
              a.trait_type?.toLowerCase() === 'dna type'
            )?.value

          if (dna) {
            const normalizedDNA = String(dna).toLowerCase().replace(/[^a-z]/g, '')
            if (isValidDNAType(normalizedDNA)) {
              dnaTypes.add(normalizedDNA as DNAType)
            }
          }

          // Check for Murakami Drip finish (official spec)
          const type = metadata.type || metadata.Type ||
            metadata.attributes?.find((a: any) =>
              a.trait_type?.toLowerCase() === 'type' ||
              a.trait_type?.toLowerCase() === 'finish'
            )?.value || ''

          if (String(type).toLowerCase().includes('murakami drip')) {
            hasMurakami = true
            // Add murakami to available themes
            dnaTypes.add('murakami')
          }
        }
      })

      const ownedDNAArray = Array.from(dnaTypes)

      setState(prev => {
        // Update current theme's Murakami finish if detected
        if (hasMurakami && prev.activeDNA) {
          const theme = getDNATheme(prev.activeDNA)
          applyDNATheme(theme, true)
        }

        return {
          ...prev,
          availableDNA: ownedDNAArray,
          hasMurakamiDrip: hasMurakami,
          isLoading: false
        }
      })

    } catch (error) {
      console.error('Error extracting DNA types:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  // Reset to default theme
  const resetTheme = useCallback(() => {
    setState({
      activeDNA: 'human',
      availableDNA: [],
      hasMurakamiDrip: false,
      isLoading: false,
      configLoaded: true
    })

    applyDNATheme(DEFAULT_THEME, false)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    activeDNA: state.activeDNA,
    availableDNA: state.availableDNA,
    hasMurakamiDrip: state.hasMurakamiDrip,
    isLoading: state.isLoading,
    setActiveDNA,
    refreshOwnedDNA,
    resetTheme
  }
}

export type { DNAThemeState, UseDNAThemesReturn }
