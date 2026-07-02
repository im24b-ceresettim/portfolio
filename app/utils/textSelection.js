export function hasNonEmptyTextSelection() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return false;
  return selection.toString().trim().length > 0;
}

export function clearTextSelection() {
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
}
