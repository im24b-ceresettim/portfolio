'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

function ChevronLeft() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function ProjectImageCarousel({
  images,
  title,
  showArrows = true,
  isOpen = false,
}) {
  const [index, setIndex] = useState(0);
  const currentImage = images[index];
  const arrowsVisible = showArrows && images.length > 1;

  useEffect(() => {
    if (!isOpen) {
      setIndex(0);
    }
  }, [isOpen]);

  const goPrev = useCallback(() => {
    setIndex((current) => (current - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen || !arrowsVisible) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, arrowsVisible, goPrev, goNext]);

  if (!currentImage) {
    return (
      <div className="project-lightbox-media-placeholder" aria-hidden="true">
        Screenshot
      </div>
    );
  }

  return (
    <div
      className={`project-lightbox-carousel${
        arrowsVisible ? '' : ' project-lightbox-carousel--single'
      }`}
    >
      {arrowsVisible && (
        <button
          type="button"
          className="project-carousel-btn project-carousel-btn--prev"
          onClick={goPrev}
          aria-label="Vorheriges Bild"
        >
          <ChevronLeft />
        </button>
      )}

      <div className="project-lightbox-media-frame">
        <Image
          className="project-lightbox-media-image"
          src={currentImage}
          alt={`${title} — Bild ${index + 1} von ${images.length}`}
          fill
          sizes="42vw"
          priority
        />
      </div>

      {arrowsVisible && (
        <button
          type="button"
          className="project-carousel-btn project-carousel-btn--next"
          onClick={goNext}
          aria-label="Nächstes Bild"
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
