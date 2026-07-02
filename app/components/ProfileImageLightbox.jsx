'use client';

import Image from 'next/image';
import { useLightbox } from '../hooks/useLightbox';

export default function ProfileImageLightbox({ src, alt }) {
  const { isOpen, isActive, handleOpen, handleClose, handleTriggerKeyDown } =
    useLightbox();

  return (
    <>
      <div
        className="profile-placeholder profile-placeholder--interactive"
        aria-label={alt}
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={handleTriggerKeyDown}
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
          className={`lightbox-backdrop ${isActive ? 'is-active' : ''}`}
          onClick={handleClose}
          onDoubleClick={(event) => event.preventDefault()}
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
