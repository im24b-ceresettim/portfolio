'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { lockBodyScroll } from '../utils/lockBodyScroll';

export const PHONE_MAX_WIDTH = 600;
export const LIGHTBOX_TRANSITION_MS = 600;

export const isInteractiveViewport = () =>
  typeof window !== 'undefined' && window.innerWidth > PHONE_MAX_WIDTH;

export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const unlockScrollRef = useRef(null);

  const releaseScrollLock = useCallback(() => {
    if (!unlockScrollRef.current) return;
    unlockScrollRef.current();
    unlockScrollRef.current = null;
    document.documentElement.classList.remove('lightbox-open');
  }, []);

  const acquireScrollLock = useCallback(() => {
    if (unlockScrollRef.current) return;
    document.documentElement.classList.add('lightbox-open');
    unlockScrollRef.current = lockBodyScroll();
  }, []);

  const handleOpen = useCallback(() => {
    if (!isInteractiveViewport()) return;
    acquireScrollLock();
    setIsOpen(true);
  }, [acquireScrollLock]);

  const handleClose = useCallback(() => {
    setIsActive(false);
    window.setTimeout(() => {
      setIsOpen(false);
    }, LIGHTBOX_TRANSITION_MS);
  }, []);

  const handleTriggerKeyDown = useCallback(
    (event) => {
      if (!isInteractiveViewport()) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleOpen();
      }
    },
    [handleOpen]
  );

  useLayoutEffect(() => {
    if (isOpen) {
      if (!unlockScrollRef.current) {
        acquireScrollLock();
      }
      return;
    }

    releaseScrollLock();
  }, [isOpen, acquireScrollLock, releaseScrollLock]);

  useEffect(() => {
    return () => {
      releaseScrollLock();
    };
  }, [releaseScrollLock]);

  useEffect(() => {
    if (!isOpen) {
      setIsActive(false);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsActive(true);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  return {
    isOpen,
    isActive,
    handleOpen,
    handleClose,
    handleTriggerKeyDown,
  };
}
