// CloneX DNA Selector Component - Official Integration Specification
// Version: 3.6.1 - Uses SVG icons with currentColor

import React from 'react'
import { DNAType, DNA_THEMES } from '../../theme/dna'

interface DNASelectorProps {
  userDNA?: DNAType[]
}

/**
 * DNA Theme Selector Component
 * 
 * Following official CloneX DNA Theme Integration specification:
 * - Uses SVG icons from /assets/dna-icons/
 * - Icons are 28x28 pixels
 * - Active state uses scale(1.15)
 * - Hover state uses scale(1.1)
 * - Icons use currentColor for theming
 */
export default function DNASelector({ userDNA }: DNASelectorProps) {
  const { activeDNA, availableDNA, setActiveDNA } = useDNAThemes(userDNA)

  // If no DNA types available, show placeholder
  if (!availableDNA || availableDNA.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-gray-600 mb-2">No DNA themes available</p>
          <p className="text-sm text-gray-500">
            Own CloneX NFTs to unlock DNA themes
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="dna-selector">
      {availableDNA.map((dnaType) => {
        const theme = DNA_THEMES[dnaType]
        const isActive = activeDNA === dnaType

        return (
          <button
            key={dnaType}
            onClick={() => setActiveDNA(dnaType)}
            className={`dna-button ${isActive ? 'active' : ''}`}
            aria-label={`${theme.name} DNA theme`}
            title={theme.name}
          >
            <img
              src={theme.icon}
              alt={`${theme.name} icon`}
              className="dna-icon"
              style={{ color: isActive ? theme.accent : 'currentColor' }}
            />
          </button>
        )
      })}
    </div>
  )
}

// Import hook at component level to avoid circular dependencies
import { useDNAThemes } from '../../hooks/useDNAThemes'
