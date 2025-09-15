'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  delay?: number
  disabled?: boolean
  className?: string
  maxWidth?: number
  showArrow?: boolean
  trigger?: 'hover' | 'click' | 'focus'
  interactive?: boolean
  offset?: number
}

export default function Tooltip({
  content,
  children,
  position = 'auto',
  delay = 200,
  disabled = false,
  className = '',
  maxWidth = 300,
  showArrow = true,
  trigger = 'hover',
  interactive = false,
  offset = 8
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHoveringTooltip = useRef(false)

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return

    const triggerRect = triggerRef.current.getBoundingClientRect()
    const tooltipRect = tooltipRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const scrollX = window.scrollX
    const scrollY = window.scrollY

    let finalPosition = position
    let left = 0
    let top = 0

    // Auto-detect best position if needed
    if (position === 'auto') {
      const spaceTop = triggerRect.top
      const spaceBottom = viewportHeight - triggerRect.bottom
      const spaceLeft = triggerRect.left
      const spaceRight = viewportWidth - triggerRect.right

      if (spaceTop >= tooltipRect.height + offset) {
        finalPosition = 'top'
      } else if (spaceBottom >= tooltipRect.height + offset) {
        finalPosition = 'bottom'
      } else if (spaceRight >= tooltipRect.width + offset) {
        finalPosition = 'right'
      } else if (spaceLeft >= tooltipRect.width + offset) {
        finalPosition = 'left'
      } else {
        finalPosition = spaceBottom > spaceTop ? 'bottom' : 'top'
      }
    }

    // Calculate position based on final position
    switch (finalPosition) {
      case 'top':
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        top = triggerRect.top - tooltipRect.height - offset
        break
      case 'bottom':
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2
        top = triggerRect.bottom + offset
        break
      case 'left':
        left = triggerRect.left - tooltipRect.width - offset
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
      case 'right':
        left = triggerRect.right + offset
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2
        break
    }

    // Adjust for viewport boundaries
    if (left < 0) {
      left = 8
    } else if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8
    }

    if (top < 0) {
      top = 8
    } else if (top + tooltipRect.height > viewportHeight) {
      top = viewportHeight - tooltipRect.height - 8
    }

    setTooltipPosition(finalPosition as 'top' | 'bottom' | 'left' | 'right')
    setTooltipStyle({
      position: 'absolute',
      left: left + scrollX,
      top: top + scrollY,
      maxWidth: maxWidth,
      zIndex: 9999
    })
  }, [position, offset, maxWidth])

  const showTooltip = useCallback(() => {
    if (disabled || !content) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true)
      }, delay)
    } else {
      setIsVisible(true)
    }
  }, [disabled, content, delay])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // If interactive and hovering tooltip, don't hide
    if (interactive && isHoveringTooltip.current) return

    setIsVisible(false)
  }, [interactive])

  const handleTriggerMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      showTooltip()
    }
  }, [trigger, showTooltip])

  const handleTriggerMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      hideTooltip()
    }
  }, [trigger, hideTooltip])

  const handleTriggerClick = useCallback(() => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip()
      } else {
        showTooltip()
      }
    }
  }, [trigger, isVisible, showTooltip, hideTooltip])

  const handleTriggerFocus = useCallback(() => {
    if (trigger === 'focus') {
      showTooltip()
    }
  }, [trigger, showTooltip])

  const handleTriggerBlur = useCallback(() => {
    if (trigger === 'focus') {
      hideTooltip()
    }
  }, [trigger, hideTooltip])

  const handleTooltipMouseEnter = useCallback(() => {
    if (interactive) {
      isHoveringTooltip.current = true
    }
  }, [interactive])

  const handleTooltipMouseLeave = useCallback(() => {
    if (interactive) {
      isHoveringTooltip.current = false
      hideTooltip()
    }
  }, [interactive, hideTooltip])

  // Calculate position when tooltip becomes visible
  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure tooltip is rendered
      const timer = setTimeout(calculatePosition, 10)
      return () => clearTimeout(timer)
    }
  }, [isVisible, calculatePosition])

  // Recalculate position on window resize/scroll
  useEffect(() => {
    if (!isVisible) return

    const handleResize = () => calculatePosition()
    const handleScroll = () => calculatePosition()

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isVisible, calculatePosition])

  // Close tooltip on escape key
  useEffect(() => {
    if (!isVisible) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideTooltip()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isVisible, hideTooltip])

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getArrowStyles = () => {
    const arrowSize = 6
    const arrowStyles: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    }

    switch (tooltipPosition) {
      case 'top':
        arrowStyles.top = '100%'
        arrowStyles.left = '50%'
        arrowStyles.marginLeft = -arrowSize
        arrowStyles.borderWidth = `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`
        arrowStyles.borderColor = 'rgb(55, 65, 81) transparent transparent transparent'
        break
      case 'bottom':
        arrowStyles.bottom = '100%'
        arrowStyles.left = '50%'
        arrowStyles.marginLeft = -arrowSize
        arrowStyles.borderWidth = `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`
        arrowStyles.borderColor = 'transparent transparent rgb(55, 65, 81) transparent'
        break
      case 'left':
        arrowStyles.left = '100%'
        arrowStyles.top = '50%'
        arrowStyles.marginTop = -arrowSize
        arrowStyles.borderWidth = `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`
        arrowStyles.borderColor = 'transparent transparent transparent rgb(55, 65, 81)'
        break
      case 'right':
        arrowStyles.right = '100%'
        arrowStyles.top = '50%'
        arrowStyles.marginTop = -arrowSize
        arrowStyles.borderWidth = `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`
        arrowStyles.borderColor = 'transparent rgb(55, 65, 81) transparent transparent'
        break
    }

    return arrowStyles
  }

  const tooltipElement = isVisible && content ? (
    <div
      ref={tooltipRef}
      style={tooltipStyle}
      className={`
        bg-gray-700 text-white text-sm rounded-lg px-3 py-2 shadow-lg
        pointer-events-${interactive ? 'auto' : 'none'}
        transform transition-all duration-200 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        ${className}
      `}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      {content}
      {showArrow && <div style={getArrowStyles()} />}
    </div>
  ) : null

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleTriggerMouseEnter}
        onMouseLeave={handleTriggerMouseLeave}
        onClick={handleTriggerClick}
        onFocus={handleTriggerFocus}
        onBlur={handleTriggerBlur}
        className="inline-block"
      >
        {children}
      </div>
      
      {typeof document !== 'undefined' && tooltipElement && 
        createPortal(tooltipElement, document.body)
      }
    </>
  )
}

// Utility component for keyboard shortcut tooltips
export function ShortcutTooltip({
  shortcut,
  description,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & {
  shortcut: string
  description: string
}) {
  const content = (
    <div className="text-center">
      <div className="font-medium">{description}</div>
      <div className="text-xs text-gray-300 mt-1">
        Press <kbd className="px-1 py-0.5 bg-gray-600 rounded text-xs">{shortcut}</kbd>
      </div>
    </div>
  )

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  )
}

// Utility component for status tooltips
export function StatusTooltip({
  status,
  details,
  children,
  ...props
}: Omit<TooltipProps, 'content'> & {
  status: 'success' | 'error' | 'warning' | 'info'
  details: string
}) {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'error': return 'text-red-400'
      case 'warning': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
    }
  }

  const content = (
    <div className="flex items-center space-x-2">
      <span>{getStatusIcon()}</span>
      <span className={getStatusColor()}>{details}</span>
    </div>
  )

  return (
    <Tooltip content={content} {...props}>
      {children}
    </Tooltip>
  )
}
