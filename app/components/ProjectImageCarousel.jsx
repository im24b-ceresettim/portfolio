'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

const CAROUSEL_TRANSITION_MS = 500;
const CAROUSEL_ENTER_DELAY_MS = 70;
const CAROUSEL_TOTAL_MS = CAROUSEL_TRANSITION_MS + CAROUSEL_ENTER_DELAY_MS;

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
  const [leavingIndex, setLeavingIndex] = useState(null);
  const [direction, setDirection] = useState(1);
  const isAnimatingRef = useRef(false);

  const currentImage = images[index];
  const arrowsVisible = showArrows && images.length > 1;
  const isTransitioning = leavingIndex !== null;
  const directionClass = direction === 1 ? 'next' : 'prev';

  useEffect(() => {
    if (!isOpen) {
      setIndex(0);
      setLeavingIndex(null);
      isAnimatingRef.current = false;
    }
  }, [isOpen]);

  const navigate = useCallback(
    (dir) => {
      if (isAnimatingRef.current || images.length <= 1) return;

      const nextIndex =
        dir === 1
          ? (index + 1) % images.length
          : (index - 1 + images.length) % images.length;

      isAnimatingRef.current = true;
      setDirection(dir);
      setLeavingIndex(index);
      setIndex(nextIndex);
    },
    [index, images.length]
  );

  useEffect(() => {
    if (leavingIndex === null) return;

    const timer = window.setTimeout(() => {
      setLeavingIndex(null);
      isAnimatingRef.current = false;
    }, CAROUSEL_TOTAL_MS);

    return () => window.clearTimeout(timer);
  }, [leavingIndex, index]);

  const goPrev = useCallback(() => navigate(-1), [navigate]);
  const goNext = useCallback(() => navigate(1), [navigate]);

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

  const leavingImage = leavingIndex !== null ? images[leavingIndex] : null;

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
          disabled={isTransitioning}
        >
          <ChevronLeft />
        </button>
      )}

      <div
        className={`project-lightbox-media-frame${
          isTransitioning ? ' project-lightbox-media-frame--transitioning' : ''
        }`}
      >
        {isTransitioning && leavingImage ? (
          <div className="project-lightbox-media-clip">
            <div className="project-lightbox-media-viewport">
              <div
                className={`project-carousel-slide project-carousel-slide--leave project-carousel-slide--leave-${directionClass}`}
              >
                <Image
                  className="project-lightbox-media-image"
                  src={leavingImage}
                  alt=""
                  fill
                  sizes="42vw"
                  aria-hidden="true"
                />
              </div>
              <div
                className={`project-carousel-slide project-carousel-slide--enter project-carousel-slide--enter-${directionClass}`}
              >
                <Image
                  className="project-lightbox-media-image"
                  src={currentImage}
                  alt={`${title} — Bild ${index + 1} von ${images.length}`}
                  fill
                  sizes="42vw"
                />
              </div>
            </div>
          </div>
        ) : (
          <Image
            className="project-lightbox-media-image"
            src={currentImage}
            alt={`${title} — Bild ${index + 1} von ${images.length}`}
            fill
            sizes="42vw"
            priority
          />
        )}
      </div>

      {arrowsVisible && (
        <button
          type="button"
          className="project-carousel-btn project-carousel-btn--next"
          onClick={goNext}
          aria-label="Nächstes Bild"
          disabled={isTransitioning}
        >
          <ChevronRight />
        </button>
      )}
    </div>
  );
}
