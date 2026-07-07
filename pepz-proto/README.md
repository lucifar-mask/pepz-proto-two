# PEPZ Prototype

Self-contained, single-page prototype of the PEPZ peptide-clinic website, built pixel-precise from the client's Figma file. No build step or framework — plain HTML/CSS/JS (plus three.js from a CDN for the molecule/particle scenes).

## Running it

Just open `index.html` in a browser. For the best experience (video autoplay/CORS behave more predictably), serve it locally instead of double-clicking the file:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Structure

- `index.html` — the entire site (markup, styles, and scripts).
- `assets/` — product photos, hero images, and the "How It Works" explainer video, referenced by `index.html` via relative paths.

## Notes

- `assets/how-it-works.mp4` is a compressed re-encode of the original client-provided video (re-encoded with ffmpeg, H.264/CRF 26) so it stays well under GitHub's 100MB file limit while keeping the same resolution and near-identical visual quality.
- This is a front-end prototype only — forms (Contact, Book Consultation, quiz) simulate success states client-side and don't hit a real backend.
