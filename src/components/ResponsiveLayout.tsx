// CloneX Responsive Layout Utilities - Phase 2.5
// Mobile-first responsive components with accessibility

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Responsive Container
 * 
 * Provides consistent padding and max-width across breakpoints
 */
interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  size = 'lg',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 w-full ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Responsive Grid
 * 
 * Auto-responsive grid that adapts to screen size
 */
interface ResponsiveGridProps {
  children: React.ReactNode
  cols?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: number
  className?: string
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = ''
}) => {
  const gridClasses = `
    grid
    gap-${gap}
    grid-cols-${cols.sm || 1}
    sm:grid-cols-${cols.sm || 1}
    md:grid-cols-${cols.md || 2}
    lg:grid-cols-${cols.lg || 3}
    xl:grid-cols-${cols.xl || 4}
  `

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  )
}

/**
 * Mobile Navigation Menu
 * 
 * Hamburger menu for mobile with smooth animations
 */
interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  items: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    active?: boolean
  }>
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  items
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl z-50"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Close button */}
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu items */}
            <nav className="px-4 pb-4">
              {items.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={() => {
                    item.onClick()
                    onClose()
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2
                    transition-colors text-left
                    ${item.active ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}
                  `}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/**
 * Responsive Card
 * 
 * Card component that adapts layout based on screen size
 */
interface ResponsiveCardProps {
  children: React.ReactNode
  variant?: 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  onClick?: () => void
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className = '',
  onClick
}) => {
  const variantClasses = {
    elevated: 'bg-white shadow-md hover:shadow-lg',
    outlined: 'bg-white border-2 border-gray-200',
    flat: 'bg-gray-50'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }

  return (
    <motion.div
      className={`
        rounded-lg transition-all
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </motion.div>
  )
}

/**
 * Responsive Tabs
 * 
 * Horizontal tabs on desktop, dropdown on mobile
 */
interface ResponsiveTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
  }>
  activeTab: string
  onChange: (tabId: string) => void
}

export const ResponsiveTabs: React.FC<ResponsiveTabsProps> = ({
  tabs,
  activeTab,
  onChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <>
      {/* Desktop tabs */}
      <div className="hidden md:block border-b border-gray-200">
        <nav className="flex gap-2" role="tablist">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium transition-colors
                border-b-2 -mb-px
                ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Mobile dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg"
          aria-expanded={mobileMenuOpen}
          aria-haspopup="true"
        >
          <span className="flex items-center gap-2">
            {activeTabData?.icon}
            <span className="font-medium">{activeTabData?.label}</span>
          </span>
          <svg
            className={`w-5 h-5 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    onChange(tab.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-2 px-4 py-3 text-left transition-colors
                    ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

/**
 * Responsive Stack
 * 
 * Vertical stack on mobile, horizontal on desktop
 */
interface ResponsiveStackProps {
  children: React.ReactNode
  direction?: 'row' | 'column' | 'responsive'
  gap?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
  className?: string
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = 'responsive',
  gap = 4,
  align = 'start',
  className = ''
}) => {
  const directionClasses = {
    row: 'flex-row',
    column: 'flex-col',
    responsive: 'flex-col md:flex-row'
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  }

  return (
    <div className={`
      flex
      ${directionClasses[direction]}
      ${alignClasses[align]}
      gap-${gap}
      ${className}
    `}>
      {children}
    </div>
  )
}

/**
 * Hide on Mobile / Desktop
 * 
 * Utility components for responsive visibility
 */
export const HideOnMobile: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden md:block">{children}</div>
)

export const HideOnDesktop: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md:hidden">{children}</div>
)

export const ShowOnMobile: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="md:hidden">{children}</div>
)

export const ShowOnDesktop: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="hidden md:block">{children}</div>
)
