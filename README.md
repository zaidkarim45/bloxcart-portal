# bloxcart-portal

Checkout prototype + post-purchase order delivery portal + internal
delivery dashboard. Companion app to the `bloxcartz` Shopify theme — see
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for why this is a separate
project, the stack, the order state machine, and current build status.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional -- the app runs fully in demo mode without it
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `/checkout` is the
current prototype; the root page links to what's built so far.

## Scripts

- `npm run dev` — dev server
- `npm run build` — production build (also runs the TypeScript check)
- `npm run lint` — ESLint
