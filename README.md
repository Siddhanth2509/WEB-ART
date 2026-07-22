# 🔶 Fluxora Creative Studio Landing Page

A cinematic, interactive, dark-themed creative agency landing page featuring premium UI elements, high-fidelity WebGL 3D graphics, responsive grid structures, and smooth scroll animations.

---

## 🚀 Key Features

*   **Premium WebGL Hero Visual:** Renders an interactive 3D Torus Knot with metallic PBR shading, clearcoat physics, 4 orbiting neon spotlights, and a floating particle halo (built with Three.js).
*   **Tactile 3D Mechanics:** Features smooth drag-to-spin rotation with real physical momentum decay (inertia) and cursor-tilt target tracking.
*   **Scroll-Triggered Reveals:** Synchronized letter-by-letter typographic entrance fades, bento card grid staggers, and parallax scale/drift transformations tied to scroll progression (powered by GSAP & ScrollTrigger).
*   **Modern UI components:** Floating HUD state cards, glassmorphism bento layout blocks, magnetic cursor tracking, and an interactive process workflow step tab engine.

---

## 🛠️ Technology Stack

*   **Structure:** Semantic HTML5
*   **Styles:** Vanilla CSS3 Custom Properties (Design System tokens)
*   **3D Engine:** Three.js (WebGL renderer)
*   **Animation Engine:** GSAP (GreenSock Animation Platform) + ScrollTrigger
*   **Typography:** Google Fonts (Outfit, Syne, Playfair Display)

---

## 💻 Local Setup & Installation

To preview the 3D WebGL scene and interactive states correctly without security sandbox warnings (CORS blocks), the page should be served through a local HTTP server.

You can launch a zero-dependency local server using Node.js:

```bash
# Start the local server
node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'html':'text/html','css':'text/css','js':'application/javascript','jpg':'image/jpeg','png':'image/png','gif':'image/gif','svg':'image/svg+xml','ico':'image/x-icon','webp':'image/webp'};http.createServer((req,res)=>{let file=path.join('./',req.url==='/'?'/index.html':req.url);fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}const ext=path.extname(file).slice(1);res.writeHead(200,{'Content-Type':mime[ext]||'text/plain','Access-Control-Allow-Origin':'*'});res.end(data);});}).listen(5500,()=>console.log('Server running at http://localhost:5500'));"
```

Then open **`http://localhost:5500`** in your browser.

---

## 📂 Project Structure

```
├── index.html       # Landing page structure & metadata
├── style.css        # Responsive dark-theme design system styles
├── app.js           # 3D WebGL animations & user interactions
└── .gitignore       # Exclusions for media assets
```
