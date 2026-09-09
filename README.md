# Portfolio — Matteo Ceresetti

Personal portfolio site built with Next.js. A single-page layout with light/dark themes, an animated 3D universe background, and a project showcase carousel.

**[Live Demo](https://portfolio-indol-nine-14.vercel.app/)**

## Highlights

- **One-page layout** — Home, Projects, About Me, and Contact in a scroll-driven flow
- **Light & dark themes** — Toggle with smooth transitions; dark mode reveals a Three.js starfield with Saturn
- **Project showcase** — Carousel with image lightbox, focus overlay, and links to live demos and repos
- **Responsive navigation** — Section-aware nav highlighting, mobile menu, and keyboard-friendly overlays
- **Data-driven content** — Profile, skills, languages, and projects live in one config file

## Tech Stack

| Layer | Tools |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/) |
| 3D | [Three.js](https://threejs.org/) |
| Deploy | [Vercel](https://vercel.com/) |

## Getting Started

**Requirements:** Node.js 18+ and npm

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Serve production build locally |
| `npm run lint` | Run ESLint |

Before deploying, run a quick sanity check:

```bash
npm run lint
npm run build
```

## Project Structure

```
app/
├── components/          # UI components (carousel, lightbox, 3D background, …)
├── hooks/               # Shared React hooks
├── utils/               # Helpers (project images, scroll lock, …)
├── portfolioData.js     # Profile, skills, languages, and project list
├── layout.js            # Shell, theme toggle, navigation
├── page.js              # Page sections
└── globals.css          # Global styles and theme tokens

public/
├── projects/<slug>/     # Screenshots per project (auto-discovered)
├── textures/            # Optional high-res universe textures (dark mode)
└── myimage.jpeg         # Profile photo
```

## Customize Content

Most visible content is edited in **`app/portfolioData.js`**:

- Name, role, headline, and about text
- Contact details (phone, email, GitHub)
- Languages and tech skills
- Project titles, descriptions, stack, and links

### Add or update projects

1. Add an entry to the `projects` array in `portfolioData.js`.
2. Create a matching folder under `public/projects/<slug>/`.
3. Drop screenshots there (`.png`, `.jpg`, `.jpeg`, `.webp`, or `.gif`).

Images are picked up automatically and shown in the project carousel.

### Profile photo

Replace `public/myimage.jpeg` or update `profileImage` in `portfolioData.js`.

## Universe Background (Dark Mode)

For sharper Saturn and starfield visuals, add textures to `public/textures/`:

| File | Purpose |
| --- | --- |
| `saturn_albedo_16k.jpg` (or `_8k`) | Saturn surface color |
| `saturn_bump_8k.jpg` (or `saturn_normal_8k.jpg`) | Surface detail |
| `saturn_ring_color_8k.png` | Ring color map |
| `saturn_ring_alpha_8k.png` | Ring transparency |
| `stars_16k.jpg` (or `_8k`) | Starfield background |

The scene tries the highest-resolution names first, then falls back to lower-quality or procedurally generated textures.

**Suggested sources:** [Solar System Scope](https://www.solarsystemscope.com/textures/), [NASA / USGS](https://www.usgs.gov/), [Poly Haven](https://polyhaven.com/)

Always verify the license of each texture before publishing.

## Deployment

The site is configured for Vercel. Push to your connected Git repository and Vercel builds automatically, or run:

```bash
npm run build
```

## Author

**Matteo Ceresetti** — Informatiker EFZ Applikationsentwicklung (Lehrstart August 2027)

- GitHub: [@im24b-ceresettim](https://github.com/im24b-ceresettim)
- Email: mat.cerelappo@gmail.com
