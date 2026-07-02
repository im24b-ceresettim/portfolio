'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePanelPointerTap } from '../hooks/usePanelPointerTap';

const FOCUS_OVERLAY_MS = 200;

export default function ProjectFocusOverlay({
  mode,
  isOpen,
  onClose,
  onExited,
  imageSrc,
  imageAlt,
  cardContent,
  cardLabel,
}) {
  const [isActive, setIsActive] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exitTimerRef = useRef(null);
  const hadOpenRef = useRef(false);

  const clearExitTimer = () => {
    if (exitTimerRef.current !== null) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  };

  const startExit = () => {
    clearExitTimer();
    setIsActive(false);
    setIsClosing(true);
    exitTimerRef.current = window.setTimeout(() => {
      setIsClosing(false);
      onExited?.();
      exitTimerRef.current = null;
    }, FOCUS_OVERLAY_MS);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      hadOpenRef.current = true;
      clearExitTimer();
      setIsClosing(false);

      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsActive(true);
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    if (!hadOpenRef.current) return;

    startExit();
  }, [isOpen]);

  useEffect(() => {
    return () => clearExitTimer();
  }, []);

  const handleClose = useCallback(
    (event) => {
      event?.stopPropagation?.();
      onClose();
    },
    [onClose]
  );

  const closeCardFocus = useCallback(() => {
    onClose();
  }, [onClose]);

  const {
    handlePanelPointerDown,
    handlePanelPointerMove,
    handlePanelPointerUp,
    handlePanelPointerCancel,
    resetPanelPointer,
  } = usePanelPointerTap(closeCardFocus);

  useEffect(() => {
    if (isOpen) return;
    resetPanelPointer();
  }, [isOpen, resetPanelPointer]);

  const handleImageBackdropClick = useCallback(
    (event) => {
      handleClose(event);
    },
    [handleClose]
  );

  const handleCardBackdropPointerUp = useCallback(
    (event) => {
      if (event.button !== 0) return;
      if (event.target !== event.currentTarget) return;
      handleClose(event);
    },
    [handleClose]
  );

  const stopBackdropClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const preventDoubleClickSelect = (event) => {
    event.preventDefault();
  };

  if (!mounted || (!isOpen && !isClosing)) return null;

  const isCardMode = mode === 'card';

  return createPortal(
    <div
      className={`lightbox-backdrop lightbox-backdrop--focus${
        isActive ? ' is-active' : ''
      }${isClosing ? ' is-closing' : ''}`}
      onClick={isCardMode ? stopBackdropClick : handleImageBackdropClick}
      onPointerUp={isCardMode ? handleCardBackdropPointerUp : undefined}
      onDoubleClick={preventDoubleClickSelect}
      role="presentation"
    >
      {mode === 'image' ? (
        <div
          className="project-focus-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={imageAlt}
        >
          <Image
            className="project-focus-image"
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="92vw"
            quality={95}
            priority
          />
        </div>
      ) : (
        <div
          className="project-lightbox-panel project-lightbox-panel--centered project-lightbox-panel--focus-card"
          role="dialog"
          aria-modal="true"
          aria-label={cardLabel}
          onClick={stopBackdropClick}
          onPointerDown={handlePanelPointerDown}
          onPointerMove={handlePanelPointerMove}
          onPointerUp={handlePanelPointerUp}
          onPointerCancel={handlePanelPointerCancel}
        >
          {cardContent}
        </div>
      )}
    </div>,
    document.body
  );
}
