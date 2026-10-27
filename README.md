# 🖼️ Picture Collage Maker

A high-performance, web-based infinite canvas collage and photo montage application built with React, Konva, TypeScript, and Tailwind CSS. Create complex visual boards, photo collages, and print-ready compositions with precision layering and instant high-res export.

### 🌐 Try Online: [https://milospavlovic7.github.io/picture-collage-app/](https://milospavlovic7.github.io/picture-collage-app/)

---

## ✨ Key Features

- **Infinite Konva Canvas**: Pan smoothly and zoom into fine details with multi-touch and mouse-wheel support.
- **Layer & Transform Controls**: Move, resize with proportional aspect locking, rotate, and re-order z-index layers.
- **Bulk Image Import**: Drag and drop batches of photos or upload from device storage.
- **Multiple Export Formats**:
  - Export ultra-high-resolution PNG images.
  - Export print-ready PDFs with standard A4 document formatting.
- **Zero-Cloud Privacy**: Client-side canvas processing ensures all photos remain private in your browser.
- **Standalone Offline Bundle**: Compiles into a self-contained single-file HTML app (`dist/index.html`).

---

## 🎮 Controls & Shortcuts

- **Pan Canvas**: Hold `Space + Click & Drag` or `Middle Click`
- **Zoom**: Mouse Wheel (`Scroll Up` / `Scroll Down`)
- **Select Image**: Click on any photo to show transform bounding box and properties
- **Transform**: Drag corner handles to scale; use the rotation handle to spin
- **Layer Arrangement**: Use the sidebar/properties panel to bring forward or send backward

---

## 🚀 Quick Start

### Option 1: Use Online (No installation required)
Launch directly in your browser:  
👉 **[https://milospavlovic7.github.io/picture-collage-app/](https://milospavlovic7.github.io/picture-collage-app/)**

### Option 2: Run Standalone Offline
Open `dist/index.html` directly in any web browser without needing a web server.

### Option 3: Local Development
```bash
# Clone the repository
git clone https://github.com/milospavlovic7/picture-collage-app.git
cd picture-collage-app

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 4: Production Build
```bash
npm run build
```
Creates a single-file bundle at `dist/index.html`.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Canvas Engine**: [Konva](https://konvajs.org/) / `react-konva`
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Bundler**: [Vite](https://vitejs.dev/) + [`vite-plugin-singlefile`](https://github.com/richardtallent/vite-plugin-singlefile)

---

## 📜 License

MIT License. Free for personal and educational use.
