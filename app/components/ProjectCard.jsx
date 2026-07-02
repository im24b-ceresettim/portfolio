'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLightbox } from '../hooks/useLightbox';
import { usePanelPointerTap } from '../hooks/usePanelPointerTap';
import { getProjectLightboxMode } from '../utils/projectLightboxMode';
import ProjectFocusOverlay from './ProjectFocusOverlay';
import ProjectImageCarousel from './ProjectImageCarousel';

function GithubIcon() {
  return (
    <svg
      className="btn-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LiveIcon() {
  return (
    <svg
      className="btn-icon"
      viewBox="0 0 24 24"
      width="18"
      height="18"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function ProjectCardContent({ project, hasGh, hasUrl, techTags, onCardSurface }) {
  const handleLinkClick = useCallback(
    (event) => {
      if (!onCardSurface) return;
      event.stopPropagation();
    },
    [onCardSurface]
  );

  return (
    <>
      <div className="project-content">
        <h3>{project.title}</h3>
        <p className="project-desc">{project.description}</p>
        <div className="project-tags">
          {techTags.map((tag) => (
            <span key={tag} className="tech-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {(hasGh || hasUrl) && (
        <div className="project-actions">
          {hasGh && (
            <a
              href={project.gh}
              target="_blank"
              rel="noreferrer"
              className="project-btn github-btn"
              onClick={handleLinkClick}
            >
              <GithubIcon />
              Github
            </a>
          )}
          {hasUrl && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="project-btn live-btn"
              onClick={handleLinkClick}
            >
              <LiveIcon />
              Live ansehen
            </a>
          )}
        </div>
      )}
    </>
  );
}

function ProjectLightboxPanel({ project, hasGh, hasUrl, techTags }) {
  return (
    <div className="project-lightbox-panel">
      <ProjectCardContent
        project={project}
        hasGh={hasGh}
        hasUrl={hasUrl}
        techTags={techTags}
        onCardSurface
      />
    </div>
  );
}

export default function ProjectCard({ project, images = [] }) {
  const { isOpen, isActive, handleOpen, handleClose, handleTriggerKeyDown } =
    useLightbox();

  const [focusMode, setFocusMode] = useState(null);
  const [focusOpen, setFocusOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselTransitioning, setCarouselTransitioning] = useState(false);

  const hasGh = project.gh && project.gh !== '#';
  const hasUrl = project.url && project.url !== '#';
  const techTags = project.stack
    ? project.stack.split(',').map((s) => s.trim())
    : [];
  const lightboxMode = getProjectLightboxMode(images.length);
  const usesImageLayout = lightboxMode !== 'standard';
  const showCarouselArrows = lightboxMode === 'multipicture';
  const focusImageSrc = images[carouselIndex];

  const openFocus = useCallback((mode) => {
    setFocusMode(mode);
    setFocusOpen(true);
  }, []);

  const closeFocus = useCallback(() => {
    setFocusOpen(false);
  }, []);

  const clearFocusMode = useCallback(() => {
    setFocusMode(null);
  }, []);

  const consumeGestureMovedRef = useRef(() => false);

  const openCardFocus = useCallback(() => {
    openFocus('card');
  }, [openFocus]);

  const {
    handlePanelPointerDown,
    handlePanelPointerMove,
    handlePanelPointerUp: handlePanelFocusPointerUp,
    handlePanelPointerCancel,
    resetPanelPointer,
  } = usePanelPointerTap(openCardFocus);

  const handleMediaFocusPointerUp = useCallback(
    (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('.project-carousel-btn')) return;
      event.stopPropagation();
      if (carouselTransitioning) return;
      if (consumeGestureMovedRef.current()) return;
      openFocus('image');
    },
    [carouselTransitioning, openFocus]
  );

  const handleMediaFocusKeyDown = useCallback(
    (event) => {
      if (carouselTransitioning) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openFocus('image');
      }
    },
    [carouselTransitioning, openFocus]
  );

  const handlePanelFocusKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.stopPropagation();
        openFocus('card');
      }
    },
    [openFocus]
  );

  const handleProjectBackdropClick = useCallback(
    (event) => {
      if (focusOpen) {
        event.stopPropagation();
        return;
      }
      handleClose();
    },
    [focusOpen, handleClose]
  );

  const stopBackdropClick = useCallback((event) => {
    event.stopPropagation();
  }, []);

  const preventDoubleClickSelect = useCallback((event) => {
    event.preventDefault();
  }, []);

  useEffect(() => {
    if (isOpen) return;
    setFocusMode(null);
    setFocusOpen(false);
    setCarouselIndex(0);
    setCarouselTransitioning(false);
    resetPanelPointer();
  }, [isOpen, resetPanelPointer]);

  useEffect(() => {
    if (!focusOpen) return;

    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      event.stopImmediatePropagation();
      closeFocus();
    };

    window.addEventListener('keydown', handleEscape, true);
    return () => window.removeEventListener('keydown', handleEscape, true);
  }, [focusOpen, closeFocus]);

  return (
    <>
      <article
        className="project-card project-card--interactive"
        onClick={handleOpen}
        onKeyDown={handleTriggerKeyDown}
        role="button"
        tabIndex={0}
        aria-label={`${project.title} — details anzeigen`}
      >
        <ProjectCardContent
          project={project}
          hasGh={hasGh}
          hasUrl={hasUrl}
          techTags={techTags}
          onCardSurface
        />
      </article>

      {isOpen && (
        <div
          className={`lightbox-backdrop ${isActive ? 'is-active' : ''}${
            usesImageLayout ? ' lightbox-backdrop--project-wide' : ''
          }`}
          onClick={handleProjectBackdropClick}
          onDoubleClick={preventDoubleClickSelect}
          role="presentation"
        >
          {usesImageLayout ? (
            <div
              className="project-lightbox-layout"
              role="dialog"
              aria-modal="true"
              aria-label={project.title}
              onClick={stopBackdropClick}
              onDoubleClick={preventDoubleClickSelect}
            >
              <div
                className="project-lightbox-media project-lightbox-media--focusable"
                role="button"
                tabIndex={0}
                aria-label={`${project.title} — Bild vergrössern`}
                onClick={stopBackdropClick}
                onPointerUp={handleMediaFocusPointerUp}
                onKeyDown={handleMediaFocusKeyDown}
              >
                <ProjectImageCarousel
                  images={images}
                  title={project.title}
                  showArrows={showCarouselArrows}
                  isOpen={isOpen}
                  onIndexChange={setCarouselIndex}
                  onTransitionChange={setCarouselTransitioning}
                  consumeGestureMovedRef={consumeGestureMovedRef}
                />
              </div>
              <div
                className="project-lightbox-panel-wrap project-lightbox-panel-wrap--focusable"
                role="button"
                tabIndex={0}
                aria-label={`${project.title} — Karte vergrössern`}
                onClick={stopBackdropClick}
                onPointerDown={handlePanelPointerDown}
                onPointerMove={handlePanelPointerMove}
                onPointerUp={handlePanelFocusPointerUp}
                onPointerCancel={handlePanelPointerCancel}
                onKeyDown={handlePanelFocusKeyDown}
              >
                <ProjectLightboxPanel
                  project={project}
                  hasGh={hasGh}
                  hasUrl={hasUrl}
                  techTags={techTags}
                />
              </div>
            </div>
          ) : (
            <div
              className="project-lightbox-panel project-lightbox-panel--centered"
              role="dialog"
              aria-modal="true"
              aria-label={project.title}
              onClick={(event) => event.stopPropagation()}
            >
              <ProjectCardContent
                project={project}
                hasGh={hasGh}
                hasUrl={hasUrl}
                techTags={techTags}
              />
            </div>
          )}

          {usesImageLayout && focusMode && focusImageSrc && (
            <ProjectFocusOverlay
              mode={focusMode}
              isOpen={focusOpen}
              onClose={closeFocus}
              onExited={clearFocusMode}
              imageSrc={focusImageSrc}
              imageAlt={`${project.title} — Bild ${carouselIndex + 1} von ${images.length}`}
              cardLabel={project.title}
              cardContent={
                <ProjectCardContent
                  project={project}
                  hasGh={hasGh}
                  hasUrl={hasUrl}
                  techTags={techTags}
                  onCardSurface
                />
              }
            />
          )}
        </div>
      )}
    </>
  );
}
