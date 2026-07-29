# BeanBar Interactive Prototype

Static look-and-feel prototype for the Cuisinart BeanBar grind-and-brew
control panel. React + Vite, no external UI libraries — the panel is a set
of absolutely-positioned elements matched pixel-for-pixel against the
source Figma file.

## Structure

- `src/components/Panel.jsx` — the panel face (icons, labels, dial),
  positioned from coordinates cross-checked against Figma
- `src/components/CoffeeIcons.jsx` — inline SVG icon components (bean, mug,
  glass, cup sizes, kettle gauge, power, dial bezel, Cuisinart logo)
- `src/assets/panel/` — extracted texture/dial imagery + exact path data
- `src/assets/reference/` — source design files for comparison
- `src/App.jsx` / `src/styles.css` — page shell

This is currently a static look-only build — no interaction/state logic.

## Dev

```
npm install
npm run dev
```

## Deploy

Pushing to `master` builds and publishes to GitHub Pages via
`.github/workflows/deploy.yml`.
