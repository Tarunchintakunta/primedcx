# PRIME DCX — official site rebuild

Full marketing site for **Prime DCX Ltd** (primedcx.com) — a premium forex & crypto
trading platform — built around a cinematic scroll-scrubbed 3D flythrough.

## Pages

| Page | What it is |
|---|---|
| `index.html` | Cinematic scroll landing: the film IS the scroll — street → rising → skyline → orbit → globe, with the altimeter HUD and real brand copy/stats |
| `markets.html` | Live-style pricing table (real instrument list), asset classes, trading conditions |
| `accounts.html` | ECN / PRO / PRIME with the full real spec tables, onboarding steps |
| `platform.html` | Web Trader (webtrader.primedcx.com), TradingView features, API trading |
| `company.html` | Vision, values, legal identity, contact |
| `blog/` | "Insights" — 6 original research-desk articles with AI-generated covers |
| `legal/` | Terms, Privacy, Risk Disclosure, AML/KYC — faithful to the live site's documents |

All CTAs route to the real client portal (`client.primedcx.com` sign-up / sign-in).
Brand: the real PRIME | DCX lockup (white / divider / gold), gold as the primary accent,
green/red reserved for market data. Logo assets from the office repo in `assets/brand/`.

## Run it

```bash
python3 -m http.server 4173 --directory .
# open http://localhost:4173
```

## The film

5 × 8s clips, Seedance 2.0 **std mode, 1080p**, generated on Higgsfield with one hero
image as the world reference for every clip and each clip's final frame chained as the
next clip's start image — one seamless 40s flythrough. Rebuild frames after changing
clips with:

```bash
./build_frames.sh   # concat → assets/film.mp4 → 1920×1080 frames → js/manifest.js
```

Job IDs and regeneration details live in the project memory (`primedcx-film-pipeline`).
