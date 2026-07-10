# PRIME DCX — cinematic scroll-film site

A scroll-scrubbed 3D flythrough for PRIME DCX, a next-gen CFD trading platform.
Scrolling down **is** the camera ascent: street level inside a neon candlestick
metropolis → rising past ticker-veined towers → bursting above the skyline →
orbiting a glowing market-Earth → the full globe with a beating golden core.

## Run it

```bash
python3 -m http.server 4173 --directory .
# open http://localhost:4173
```

(Any static server works — frames are plain JPEGs.)

## How it's built

- **Film**: 5 × 5s clips generated with **Seedance 2.0** (Bytedance) on Higgsfield,
  fast mode, 720p, 16:9, silent. One hero image (`assets/stills/hero.png`) was
  generated first and passed as `image_references` to every clip so the world stays
  identical; each clip's final frame (ffmpeg `-sseof`) was uploaded as the
  `start_image` of the next, so the five clips join into one continuous shot.
  Concatenated master: `assets/film.mp4` (25.2s).
- **Scrub**: the film is exploded to `assets/frames/f_0001.jpg … f_0303.jpg`
  (12 fps, 1280×720) and drawn to a fixed `<canvas>`; scroll progress lerps the
  frame index. Coarse frames (every 5th) load first behind the candle preloader,
  the rest stream in the background.
- **Scroll**: Lenis smooth scroll (vendored), 640vh scroll track, five equal zones.
- **HUD**: right-edge altimeter — zone labels (STREET / RISING / SKYLINE / ORBIT /
  GLOBE) with a scramble tick, candlestick progress bar, and live readouts
  (altitude, spread compressing to 0.00, instrument counter).
- **Zones**: hero (“Trade Without Limits”) → stat count-ups (0.0 pips, <18ms,
  99.99%) → multi-asset cards with drifting quotes → 24/5 sessions → Start Trading
  CTA under the beating-core finale, followed by the CFD risk-warning footer.
- **Type**: Unbounded (display) · Archivo (body) · IBM Plex Mono (data), self-hosted.
- Reduced motion: film and smoothing disabled, panels stack statically.

## Regenerating / upscaling the film

Clip job IDs, chaining method, and budget notes live in the project memory
(`primedcx-film-pipeline`). Clips were rendered in fast/720p to fit a 120-credit
budget; `upscale_video` on Higgsfield can lift them to 2K/4K later — then re-run:

```bash
ffmpeg -i clips/clip1_street.mp4 -i clips/clip2_rising.mp4 -i clips/clip3_skyline.mp4 \
       -i clips/clip4_orbit.mp4 -i clips/clip5_globe.mp4 \
       -filter_complex "[0:v][1:v][2:v][3:v][4:v]concat=n=5:v=1[v]" -map "[v]" \
       -c:v libx264 -crf 18 -pix_fmt yuv420p assets/film.mp4
ffmpeg -i assets/film.mp4 -vf "fps=12,scale=1280:720" -q:v 3 assets/frames/f_%04d.jpg
# then set count in js/manifest.js to the number of frames
```
