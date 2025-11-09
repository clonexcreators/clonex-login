// DNA Theme System Test Component
// Quick test to verify DNA themes are working

import React from 'react'
import { useDNAThemes } from '../hooks/useDNAThemes'
import { DNASelector } from './profile/DNASelector'
import { DnaBadge } from './profile/DnaBadge'
import { DNAType } from '../theme/dna'

export const DNAThemeTest: React.FC = () => {
  const {
    activeTheme,
    ownedDNA,
    hasMurakamiDrip,
    setActiveTheme,
    refreshOwnedDNA
  } = useDNAThemes()

  // Simulate owning some DNA types for testing
  React.useEffect(() => {
    // Test with mock NFT data
    const mockNFTs = [
      { collection: 'clonex', metadata: { dna: 'Human' } },
      { collection: 'clonex', metadata: { dna: 'Robot' } },
      { collection: 'clonex', metadata: { DNA: 'Alien' } },
      { collection: 'clonex', metadata: { type: 'MURAKAMI DRIP', dna: 'Angel' } }
    ]
    refreshOwnedDNA(mockNFTs)
  }, [refreshOwnedDNA])

  return (
    <div className="min-h-screen bg-gray-50 p-8 dna-themed">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 dna-primary">
            🧬 DNA Theme System Test
          </h1>
          <p className="text-gray-600">
            Testing CloneX DNA Theme implementation (Phase 2.1)
          </p>
        </div>

        {/* Current Theme Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 border-4 dna-themed">
          <h2 className="text-2xl font-bold mb-4">Current Active Theme</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-xl font-semibold">{activeTheme.name}</h3>
              <p className="text-gray-600">{activeTheme.description}</p>
              <p className="text-sm text-gray-500 mt-2">Type: {activeTheme.type}</p>
            </div>
            <div className="text-5xl">{activeTheme.icon}</div>
          </div>
          {hasMurakamiDrip && (
            <div className="mt-4 p-3 bg-purple-100 rounded-lg text-purple-800 font-semibold">
              ✨ Murakami Drip Finish Detected!
            </div>
          )}
        </div>

        {/* DNA Selector */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">DNA Theme Selector</h2>
          <DNASelector
            ownedDNA={ownedDNA}
            activeTheme={activeTheme.type}
            onThemeSelect={setActiveTheme}
            hasMurakamiDrip={hasMurakamiDrip}
          />
        </div>

        {/* DNA Badges */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">DNA Badge Examples</h2>
          <div className="flex flex-wrap gap-3">
            {ownedDNA.map(dna => (
              <DnaBadge key={dna} type={dna} size="md" />
            ))}
          </div>
        </div>

        {/* Color Preview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Theme Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div 
                className="w-full h-20 rounded-lg border-2 border-white shadow mb-2"
                style={{ backgroundColor: activeTheme.colors.primary }}
              />
              <p className="text-sm font-semibold">Primary</p>
              <p className="text-xs text-gray-500">{activeTheme.colors.primary}</p>
            </div>
            <div>
              <div 
                className="w-full h-20 rounded-lg border-2 border-white shadow mb-2"
                style={{ backgroundColor: activeTheme.colors.accent }}
              />
              <p className="text-sm font-semibold">Accent</p>
              <p className="text-xs text-gray-500">{activeTheme.colors.accent}</p>
            </div>
            {activeTheme.colors.glow && (
              <div>
                <div 
                  className="w-full h-20 rounded-lg border-2 border-white shadow mb-2 dna-glow"
                  style={{ backgroundColor: activeTheme.colors.glow }}
                />
                <p className="text-sm font-semibold">Glow</p>
                <p className="text-xs text-gray-500">{activeTheme.colors.glow}</p>
              </div>
            )}
          </div>
        </div>

        {/* Themed Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Themed UI Components</h2>
          <div className="space-y-4">
            <button className="dna-primary-bg px-6 py-3 rounded-lg font-semibold">
              Primary Button
            </button>
            <button className="dna-accent-bg px-6 py-3 rounded-lg font-semibold ml-4">
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
