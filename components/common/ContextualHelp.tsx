'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { HELP_CONCEPTS } from '@/lib/helpContent';

interface ContextualHelpProps {
  conceptId?: string;
  title?: string;
  explanation?: string;
  icon?: 'help' | 'info';
  size?: 'sm' | 'md';
  alwaysVisible?: boolean;
  className?: string;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({
  conceptId,
  title: customTitle,
  explanation: customExplanation,
  icon = 'help',
  size = 'sm',
  alwaysVisible = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const uniqueId = useId();

  const concept = conceptId ? HELP_CONCEPTS[conceptId] : undefined;
  const title = customTitle || concept?.title || 'Informazione';
  const explanation = customExplanation || concept?.tooltip || concept?.description || '';

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 32);
    const popoverHeight = 160; // estimate
    const gap = 8;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + gap + window.scrollY;
    let left = rect.left + rect.width / 2 - popoverWidth / 2 + window.scrollX;

    // Flip to top if bottom overflows
    if (rect.bottom + popoverHeight + gap > viewportHeight && rect.top - popoverHeight - gap > 0) {
      top = rect.top - popoverHeight - gap + window.scrollY;
    }

    // Horizontal bounds
    if (left < 16) left = 16;
    if (left + popoverWidth > viewportWidth - 16) {
      left = Math.max(16, viewportWidth - popoverWidth - 16);
    }

    setPopoverPos({ top, left });
  };

  const togglePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const closePopover = () => {
    setIsOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Recalculate position on resize
  useEffect(() => {
    if (!isOpen) return;
    const handleResize = () => calculatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen]);

  if (!alwaysVisible && !concept) return null;

  return (
    <span className={`inline-flex items-center align-middle mx-1 relative select-none ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        id={`help-trigger-${conceptId || uniqueId.replace(/:/g, '')}`}
        onClick={togglePopover}
        aria-expanded={isOpen}
        aria-label={`Spiega ${title}`}
        className={`inline-flex items-center justify-center rounded-full border transition-all cursor-pointer ${
          size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-[11px]'
        } ${
          isOpen
            ? 'bg-[#1a1c1a] text-white border-[#1a1c1a] shadow-sm scale-105'
            : 'bg-[#faf9f6] text-[#76777b] border-[#c7c6ca] hover:border-[#1a1c1a] hover:text-[#1a1c1a] hover:bg-[#e3e2e0]'
        }`}
        title={`Spiega: ${title}`}
      >
        <span className="font-mono font-bold leading-none">
          {icon === 'help' ? '?' : 'i'}
        </span>
      </button>

      {isOpen && typeof document !== 'undefined' && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Guida: ${title}`}
          style={{
            position: 'absolute',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: 'min(320px, calc(100vw - 32px))',
          }}
          className="z-50 p-4 bg-[#faf9f6]/95 backdrop-blur-lg border-2 border-[#1a1c1a] shadow-[0_12px_32px_rgba(0,0,0,0.18)] text-[#1a1c1a] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-[#c7c6ca]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-4 h-4 bg-[#a14009] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                ?
              </span>
              <h4 className="text-[13px] font-bold uppercase tracking-wider text-[#1a1c1a] truncate">
                {title}
              </h4>
            </div>
            <button
              onClick={closePopover}
              aria-label="Chiudi spiegazione"
              className="text-[#76777b] hover:text-[#1a1c1a] p-0.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px] leading-none">close</span>
            </button>
          </div>

          <p className="text-[13px] text-[#46474a] leading-relaxed mb-3">
            {explanation}
          </p>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={closePopover}
              className="px-3 py-1 bg-[#1a1c1a] text-white hover:bg-[#333533] text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </span>
  );
};
