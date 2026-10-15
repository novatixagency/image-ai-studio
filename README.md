# Image AI Studio by Novatix

**Remove backgrounds. Free. Forever.**

🔗 **Live:** https://bg.novatix.agency

A free AI background remover — like remove.bg, but 100% free with no signup, no limits, and no watermarks. Upload a photo, the AI removes the background in seconds, download a transparent PNG.

## ✨ Features

- **🤖 Free AI background removal** — powered by `@imgly/background-removal`, running entirely in your browser
- **🔒 100% private** — your photos never leave your device; no uploads to any server
- **♾️ Unlimited** — remove as many backgrounds as you want, no quotas
- **🚫 No signup, no watermarks** — just upload and download
- **🖼️ HD output** — transparent PNG downloads at full quality
- **📱 Works everywhere** — drag & drop, click to upload, or paste from clipboard; mobile-friendly

## 🛠️ Tech

- `index.html` + `styles.css` + `app.js` (ES module)
- AI via `@imgly/background-removal@1.5.5` loaded from jsDelivr CDN (`+esm` bundle)
- Model downloads once (~40MB, cached), inference runs locally via onnxruntime
- 100% client-side — no backend, deployable to any static host

## 🚀 Deploy

```bash
# Static files — no build step needed
cp index.html styles.css app.js sitemap.xml robots.txt favicon.png logo.png /var/www/html/
```

Note: the page needs `script-src` access to `cdn.jsdelivr.net` and `connect-src` to `cdn.jsdelivr.net` + `staticimgly.com` (model CDN), plus `worker-src: blob:` / `img-src: blob: data:` for the onnxruntime workers.

## 📄 License

© 2026 Novatix Agency. All rights reserved.
