# Portfolio

This project is a Next.js portfolio with a dark-mode Babylon.js background scene.

## Features

- Multi-section one-page portfolio layout
- Theme toggle with light/dark mode
- Dark-mode animated universe background with Saturn and dense starfield
- Section-by-section scroll navigation and active nav highlighting

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build Check

```bash
npm run lint
npm run build
```

## Where To Edit

- Layout and navigation: `app/layout.js`
- Background scene: `app/components/UniverseBackground.jsx`
- Main content sections: `app/page.js`
- Global styles: `app/globals.css`

## High-Quality Texture Setup (Dark Mode Universe)

Place your highest-quality files in `public/textures` using these names:

- `saturn_albedo_16k.jpg` (or `saturn_albedo_8k.jpg`)
- `saturn_bump_8k.jpg` (or `saturn_normal_8k.jpg`)
- `saturn_ring_color_8k.png`
- `saturn_ring_alpha_8k.png`
- `stars_16k.jpg` (or `stars_8k.jpg`)

The scene automatically tries the highest-quality names first and falls back to lower-quality or procedural textures.

Suggested sources:

- Solar System Scope textures
- NASA / USGS planetary data
- Poly Haven (for star backgrounds)

Always verify the license of each downloaded file before publishing.

