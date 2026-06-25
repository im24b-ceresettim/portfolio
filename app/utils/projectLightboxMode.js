export function getProjectLightboxMode(imageCount) {
  if (imageCount <= 0) return 'standard';
  if (imageCount === 1) return 'onepicture';
  return 'multipicture';
}
