'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export const CAROUSEL_TRANSITION_MS = 500;
export const CAROUSEL_ENTER_DELAY_MS = 70;
export const CAROUSEL_TOTAL_MS = CAROUSEL_TRANSITION_MS + CAROUSEL_ENTER_DELAY_MS;

export function getPageItems(items, pageIndex, itemsPerPage) {
  const start = pageIndex * itemsPerPage;
  const pageItems = [];

  for (let slot = 0; slot < itemsPerPage; slot += 1) {
    pageItems.push(items[start + slot] ?? null);
  }

  return pageItems;
}

export function useSlideCarousel({
  totalItems,
  itemsPerPage = 1,
  onPageChange,
  onNavigateStart,
  onTransitionEnd,
  resetKey,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const [pageIndex, setPageIndex] = useState(0);
  const [leavingPageIndex, setLeavingPageIndex] = useState(null);
  const [direction, setDirection] = useState(1);
  const isAnimatingRef = useRef(false);
  const onPageChangeRef = useRef(onPageChange);
  const isTransitioning = leavingPageIndex !== null;

  useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  useEffect(() => {
    setPageIndex(0);
    setLeavingPageIndex(null);
    isAnimatingRef.current = false;
    onPageChangeRef.current?.(0);
  }, [resetKey, itemsPerPage, totalItems]);

  useEffect(() => {
    if (pageIndex < totalPages) return;
    const clampedPage = Math.max(0, totalPages - 1);
    if (clampedPage === pageIndex) return;
    setPageIndex(clampedPage);
    onPageChangeRef.current?.(clampedPage);
  }, [pageIndex, totalPages]);

  useEffect(() => {
    onPageChangeRef.current?.(pageIndex);
  }, [pageIndex]);

  const navigate = useCallback(
    (dir) => {
      if (isAnimatingRef.current || totalPages <= 1) return;

      const nextPage =
        dir === 1
          ? (pageIndex + 1) % totalPages
          : (pageIndex - 1 + totalPages) % totalPages;

      isAnimatingRef.current = true;
      onNavigateStart?.({ dir, fromPage: pageIndex, toPage: nextPage });
      setDirection(dir);
      setLeavingPageIndex(pageIndex);
      setPageIndex(nextPage);
    },
    [pageIndex, totalPages, onNavigateStart]
  );

  useEffect(() => {
    if (leavingPageIndex === null) return;

    const timer = window.setTimeout(() => {
      setLeavingPageIndex(null);
      isAnimatingRef.current = false;
      onTransitionEnd?.();
    }, CAROUSEL_TOTAL_MS);

    return () => window.clearTimeout(timer);
  }, [leavingPageIndex, pageIndex, onTransitionEnd]);

  const goPrev = useCallback(
    (event) => {
      event?.stopPropagation?.();
      navigate(-1);
    },
    [navigate]
  );

  const goNext = useCallback(
    (event) => {
      event?.stopPropagation?.();
      navigate(1);
    },
    [navigate]
  );

  return {
    pageIndex,
    leavingPageIndex,
    direction,
    isTransitioning,
    totalPages,
    canNavigate: totalPages > 1,
    goPrev,
    goNext,
  };
}
