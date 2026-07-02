'use client';

import Image from 'next/image';

export default function PannableProjectImage({
  src,
  alt = '',
  sizes = '42vw',
  priority = false,
  panOffset = { x: 0, y: 0 },
  displayLayout = null,
  onImageLoad,
  ariaHidden = false,
}) {
  if (!displayLayout) {
    return (
      <Image
        className="project-lightbox-media-image"
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={95}
        aria-hidden={ariaHidden || undefined}
        draggable={false}
        onLoadingComplete={(img) =>
          onImageLoad?.(src, img.naturalWidth, img.naturalHeight)
        }
      />
    );
  }

  const displaySizes = `${Math.ceil(displayLayout.renderedW)}px`;

  return (
    <div
      className="project-carousel-pan-layer"
      style={{
        width: displayLayout.renderedW,
        height: displayLayout.renderedH,
        transform: `translate(calc(-50% + ${panOffset.x}px), calc(-50% + ${panOffset.y}px))`,
      }}
    >
      <Image
        className="project-lightbox-media-image project-lightbox-media-image--pannable"
        src={src}
        alt={alt}
        width={displayLayout.naturalW}
        height={displayLayout.naturalH}
        sizes={displaySizes}
        quality={95}
        priority={priority}
        aria-hidden={ariaHidden || undefined}
        draggable={false}
        onLoadingComplete={(img) =>
          onImageLoad?.(src, img.naturalWidth, img.naturalHeight)
        }
      />
    </div>
  );
}
