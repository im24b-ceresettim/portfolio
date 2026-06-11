'use client';

import { useCallback, useEffect, useState } from 'react';
import { lockBodyScroll } from '../utils/lockBodyScroll';

export const PHONE_MAX_WIDTH = 600;
export const LIGHTBOX_TRANSITION_MS = 600;

export const isInteractiveViewport = () =>
  typeof window !== 'undefined' && window.innerWidth > PHONE_MAX_WIDTH;

export function useLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleOpen = useCallback(() => {
    if (!isInteractiveViewport()) return;
    setIsOpen(true);
  }, []);

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

  useEffect(() => {
    if (!isOpen) return;

    const html = document.documentElement;
    html.classList.add('lightbox-open');
    const unlock = lockBodyScroll();

    return () => {
      html.classList.remove('lightbox-open');
      unlock();
    };
  }, [isOpen]);

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
