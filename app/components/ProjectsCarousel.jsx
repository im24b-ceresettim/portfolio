'use client';

import { useCallback } from 'react';
import { getPageItems, useSlideCarousel } from '../hooks/useSlideCarousel';
import { useResponsiveItemsPerPage } from '../hooks/useResponsiveItemsPerPage';
import ProjectCard from './ProjectCard';

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

function ProjectsCarouselPage({ pageItems }) {
  return (
    <div className="projects-section-carousel-page">
      {pageItems.map((item, slotIndex) => (
        item ? (
          <ProjectCard
            key={item.project.slug}
            project={item.project}
            images={item.images}
          />
        ) : (
          <div
            key={`empty-slot-${slotIndex}`}
            className="projects-section-carousel-slot--empty"
            aria-hidden="true"
          />
        )
      ))}
    </div>
  );
}

export default function ProjectsCarousel({ items }) {
  const itemsPerPage = useResponsiveItemsPerPage(2);
  const {
    pageIndex,
    leavingPageIndex,
    direction,
    isTransitioning,
    totalPages,
    canNavigate,
    goPrev,
    goNext,
  } = useSlideCarousel({
    totalItems: items.length,
    itemsPerPage,
    resetKey: `${items.length}-${itemsPerPage}`,
  });

  const directionClass = direction === 1 ? 'next' : 'prev';
  const currentPageItems = getPageItems(items, pageIndex, itemsPerPage);
  const leavingPageItems =
    leavingPageIndex !== null
      ? getPageItems(items, leavingPageIndex, itemsPerPage)
      : null;

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
    },
    [goPrev, goNext]
  );

  return (
    <div
      className={`projects-section-carousel${
        canNavigate ? '' : ' projects-section-carousel--single'
      }`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Projekte"
    >
      {canNavigate && (
        <button
          type="button"
          className="project-carousel-btn projects-section-carousel-btn projects-section-carousel-btn--prev"
          onClick={goPrev}
          aria-label="Vorherige Projekte"
          disabled={isTransitioning}
        >
          <ChevronLeft />
        </button>
      )}

      <div
        className={`projects-section-carousel-viewport${
          isTransitioning ? ' projects-section-carousel-viewport--transitioning' : ''
        }`}
      >
        {isTransitioning && leavingPageItems ? (
          <div className="projects-section-carousel-clip">
            <div className="projects-section-carousel-track">
              <div
                className={`project-carousel-slide project-carousel-slide--leave project-carousel-slide--leave-${directionClass}`}
              >
                <ProjectsCarouselPage pageItems={leavingPageItems} />
              </div>
              <div
                className={`project-carousel-slide project-carousel-slide--enter project-carousel-slide--enter-${directionClass}`}
              >
                <ProjectsCarouselPage pageItems={currentPageItems} />
              </div>
            </div>
          </div>
        ) : (
          <ProjectsCarouselPage pageItems={currentPageItems} />
        )}
      </div>

      {canNavigate && (
        <button
          type="button"
          className="project-carousel-btn projects-section-carousel-btn projects-section-carousel-btn--next"
          onClick={goNext}
          aria-label="Nächste Projekte"
          disabled={isTransitioning}
        >
          <ChevronRight />
        </button>
      )}

      {canNavigate && (
        <p className="projects-section-carousel-counter" aria-live="polite">
          {pageIndex + 1} / {totalPages}
        </p>
      )}
    </div>
  );
}
