'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const PAN_DRAG_THRESHOLD_PX = 4;
const WHEEL_ZOOM_SENSITIVITY = 0.0018;

export const IMAGE_DEFAULT_ZOOM = 1.08;
export const IMAGE_MIN_ZOOM = 1.0;
export const IMAGE_MAX_ZOOM = 3.0;

export const DEFAULT_IMAGE_VIEW = {
  x: 0,
  y: 0,
  zoom: IMAGE_DEFAULT_ZOOM,
};

function clampZoom(zoom) {
  return Math.min(IMAGE_MAX_ZOOM, Math.max(IMAGE_MIN_ZOOM, zoom));
}

function clampPan(offset, bounds) {
  return {
    x: Math.min(bounds.maxPanX, Math.max(-bounds.maxPanX, offset.x)),
    y: Math.min(bounds.maxPanY, Math.max(-bounds.maxPanY, offset.y)),
  };
}

function computeBaseLayout(naturalW, naturalH, containerW, containerH) {
  const baseScale = Math.max(containerW / naturalW, containerH / naturalH);

  return {
    naturalW,
    naturalH,
    baseScale,
    containerW,
    containerH,
  };
}

function getBounds(baseLayout, zoom) {
  const renderedW = baseLayout.naturalW * baseLayout.baseScale * zoom;
  const renderedH = baseLayout.naturalH * baseLayout.baseScale * zoom;

  return {
    maxPanX: Math.max(0, (renderedW - baseLayout.containerW) / 2),
    maxPanY: Math.max(0, (renderedH - baseLayout.containerH) / 2),
  };
}

export function getDisplayLayout(baseLayout, zoom) {
  if (!baseLayout) return null;

  const renderedW = baseLayout.naturalW * baseLayout.baseScale * zoom;
  const renderedH = baseLayout.naturalH * baseLayout.baseScale * zoom;

  return {
    naturalW: baseLayout.naturalW,
    naturalH: baseLayout.naturalH,
    renderedW,
    renderedH,
  };
}

function clampView(view, baseLayout) {
  if (!baseLayout) return view;

  const zoom = clampZoom(view.zoom);
  const bounds = getBounds(baseLayout, zoom);

  return {
    zoom,
    ...clampPan({ x: view.x, y: view.y }, bounds),
  };
}

function zoomViewTowardPoint(view, baseLayout, pointX, pointY, nextZoom) {
  if (!baseLayout) return view;

  const oldZoom = view.zoom;
  const zoom = clampZoom(nextZoom);
  if (zoom === oldZoom) return view;

  const ratio = zoom / oldZoom;
  const nextX = pointX - (pointX - view.x) * ratio;
  const nextY = pointY - (pointY - view.y) * ratio;

  return clampView({ x: nextX, y: nextY, zoom }, baseLayout);
}

function getPointerDistance(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function useImagePan({ isOpen, isTransitioning, activeSrc }) {
  const frameRef = useRef(null);
  const imageMetaRef = useRef({});
  const baseLayoutBySrcRef = useRef({});
  const activePointersRef = useRef(new Map());
  const pinchRef = useRef({
    active: false,
    startDistance: 0,
    startZoom: IMAGE_DEFAULT_ZOOM,
  });
  const dragRef = useRef({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    moved: false,
  });
  const gestureMovedRef = useRef(false);

  const [layoutBySrc, setLayoutBySrc] = useState({});
  const [viewState, setViewState] = useState(DEFAULT_IMAGE_VIEW);
  const viewStateRef = useRef(DEFAULT_IMAGE_VIEW);
  const [isPanning, setIsPanning] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isInteractive, setIsInteractive] = useState(false);

  const getBaseLayout = useCallback(
    (src) => baseLayoutBySrcRef.current[src] ?? null,
    []
  );

  const recalculateBaseLayouts = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const { width, height } = frame.getBoundingClientRect();
    if (width <= 0 || height <= 0) return;

    const nextLayouts = {};

    for (const [src, meta] of Object.entries(imageMetaRef.current)) {
      const baseLayout = computeBaseLayout(
        meta.naturalW,
        meta.naturalH,
        width,
        height
      );
      baseLayoutBySrcRef.current[src] = baseLayout;
      nextLayouts[src] = baseLayout;
    }

    setLayoutBySrc(nextLayouts);
  }, []);

  const applyViewUpdate = useCallback(
    (updater) => {
      setViewState((prev) => {
        const baseLayout = activeSrc ? getBaseLayout(activeSrc) : null;
        const next = typeof updater === 'function' ? updater(prev) : updater;
        const clamped = clampView(next, baseLayout);
        viewStateRef.current = clamped;
        return clamped;
      });
    },
    [activeSrc, getBaseLayout]
  );

  const registerImage = useCallback(
    (src, naturalW, naturalH) => {
      if (!src || naturalW <= 0 || naturalH <= 0) return;

      imageMetaRef.current[src] = { naturalW, naturalH };
      recalculateBaseLayouts();
    },
    [recalculateBaseLayouts]
  );

  const getImageLayout = useCallback(
    (src) => layoutBySrc[src] ?? null,
    [layoutBySrc]
  );

  const getActiveDisplayLayout = useCallback(() => {
    const baseLayout = activeSrc ? getBaseLayout(activeSrc) : null;
    return getDisplayLayout(baseLayout, viewState.zoom);
  }, [activeSrc, getBaseLayout, viewState.zoom]);

  useEffect(() => {
    viewStateRef.current = viewState;
  }, [viewState]);

  useEffect(() => {
    if (isOpen) return;

    imageMetaRef.current = {};
    baseLayoutBySrcRef.current = {};
    activePointersRef.current = new Map();
    pinchRef.current = {
      active: false,
      startDistance: 0,
      startZoom: IMAGE_DEFAULT_ZOOM,
    };
    dragRef.current = {
      active: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      moved: false,
    };
    gestureMovedRef.current = false;
    setLayoutBySrc({});
    setViewState(DEFAULT_IMAGE_VIEW);
    viewStateRef.current = DEFAULT_IMAGE_VIEW;
    setIsPanning(false);
    setIsPinching(false);
    setIsInteractive(false);
  }, [isOpen]);

  const consumeGestureMoved = useCallback(() => {
    const moved = gestureMovedRef.current;
    gestureMovedRef.current = false;
    return moved;
  }, []);

  const resetView = useCallback(() => {
    setViewState(DEFAULT_IMAGE_VIEW);
    viewStateRef.current = DEFAULT_IMAGE_VIEW;
    setIsPanning(false);
    setIsPinching(false);
    activePointersRef.current = new Map();
    pinchRef.current = {
      active: false,
      startDistance: 0,
      startZoom: IMAGE_DEFAULT_ZOOM,
    };
    dragRef.current = {
      active: false,
      pointerId: null,
      lastX: 0,
      lastY: 0,
      moved: false,
    };
  }, []);

  useEffect(() => {
    const baseLayout = activeSrc ? getBaseLayout(activeSrc) : null;
    if (!baseLayout) {
      setIsInteractive(false);
      return;
    }

    setViewState((prev) => clampView(prev, baseLayout));
  }, [activeSrc, getBaseLayout, layoutBySrc]);

  useEffect(() => {
    const baseLayout = activeSrc ? getBaseLayout(activeSrc) : null;
    if (!baseLayout) {
      setIsInteractive(false);
      return;
    }

    const bounds = getBounds(baseLayout, viewState.zoom);
    setIsInteractive(
      viewState.zoom > IMAGE_MIN_ZOOM ||
        bounds.maxPanX > 0 ||
        bounds.maxPanY > 0
    );
  }, [activeSrc, getBaseLayout, viewState]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !isOpen) return;

    const observer = new ResizeObserver(() => {
      recalculateBaseLayouts();
    });

    observer.observe(frame);
    recalculateBaseLayouts();

    return () => observer.disconnect();
  }, [isOpen, recalculateBaseLayouts]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || !isOpen || isTransitioning || !activeSrc) return;

    const handleWheel = (event) => {
      event.preventDefault();
      event.stopPropagation();

      const baseLayout = getBaseLayout(activeSrc);
      if (!baseLayout) return;

      const rect = frame.getBoundingClientRect();
      const pointX = event.clientX - (rect.left + rect.width / 2);
      const pointY = event.clientY - (rect.top + rect.height / 2);
      const delta = -event.deltaY * WHEEL_ZOOM_SENSITIVITY;

      applyViewUpdate((prev) =>
        zoomViewTowardPoint(prev, baseLayout, pointX, pointY, prev.zoom + delta)
      );
    };

    frame.addEventListener('wheel', handleWheel, { passive: false });

    return () => frame.removeEventListener('wheel', handleWheel);
  }, [activeSrc, applyViewUpdate, getBaseLayout, isOpen, isTransitioning]);

  const getPinchPoints = useCallback(() => {
    return Array.from(activePointersRef.current.values());
  }, []);

  const handlePointerDown = useCallback(
    (event) => {
      if (isTransitioning || !activeSrc) return;
      if (event.button !== 0 && event.pointerType === 'mouse') return;

      const baseLayout = getBaseLayout(activeSrc);
      if (!baseLayout) return;

      gestureMovedRef.current = false;

      activePointersRef.current.set(event.pointerId, {
        x: event.clientX,
        y: event.clientY,
      });

      if (activePointersRef.current.size === 2) {
        const [first, second] = getPinchPoints();
        dragRef.current.active = false;
        dragRef.current.pointerId = null;
        dragRef.current.moved = false;
        setIsPanning(false);

        pinchRef.current = {
          active: true,
          startDistance: getPointerDistance(first, second),
          startZoom: viewStateRef.current.zoom,
        };
        setIsPinching(true);
        gestureMovedRef.current = true;
        return;
      }

      if (activePointersRef.current.size > 2) return;

      const bounds = getBounds(baseLayout, viewStateRef.current.zoom);
      if (
        bounds.maxPanX === 0 &&
        bounds.maxPanY === 0 &&
        viewStateRef.current.zoom <= IMAGE_MIN_ZOOM
      ) {
        return;
      }

      dragRef.current = {
        active: true,
        pointerId: event.pointerId,
        lastX: event.clientX,
        lastY: event.clientY,
        moved: false,
      };

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [activeSrc, getBaseLayout, getPinchPoints, isTransitioning]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!activeSrc) return;

      if (activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        });
      }

      if (pinchRef.current.active && activePointersRef.current.size >= 2) {
        event.preventDefault();
        gestureMovedRef.current = true;

        const [first, second] = getPinchPoints();
        const distance = getPointerDistance(first, second);
        if (pinchRef.current.startDistance <= 0) return;

        const baseLayout = getBaseLayout(activeSrc);
        if (!baseLayout) return;

        const nextZoom =
          pinchRef.current.startZoom * (distance / pinchRef.current.startDistance);

        applyViewUpdate((prev) => ({
          ...prev,
          zoom: clampZoom(nextZoom),
        }));

        return;
      }

      const drag = dragRef.current;
      if (!drag.active || drag.pointerId !== event.pointerId) return;

      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;

      if (!drag.moved) {
        if (Math.hypot(dx, dy) < PAN_DRAG_THRESHOLD_PX) return;
        drag.moved = true;
        gestureMovedRef.current = true;
        setIsPanning(true);
      }

      event.preventDefault();

      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      applyViewUpdate((prev) => ({
        ...prev,
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    },
    [activeSrc, applyViewUpdate, getBaseLayout, getPinchPoints]
  );

  const handlePointerEnd = useCallback((event) => {
    activePointersRef.current.delete(event.pointerId);

    if (pinchRef.current.active && activePointersRef.current.size < 2) {
      pinchRef.current.active = false;
      setIsPinching(false);
    }

    const drag = dragRef.current;
    if (drag.active && drag.pointerId === event.pointerId) {
      drag.active = false;
      drag.pointerId = null;
      drag.moved = false;
      setIsPanning(false);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }
  }, []);

  return {
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
    frameViewHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
    },
  };
}
