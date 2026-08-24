'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_IMAGE_VIEW,
  getDisplayLayout,
  useImagePan,
} from '../hooks/useImagePan';
import { useSlideCarousel } from '../hooks/useSlideCarousel';
import PannableProjectImage from './PannableProjectImage';

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
  onIndexChange,
  onTransitionChange,
  consumeGestureMovedRef,
}) {
  const [leavingViewSnapshot, setLeavingViewSnapshot] = useState(DEFAULT_IMAGE_VIEW);
  const viewStateRef = useRef(DEFAULT_IMAGE_VIEW);
  const resetViewRef = useRef(null);

  const handleNavigateStart = useCallback(() => {
    setLeavingViewSnapshot(viewStateRef.current);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    resetViewRef.current?.();
  }, []);

  const {
    pageIndex: index,
    leavingPageIndex: leavingIndex,
    direction,
    isTransitioning,
    canNavigate,
    goPrev,
    goNext,
  } = useSlideCarousel({
    totalItems: images.length,
    itemsPerPage: 1,
    onPageChange: onIndexChange,
    resetKey: isOpen ? 'open' : 'closed',
    onNavigateStart: handleNavigateStart,
    onTransitionEnd: handleTransitionEnd,
  });

  const currentImage = images[index];
  const arrowsVisible = showArrows && canNavigate;
  const directionClass = direction === 1 ? 'next' : 'prev';

  const {
    frameRef,
    viewState,
    isPanning,
    isPinching,
    isInteractive,
    getImageLayout,
    getActiveDisplayLayout,
    registerImage,
    resetView,
    consumeGestureMoved,
    frameViewHandlers,
  } = useImagePan({
    isOpen,
    isTransitioning,
    activeSrc: currentImage,
  });

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  useEffect(() => {
    resetViewRef.current = resetView;
  }, [resetView]);

  const handleImageLoad = useCallback(
    (src, naturalWidth, naturalHeight) => {
      registerImage(src, naturalWidth, naturalHeight);
    },
    [registerImage]
  );

  useEffect(() => {
    onTransitionChange?.(isTransitioning);
  }, [isTransitioning, onTransitionChange]);

  useEffect(() => {
    if (!consumeGestureMovedRef) return;
    consumeGestureMovedRef.current = consumeGestureMoved;
  }, [consumeGestureMoved, consumeGestureMovedRef]);

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
  const activeDisplayLayout = getActiveDisplayLayout();
  const defaultTransitionLayout = (src) =>
    getDisplayLayout(getImageLayout(src), DEFAULT_IMAGE_VIEW.zoom);

  const frameClassName = [
    'project-lightbox-media-frame',
    isTransitioning ? 'project-lightbox-media-frame--transitioning' : '',
    !isTransitioning && isInteractive ? 'project-lightbox-media-frame--pannable' : '',
    isPanning ? 'is-panning' : '',
    isPinching ? 'is-pinching' : '',
  ]
    .filter(Boolean)
    .join(' ');

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
        ref={frameRef}
        className={frameClassName}
        {...(!isTransitioning ? frameViewHandlers : {})}
      >
        {isTransitioning && leavingImage ? (
          <div className="project-lightbox-media-clip">
            <div className="project-lightbox-media-viewport">
              <div
                className={`project-carousel-slide project-carousel-slide--leave project-carousel-slide--leave-${directionClass}`}
              >
                <PannableProjectImage
                  src={leavingImage}
                  displayLayout={getDisplayLayout(
                    getImageLayout(leavingImage),
                    leavingViewSnapshot.zoom
                  )}
                  panOffset={leavingViewSnapshot}
                  onImageLoad={handleImageLoad}
                  ariaHidden
                />
              </div>
              <div
                className={`project-carousel-slide project-carousel-slide--enter project-carousel-slide--enter-${directionClass}`}
              >
                <PannableProjectImage
                  src={currentImage}
                  alt={`${title} — Bild ${index + 1} von ${images.length}`}
                  displayLayout={defaultTransitionLayout(currentImage)}
                  panOffset={DEFAULT_IMAGE_VIEW}
                  onImageLoad={handleImageLoad}
                />
              </div>
            </div>
          </div>
        ) : (
          <PannableProjectImage
            src={currentImage}
            alt={`${title} — Bild ${index + 1} von ${images.length}`}
            displayLayout={activeDisplayLayout}
            panOffset={viewState}
            onImageLoad={handleImageLoad}
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
