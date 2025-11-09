// CloneX DNA Badge Component - Official Integration Specification
// Version: 3.6.1 - Uses SVG icons with currentColor

import React from 'react'
import { DNAType, DNA_THEMES } from '../../theme/dna'

interface DnaBadgeProps {
  type: DNAType
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

/**
 * DNA Badge Component
 * 
 * Displays a DNA type badge with icon and optional label
 * Uses SVG icons with currentColor for proper theming
 */
export const DnaBadge: React.FC<DnaBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const theme = DNA_THEMES[type]

  if (!theme) {
    console.warn('Invalid DNA type for badge:', type)
    return null
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }

  const iconSizes = {
    sm: '16px',
    md: '20px',
    lg: '24px'
  }

  return (
    <span
      className={`
        dna-badge inline-flex items-center gap-2 rounded-full font-semibold
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: theme.accent,
        color: 'white'
      }}
    >
      <img
        src={theme.icon}
        alt={`${theme.name} DNA icon`}
        className="dna-icon"
        style={{
          width: iconSizes[size],
          height: iconSizes[size],
          filter: 'brightness(0) invert(1)' // Make icon white
        }}
      />
      {showLabel && (
        <span>{theme.name}</span>
      )}
    </span>
  )
}
