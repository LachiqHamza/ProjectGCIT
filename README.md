# GCIT — Project Examples

A Next.js + Tailwind architecture portfolio page featuring the original grey-and-white Villa Bellavista model, a real Three.js viewer and room-by-room exploration.

## Run locally

Requires Node.js 20.9 or newer.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000/project-examples. The root URL redirects to this page.

## Languages

Italian is the default language. The IT / EN control in the header switches the entire interface, room descriptions, help, accessibility labels and error messages without restarting the loaded 3D viewer. A first-party `gcit-language` preference cookie remembers the visitor's choice for one year. The server uses that preference for the initial HTML language and metadata. No external translation service is used.

Translations are maintained in `src/lib/i18n.ts`; camera coordinates and room URL fragments remain stable across languages. The existing `/project-examples` route is unchanged.

## Branch workflow

Use `feature/<description>` for features and `bug/<description>` for fixes. Create pull requests into `main`; do not commit feature work directly to `main`. The Italian language change is developed on `feature/add-italian`.

```sh
npm run typecheck
npm run lint
npm run build
npm start
```

## Explore

- Select **Explore in 3D** to load the actual villa. Nothing downloads the GLB before a visitor requests the tour, except direct room links which open the requested room.
- Drag to orbit, scroll/pinch to zoom, right-drag to pan; camera buttons provide keyboard and single-pointer alternatives.
- Choose living room, kitchen, dining room, bedrooms, staircase, garage or pool terrace. Camera presets match the model's actual rooms.
- Ground-floor and first-floor cutaways clip the model to expose the interior from above.
- Floor-plan markers, previous/next buttons, reset, fullscreen, display quality and opt-in auto-rotation are included.
- Room views support links such as `/project-examples#kitchen` and `/project-examples#bedroom`.

## Model and performance

`public/models/villa-bellavista.glb` is the latest white-and-grey villa with embedded PBR textures. Exact asset size and metadata are in `public/models/asset-info.json` (approximately 5.9 MB). The asset has Draco-compressed geometry; decoder files are bundled under `public/draco`, so no decoder CDN is required. The model, imagery and material textures are served locally.

Three.js is dynamically imported after opt-in. The viewer renders on demand, pauses when hidden/offscreen, caps pixel density and uses a single sun shadow map. Clear glass and pool water use transmission. Frame rate varies by device; use Balanced quality on mobile. The render posters were produced with Cycles, while the website uses real-time lighting, so the two are not pixel-identical.

The editable Blender master and original render PNGs remain in the parent GC project folder; they are not needed for deployment. The GLB, WebP posters, decoder files and extracted material samples are committed with the app. `scripts/prepare-assets.mjs` can regenerate these assets if the original villa files are available one directory above this repository; it is not required for `npm ci` or builds.

## Structure

- `src/app/project-examples/page.tsx` — page shell, navigation and footer.
- `src/components/project-explorer.tsx` — room navigation, floor plan, controls and loading/error states.
- `src/components/villa-scene.tsx` — Three.js lifecycle, lighting, compressed model loader, clipping and camera transitions.
- `src/lib/villa.ts` — room copy and camera coordinates (glTF Y-up, metres).
- `src/app/globals.css` — Tailwind setup and responsive visual system.
- `design-system/MASTER.md` — design decisions guided by the requested UI/UX Pro Max skill.

## Deploy

Import this repository into Vercel as a Next.js project, or run `npm run build` and `npm start` on a Node host. Set the optional `NEXT_PUBLIC_SITE_URL` environment variable to the actual deployed origin for correct absolute social-preview URLs. Do not use the sample localhost value in production.

## Backend starter

The backend starter uses TypeScript through Next.js Route Handlers, PostgreSQL, and Drizzle ORM. Copy `.env.example` to `.env.local`, set `DATABASE_URL`, then use:

```sh
npm run db:generate
npm run db:migrate
```

The initial schema includes `contact_messages`. The health endpoint is available at `/api/health`.

See [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) for the longer-term architecture recommendation.

## Browser tests

```sh
npx playwright install chromium
npm run test:e2e
```

The suite covers lazy model loading, room navigation, floor cutaways, controls, mobile overflow, keyboard access, deep links and a simulated model-load error/retry. `PLAYWRIGHT_BROWSER_PATH` can point to an existing Chromium-based test browser; on Windows the config also detects Edge. Tests are local browser checks, not a deployment.

## Asset notices

The villa is an original residential design concept; no real construction status, address or client is represented. The floor plan is illustrative. Three.js is MIT licensed and Draco is Apache-2.0 licensed; see `THIRD_PARTY_NOTICES.md` and `public/draco`.
