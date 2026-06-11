'use client';

import { useCallback } from 'react';
import { isInteractiveViewport, useLightbox } from '../hooks/useLightbox';

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

function ProjectCardContent({ project, hasGh, hasUrl, techTags, interceptLinks }) {
  const handleLinkClick = useCallback(
    (event) => {
      if (!interceptLinks || !isInteractiveViewport()) return;
      event.preventDefault();
      event.stopPropagation();
      interceptLinks();
    },
    [interceptLinks]
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

export default function ProjectCard({ project }) {
  const { isOpen, isActive, handleOpen, handleClose, handleTriggerKeyDown } =
    useLightbox();

  const hasGh = project.gh && project.gh !== '#';
  const hasUrl = project.url && project.url !== '#';
  const techTags = project.stack
    ? project.stack.split(',').map((s) => s.trim())
    : [];

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
          interceptLinks={handleOpen}
        />
      </article>

      {isOpen && (
        <div
          className={`lightbox-backdrop ${isActive ? 'is-active' : ''}`}
          onClick={handleClose}
          role="presentation"
        >
          <div
            className="project-lightbox-panel"
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
        </div>
      )}
    </>
  );
}
