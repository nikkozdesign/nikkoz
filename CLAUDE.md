@AGENTS.md

# Nikkoz V2 — project context

Marketing/portfolio site. Pages Router, SCSS modules, framer-motion + GSAP, Lenis smooth scroll, Three.js shader background.

## Stack

- Next.js 16.2.5 (Pages Router, `pages/`)
- React 19.2.4
- SCSS via `sass` — `next.config.mjs` injects `@use "functions" as *;` into every module; `styles/` is on the load path
- `framer-motion` 12 for page/route transitions and springs
- `gsap` + `@gsap/react` for timeline animations
- `lenis` for smooth scroll
- `three` 0.184 for shader background
- ESLint flat config (`eslint.config.mjs`)
- Path alias `@/*` → repo root (see `jsconfig.json`)

## Layout

```
pages/
  _app.js          # provider stack + AnimatePresence route transitions
  _document.js     # default Html/Head/Main/NextScript
  index.js         # Home — currently two 100vh sections (placeholder)
components/
  ShaderBackground.jsx    # Three.js fullscreen shader, palette-driven
  GridLight.jsx           # static SVG grid overlay
  Header/                 # fixed NIKKOZ logo, scroll-driven scale via --header-progress
  TransitionLink.jsx      # <a> that calls TransitionContext.start() then router.push()
  TransitionOverlay.jsx   # AnimatePresence host, looks up effect in REGISTRY
  transitions/
    ShaderMorph.jsx       # framer-motion rect → fullscreen morph effect
  sections/Hero/          # exists, not yet wired into index.js
context/
  LenisContext.jsx        # creates Lenis instance, drives RAF, exposes via useLenis()
  ScrollContext.jsx       # tracks viewport section bg, exposes currentSectionColor
  ShaderPaletteContext.jsx# PALETTES array + nextPalette() cycler
  TransitionContext.jsx   # { transition, start(kind, payload), complete() }
styles/
  globals.scss            # box-sizing reset only
  _functions.scss         # vw($px, $base: 1920) — design-width → vw scaling
```

## Provider stack (`pages/_app.js`)

`LenisProvider` → `TransitionProvider` → `ScrollProvider` → `ShaderPaletteProvider` → `<ShaderBackground/>` `<GridLight/>` `<Header/>` `<AnimatedRoutes/>` `<TransitionOverlay/>`

`AnimatedRoutes` skips its own opacity fade when a custom transition is active (`transition !== null`) so overlay effects own the visual.

## Transition system

- Trigger: `<TransitionLink href transition={{ kind, payload }}>` — sets transition state, then `router.push`.
- `TransitionOverlay` renders the matching component from `REGISTRY` (currently `shaderMorph: ShaderMorph`); calls `complete()` via `onDone`.
- Add a new effect: drop component in `components/transitions/`, register it in `TransitionOverlay.jsx`'s `REGISTRY`.

## Header scroll behavior

`Header` subscribes to `lenis.on("scroll")` only on `/`. Maps `scroll / window.innerHeight` (clamped 0..1) into a framer-motion `useSpring`, writes value to CSS var `--header-progress` on `<html>`. SCSS reads `var(--header-progress)` to translate + scale the logo.

## SCSS conventions

- Use `vw($px)` from `_functions.scss` for sizing tied to 1920px design width — DO NOT manually compute vw values.
- `_functions.scss` is auto-injected; do not `@use` it explicitly in modules.
- Component styles colocated as `*.module.scss` next to component.

## Known gotchas

- Next.js 16 — read `node_modules/next/dist/docs/` before assuming behavior; APIs shifted from training data (see AGENTS.md).
- `ScrollContext` queries `.section` elements — sections need that class to participate in light/dark color tracking.
- `ShaderBackground` uses `"use client"` directive but project is Pages Router; harmless but not required.
- `Hero` section exists at `components/sections/Hero/` but is not imported by `pages/index.js` yet.
