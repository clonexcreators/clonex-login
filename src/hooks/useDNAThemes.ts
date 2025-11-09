// CloneX DNA Theme Hook - Official Integration Specification
// Version: 3.6.1 - Aligned with official CloneX DNA Theme specs

import { useState, useEffect, useCallback } from 'react'
import { 
  DNAType, 
  DNATheme, 
  DNA_THEMES, 
  getDNATheme, 
  applyDNATheme,
  DEFAULT_THEME,
  STORAGE_KEY
} from '../theme/dna'

interface DNAThemeState {
  activeDNA: DNAType | null
  availableDNA: DNAType[]
  hasMurakamiDrip: boolean
  isLoading: boolean
}

interface UseDNAThemesReturn extends DNAThemeState {
  setActiveDNA: (dnaType: DNAType) => void
  refreshOwnedDNA: (nfts: any[]) => void
  resetTheme: () void
}

/**
 * Hook to manage DNA theme selection and persistence
 * Following official CloneX DNA Theme Integration specification
 * 
 * Features:
 * - Sets data-dna-theme attribute on document.documentElement
 * - Persists theme selection in localStorage
 * - Detects Murakami Drip finish from NFT metadata
 * - Applies --accent CSS variable based on theme
 */
export function useDNAThemes(userDNA?: DNAType[]): UseDNAThemesReturn {
  const [state, setState] = useState<DNAThemeState>({
    activeDNA: null,
    availableDNA: [],
    hasMurakamiDrip: false,
    isLoading: false
  })

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const savedDNAType = localStorage.getItem(STORAGE_KEY) as DNAType | null
    
    if (savedDNAType && DNA_THEMES[savedDNAType]) {
      setState(prev => ({ ...prev, activeDNA: savedDNAType }))
      const theme = DNA_THEMES[savedDNAType]
      applyDNATheme(theme, false)
      
      console.log('✅ DNA Theme loaded from storage:', savedDNAType)
    } else {
      // Apply default theme
      applyDNATheme(DEFAULT_THEME, false)
      setState(prev => ({ ...prev, activeDNA: 'human' }))
    }
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
        const theme = DNA_THEMES[userDNA[0]]
        applyDNATheme(theme, state.hasMurakamiDrip)
      }
    }
  }, [userDNA])

  // Apply selected DNA theme globally
  useEffect(() => {
    if (state.activeDNA) {
      const theme = DNA_THEMES[state.activeDNA]
      if (theme) {
        applyDNATheme(theme, state.hasMurakamiDrip)
      }
    }
  }, [state.activeDNA, state.hasMurakamiDrip])

  // Set active DNA theme
  const setActiveDNA = useCallback((dnaType: DNAType) => {
    const theme = DNA_THEMES[dnaType]
    
    if (!theme) {
      console.warn('Invalid DNA type:', dnaType)
      return
    }

    setState(prev => ({ ...prev, activeDNA: dnaType }))
    applyDNATheme(theme, state.hasMurakamiDrip)
    localStorage.setItem(STORAGE_KEY, dnaType)
    
    console.log('🎨 DNA Theme activated:', {
      type: dnaType,
      name: theme.name,
      accent: theme.accent,
      hasMurakamiFinish: state.hasMurakamiDrip
    })
  }, [state.hasMurakamiDrip])

  // Extract DNA types from user's NFT collection
  const refreshOwnedDNA = useCallback((nfts: any[]) => {
    if (!nfts || nfts.length === 0) {
      console.log('No NFTs provided for DNA detection')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const dnaTypes = new Set<DNAType>()
      let hasMurakami = false

      nfts.forEach(nft => {
        // Check if it's a CloneX NFT
        if (nft.collection?.toLowerCase() === 'clonex' && nft.metadata) {
          // Extract DNA type from metadata
          const dna = nft.metadata.dna || nft.metadata.DNA
          if (dna) {
            const normalizedDNA = dna.toLowerCase().replace(/[^a-z]/g, '') as DNAType
            if (DNA_THEMES[normalizedDNA]) {
              dnaTypes.add(normalizedDNA)
            }
          }

          // Check for Murakami Drip finish (official spec)
          const type = nft.metadata.type || nft.metadata.Type || ''
          if (type.toLowerCase().includes('murakami drip')) {
            hasMurakami = true
            // Add murakami to available themes
            dnaTypes.add('murakami')
          }
        }
      })

      const ownedDNAArray = Array.from(dnaTypes)
      
      setState(prev => ({
        ...prev,
        availableDNA: ownedDNAArray,
        hasMurakamiDrip: hasMurakami,
        isLoading: false
      }))

      // Update current theme's Murakami finish if detected
      if (hasMurakami && prev.activeDNA) {
        const theme = DNA_THEMES[prev.activeDNA]
        applyDNATheme(theme, true)
        
        // Set data-finish attribute per spec
        document.documentElement.setAttribute('data-finish', 'murakami')
      }

      console.log('🧬 DNA types detected:', {
        owned: ownedDNAArray,
        hasMurakami,
        total: ownedDNAArray.length
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
      isLoading: false
    })
    
    applyDNATheme(DEFAULT_THEME, false)
    localStorage.removeItem(STORAGE_KEY)
    
    console.log('🔄 DNA Theme reset to default')
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
