const getScrollbarWidth = () =>
  window.innerWidth - document.documentElement.clientWidth;

/**
 * Locks page scroll while preserving layout width when the scrollbar hides.
 * Returns an unlock function that restores scroll position and styles.
 */
export function lockBodyScroll() {
  const scrollY = window.scrollY;
  const html = document.documentElement;
  const body = document.body;
  const nav = document.querySelector('nav');
  const scrollbarWidth = getScrollbarWidth();

  const snapshot = {
    scrollY,
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    navPaddingRight: nav?.style.paddingRight ?? '',
  };

  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = 'auto';

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
    if (nav) nav.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    html.style.overflow = snapshot.htmlOverflow;
    body.style.overflow = snapshot.bodyOverflow;
    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.left = snapshot.bodyLeft;
    body.style.right = snapshot.bodyRight;
    body.style.width = snapshot.bodyWidth;
    body.style.paddingRight = snapshot.bodyPaddingRight;
    if (nav) nav.style.paddingRight = snapshot.navPaddingRight;
    window.scrollTo(0, snapshot.scrollY);
  };
}
