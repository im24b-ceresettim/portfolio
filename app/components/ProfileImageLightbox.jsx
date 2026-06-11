'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

const PHONE_MAX_WIDTH = 600;
const LIGHTBOX_TRANSITION_MS = 350;

const isInteractiveViewport = () =>
  typeof window !== 'undefined' && window.innerWidth > PHONE_MAX_WIDTH;

export default function ProfileImageLightbox({ src, alt }) {
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

  const handleKeyDown = useCallback(
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

    const scrollY = window.scrollY;
    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPosition = body.style.position;
    const previousBodyTop = body.style.top;
    const previousBodyWidth = body.style.width;

    html.classList.add('lightbox-open');
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.width = '100%';
    body.style.top = `-${scrollY}px`;

    return () => {
      html.classList.remove('lightbox-open');
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.position = previousBodyPosition;
      body.style.top = previousBodyTop;
      body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
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

  return (
    <>
      <div
        className="profile-placeholder profile-placeholder--interactive"
        aria-label={alt}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
      >
        <Image
          className="profile-placeholder-image"
          src={src}
          alt={alt}
          width={220}
          height={220}
        />
      </div>

      {isOpen && (
        <div
          className={`profile-lightbox-backdrop ${isActive ? 'is-active' : ''}`}
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="profile-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              className="profile-lightbox-image"
              src={src}
              alt={alt}
              width={800}
              height={800}
            />
          </div>
        </div>
      )}
    </>
  );
}
