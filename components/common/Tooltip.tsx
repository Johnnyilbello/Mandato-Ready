'use client';

import React, { useState, useRef, useEffect, useId, useCallback, ReactNode } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  className?: string;
  id?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'auto',
  delay = 150,
  className = '',
  id: customId,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    placement: 'top',
  });

  const generatedId = useId();
  const tooltipId = customId || `tooltip-${generatedId.replace(/:/g, '')}`;
  const triggerRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isHoveredOrFocused = useRef(false);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipWidth = 260; // assumed max width
    const tooltipHeight = 60; // assumed height
    const gap = 8;
    const viewportWidth = window.innerWidth;

    let chosenPlacement: 'top' | 'bottom' | 'left' | 'right' = position === 'auto' ? 'top' : position;

    if (position === 'auto') {
      if (rect.top - tooltipHeight - gap < 10) {
        chosenPlacement = 'bottom';
      } else {
        chosenPlacement = 'top';
      }
    }

    let top = 0;
    let left = 0;

    if (chosenPlacement === 'top') {
      top = rect.top - tooltipHeight - gap + window.scrollY;
      left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
    } else if (chosenPlacement === 'bottom') {
      top = rect.bottom + gap + window.scrollY;
      left = rect.left + rect.width / 2 - tooltipWidth / 2 + window.scrollX;
    } else if (chosenPlacement === 'left') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
      left = rect.left - tooltipWidth - gap + window.scrollX;
    } else if (chosenPlacement === 'right') {
      top = rect.top + rect.height / 2 - tooltipHeight / 2 + window.scrollY;
      left = rect.right + gap + window.scrollX;
    }

    // Boundary constraints
    if (left < 12) left = 12;
    if (left + tooltipWidth > viewportWidth - 12) {
      left = Math.max(12, viewportWidth - tooltipWidth - 12);
    }

    setCoords({ top, left, placement: chosenPlacement });
  }, [position]);

  const showTooltip = () => {
    isHoveredOrFocused.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (isHoveredOrFocused.current) {
        calculatePosition();
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = useCallback(() => {
    isHoveredOrFocused.current = false;
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        hideTooltip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, hideTooltip]);

  // Recalculate on resize or scroll while visible
  useEffect(() => {
    if (!isVisible) return;
    const handleScrollOrResize = () => {
      calculatePosition();
    };
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isVisible, calculatePosition]);

  if (!content) return <>{children}</>;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center"
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>
      {isVisible && typeof document !== 'undefined' && (
        <div
          id={tooltipId}
          role="tooltip"
          ref={tooltipRef}
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
          style={{
            position: 'absolute',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          className={`z-50 max-w-[280px] px-3 py-2 bg-[#faf9f6]/95 backdrop-blur-md border border-[#c7c6ca] text-[#1a1c1a] text-[12px] leading-relaxed shadow-[0_4px_16px_rgba(0,0,0,0.08)] pointer-events-auto select-none animate-in fade-in zoom-in-95 duration-150 ${className}`}
        >
          {content}
        </div>
      )}
    </>
  );
};
