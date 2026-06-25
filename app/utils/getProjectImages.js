import fs from 'fs';
import path from 'path';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);

export { getProjectLightboxMode } from './projectLightboxMode';

export function getProjectImages(slug) {
  if (!slug) return [];

  const dir = path.join(process.cwd(), 'public', 'projects', slug);

  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => `/projects/${slug}/${encodeURIComponent(file)}`);
}
