'use client';

import { useCallback, useRef } from 'react';
import { clearTextSelection, hasNonEmptyTextSelection } from '../utils/textSelection';

export const PANEL_TAP_MOVE_THRESHOLD_PX = 6;
export const PANEL_LONG_PRESS_MS = 280;

const EMPTY_GESTURE = {
  pointerId: null,
  startX: 0,
  startY: 0,
  startTime: 0,
  moved: false,
  hadSelectionOnDown: false,
};

export function usePanelPointerTap(onTap) {
  const panelPointerRef = useRef({ ...EMPTY_GESTURE });

  const resetPanelPointer = useCallback(() => {
    panelPointerRef.current = { ...EMPTY_GESTURE };
  }, []);

  const handlePanelPointerDown = useCallback((event) => {
    if (event.button !== 0) return;
    panelPointerRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: Date.now(),
      moved: false,
      hadSelectionOnDown: hasNonEmptyTextSelection(),
    };
  }, []);

  const handlePanelPointerMove = useCallback((event) => {
    const gesture = panelPointerRef.current;
    if (gesture.pointerId !== event.pointerId) return;

    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    if (Math.hypot(dx, dy) >= PANEL_TAP_MOVE_THRESHOLD_PX) {
      gesture.moved = true;
    }
  }, []);

  const handlePanelPointerUp = useCallback(
    (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('a, button')) return;

      const gesture = panelPointerRef.current;
      const isActivePointer = gesture.pointerId === event.pointerId;
      const moved = isActivePointer && gesture.moved;
      const heldMs = isActivePointer ? Date.now() - gesture.startTime : 0;
      const hadSelection =
        gesture.hadSelectionOnDown || hasNonEmptyTextSelection();
      resetPanelPointer();

      event.stopPropagation();
      if (moved || heldMs >= PANEL_LONG_PRESS_MS) return;

      if (hadSelection) {
        clearTextSelection();
        return;
      }

      onTap();
    },
    [onTap, resetPanelPointer]
  );

  const handlePanelPointerCancel = useCallback(() => {
    resetPanelPointer();
  }, [resetPanelPointer]);

  return {
    handlePanelPointerDown,
    handlePanelPointerMove,
    handlePanelPointerUp,
    handlePanelPointerCancel,
    resetPanelPointer,
  };
}
