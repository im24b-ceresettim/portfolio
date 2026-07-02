export const OVERLAY_SCROLL_GUARD_MS = 900;
export const OVERLAY_UNLOCK_GUARD_MS = 150;

let overlayScrollGuardUntil = 0;

export function isOverlayScrollGuardActive() {
  return performance.now() < overlayScrollGuardUntil;
}

function armOverlayScrollGuard(duration = OVERLAY_SCROLL_GUARD_MS) {
  overlayScrollGuardUntil = performance.now() + duration;
}

/**
 * Locks page scroll without shifting layout. Relies on scrollbar-gutter: stable
 * on html so hiding overflow does not change page width.
 *
 * Sticky nav stops working when overflow is hidden, so we pin nav with
 * position: fixed and insert a spacer to hold its in-flow height.
 */
export function lockBodyScroll() {
  const scrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;
  const nav = document.querySelector('nav');

  armOverlayScrollGuard();

  const snapshot = {
    scrollY,
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    navPosition: nav?.style.position ?? '',
    navTop: nav?.style.top ?? '',
    navLeft: nav?.style.left ?? '',
    navRight: nav?.style.right ?? '',
    navWidth: nav?.style.width ?? '',
    navZIndex: nav?.style.zIndex ?? '',
  };

  let navSpacer = null;

  if (nav) {
    const navHeight = nav.getBoundingClientRect().height;
    navSpacer = document.createElement('div');
    navSpacer.className = 'nav-scroll-lock-spacer';
    navSpacer.style.height = `${navHeight}px`;
    navSpacer.setAttribute('aria-hidden', 'true');
    nav.parentNode?.insertBefore(navSpacer, nav);

    nav.style.position = 'fixed';
    nav.style.top = '0';
    nav.style.left = '0';
    nav.style.right = '0';
    nav.style.width = 'auto';
    nav.style.zIndex = '30';
  }

  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  window.scrollTo(0, scrollY);

  return () => {
    if (nav) {
      nav.style.position = snapshot.navPosition;
      nav.style.top = snapshot.navTop;
      nav.style.left = snapshot.navLeft;
      nav.style.right = snapshot.navRight;
      nav.style.width = snapshot.navWidth;
      nav.style.zIndex = snapshot.navZIndex;
    }
    navSpacer?.remove();

    html.style.overflow = snapshot.htmlOverflow;
    body.style.overflow = snapshot.bodyOverflow;
    window.scrollTo(0, snapshot.scrollY);
    armOverlayScrollGuard(OVERLAY_UNLOCK_GUARD_MS);
  };
}
