document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. CHARACTER SPLIT FOR GSAP LETTER REVEALS ─────────────────────────────
  function splitChars(el) {
    if (!el) return;
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(word => {
          if (!word.trim()) { el.appendChild(document.createTextNode(word)); return; }
          const ws = document.createElement('span');
          ws.style.cssText = 'display:inline-block;white-space:nowrap;overflow:hidden;vertical-align:bottom';
          word.split('').forEach(char => {
            const cs = document.createElement('span');
            cs.className = 'char-anim';
            cs.style.cssText = 'display:inline-block;transform:translateY(110%)';
            cs.textContent = char;
            ws.appendChild(cs);
          });
          el.appendChild(ws);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        splitChars(node);
        clone.innerHTML = node.innerHTML;
        el.appendChild(clone);
      }
    });
  }
  splitChars(document.querySelector('.hero-title'));

  // ─── 2. CURSOR GLOW ──────────────────────────────────────────────────────────
  const cg = document.getElementById('cursor-glow');
  if (cg) {
    document.addEventListener('mousemove', e => {
      cg.style.opacity = '1';
      cg.style.left = e.clientX + 'px';
      cg.style.top  = e.clientY + 'px';
    });
    document.addEventListener('mouseleave', () => cg.style.opacity = '0');
  }

  // ─── 3. BENTO CARD HOVER GLOW ────────────────────────────────────────────────
  document.querySelectorAll('.card-glow-wrapper').forEach(card => {
    const glow = card.querySelector('.card-glow-bg');
    if (!glow) return;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      glow.style.left = (e.clientX - r.left) + 'px';
      glow.style.top  = (e.clientY - r.top)  + 'px';
    });
  });

  // ─── 4. WORKFLOW TABS ─────────────────────────────────────────────────────────
  document.querySelectorAll('.process-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.dataset.step;
      document.querySelectorAll('.process-step-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.step-pane').forEach(p => {
        p.classList.toggle('active', p.id === `pane-${step}`);
      });
    });
  });


  // ─── 5. PROCEDURAL 3D TORUS — PURE 2D CANVAS ─────────────────────────────────
  (function initProceduralTorus() {
    const canvas  = document.getElementById('hero-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wrapper = canvas.parentElement;

    // Set internal resolution
    function resizeCanvas() {
      canvas.width  = wrapper.clientWidth  || 560;
      canvas.height = wrapper.clientHeight || 560;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ── Build torus point cloud ───────────────────────────────────────────────
    const R = 160;          // Major radius (distance from center to tube center)
    const r = 60;           // Minor radius (tube thickness)
    const pSeg = 120;       // Segments around the big ring
    const qSeg = 60;        // Segments around the tube
    const torusPoints = [];

    for (let i = 0; i < pSeg; i++) {
      for (let j = 0; j < qSeg; j++) {
        const u = (i / pSeg) * Math.PI * 2;
        const v = (j / qSeg) * Math.PI * 2;
        torusPoints.push({
          x: (R + r * Math.cos(v)) * Math.cos(u),
          y: (R + r * Math.cos(v)) * Math.sin(u),
          z: r * Math.sin(v),
          u: i,
          v: j,
        });
      }
    }

    // ── Mouse & scroll state ──────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    let scrollProgress = 0;

    document.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
      const heroEl  = document.querySelector('.hero-section');
      if (!heroEl) return;
      const heroH   = heroEl.offsetHeight;
      scrollProgress = Math.min(Math.max(window.scrollY / heroH, 0), 1);
    });

    // ── 3D Rotation helpers ───────────────────────────────────────────────────
    function rotateX(p, cos, sin) {
      return { x: p.x, y: p.y * cos - p.z * sin, z: p.y * sin + p.z * cos };
    }
    function rotateY(p, cos, sin) {
      return { x: p.x * cos + p.z * sin, y: p.y, z: -p.x * sin + p.z * cos };
    }

    // ── Render one frame ──────────────────────────────────────────────────────
    function render(time) {
      const W = canvas.width;
      const H = canvas.height;
      const CX = W / 2;
      const CY = H / 2;

      // Smooth mouse follow
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      const t  = time * 0.001;
      const sp = scrollProgress;

      // Rotation angles: auto-spin + mouse tilt + scroll-driven full rotation
      const angleX = sp * Math.PI * 2.0 + t * 0.18 + targetY * 0.6;
      const angleY = sp * Math.PI * 1.3 + t * 0.25 + targetX * 0.6;
      const angleZ = t * 0.06;

      const cX = Math.cos(angleX), sX = Math.sin(angleX);
      const cY = Math.cos(angleY), sY = Math.sin(angleY);
      const cZ = Math.cos(angleZ), sZ = Math.sin(angleZ);

      // Scale: breath effect + scroll shrink
      const baseScale = Math.min(W, H) / 620;
      const scaleBreath = 1 + Math.sin(t * 1.4) * 0.025;
      const scaleScroll = 1 - sp * 0.45;
      const scale       = baseScale * scaleBreath * scaleScroll;

      // Perspective
      const focal = 500;

      // Scroll drift: shift left as user scrolls down
      const driftX = sp * -W * 0.22;
      const driftY = sp * -H * 0.06;

      // Project all points
      const projected = torusPoints.map(p => {
        let q = { x: p.x * scale, y: p.y * scale, z: p.z * scale };
        q = rotateX(q, cX, sX);
        q = rotateY(q, cY, sY);
        // RotateZ
        const nx = q.x * cZ - q.y * sZ;
        const ny = q.x * sZ + q.y * cZ;
        q.x = nx; q.y = ny;

        const s = focal / (focal + q.z);
        return {
          sx: CX + q.x * s + driftX,
          sy: CY + q.y * s + driftY,
          depth: q.z,
          s,
          u: p.u,
          v: p.v,
        };
      });

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Draw lines along toroidal rings (u-direction)
      for (let i = 0; i < pSeg; i++) {
        for (let j = 0; j < qSeg; j++) {
          const curr = projected[i * qSeg + j];
          const nextJ = projected[i * qSeg + (j + 1) % qSeg];
          const nextI = projected[((i + 1) % pSeg) * qSeg + j];

          // Depth-based colour: brighter when closer
          const d = (curr.depth + r + R) / (2 * (r + R));  // 0..1
          const a = Math.max(0.05, d * 0.95);

          // Inner ring: orange → amber
          const red   = Math.round(255);
          const green = Math.round(60 + d * 100);
          const blue  = 0;

          ctx.strokeStyle = `rgba(${red},${green},${blue},${a})`;
          ctx.lineWidth   = curr.depth > 0 ? 1.2 : 0.6;

          // Tube circles
          ctx.beginPath();
          ctx.moveTo(curr.sx, curr.sy);
          ctx.lineTo(nextJ.sx, nextJ.sy);
          ctx.stroke();

          // Ring connects
          ctx.globalAlpha = a * 0.55;
          ctx.beginPath();
          ctx.moveTo(curr.sx, curr.sy);
          ctx.lineTo(nextI.sx, nextI.sy);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }

      // Glowing core dot
      const cx = CX + driftX;
      const cy = CY + driftY;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * scale);
      grad.addColorStop(0,   `rgba(255,100,0,${0.18 + Math.sin(t * 2) * 0.06})`);
      grad.addColorStop(0.5, `rgba(255,60,0,0.06)`);
      grad.addColorStop(1,   'rgba(255,60,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 60 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Animation loop ────────────────────────────────────────────────────────
    function loop(time) {
      render(time);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();


  // ─── 6. GSAP SCROLL ANIMATIONS ───────────────────────────────────────────────
  function initGSAP() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
    tl.from('.navbar',         { y: -30, opacity: 0 })
      .from('.hero-badge',     { scale: 0.85, opacity: 0, ease: 'back.out(2)' }, '-=0.5')
      .to  ('.hero-title .char-anim', { y: '0%', stagger: 0.02, ease: 'power4.out' }, '-=0.4')
      .from('.hero-description',{ y: 20, opacity: 0 }, '-=0.6')
      .from('.hero-cta-group', { y: 20, opacity: 0 }, '-=0.55')
      .from('.hero-stats-row .stat-box', { y: 30, opacity: 0, stagger: 0.15 }, '-=0.5')
      .from('.hero-visual',    { opacity: 0, scale: 0.92, ease: 'power2.out', duration: 1.2 }, '-=1.0')
      .from('.floating-tech-card', { scale: 0.7, opacity: 0, stagger: 0.2, ease: 'back.out(1.5)' }, '-=0.7');

    // Section reveals
    const reveal = (targets, trigger, extra = {}) => gsap.from(targets, {
      scrollTrigger: { trigger, start: 'top 83%', toggleActions: 'play none none none' },
      y: 35, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out',
      ...extra
    });

    reveal('.services-section .section-header > *', '.services-section');
    reveal('.bento-card', '.bento-grid', { y: 50, stagger: 0.1 });
    reveal('.process-section .section-header > *', '.process-section');
    reveal('.testimonial-card', '.testimonials-section', { scale: 0.95, y: 0 });

    gsap.from('.process-nav', {
      scrollTrigger: { trigger: '.process-interactive', start: 'top 85%', toggleActions: 'play none none none' },
      x: -40, opacity: 0, duration: 0.8, ease: 'power3.out'
    });
    gsap.from('.process-content-display', {
      scrollTrigger: { trigger: '.process-interactive', start: 'top 85%', toggleActions: 'play none none none' },
      x: 40, opacity: 0, duration: 0.8, ease: 'power3.out'
    });

    gsap.timeline({
      scrollTrigger: { trigger: '.footer-cta-section', start: 'top 78%', toggleActions: 'play none none none' }
    })
    .from('.footer-cta-content h2', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
    .from('.footer-cta-content .btn', { scale: 0.9, opacity: 0, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.4');
  }
  initGSAP();

  // ─── 7. MOBILE MENU ──────────────────────────────────────────────────────────
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav    = document.querySelector('.nav-menu');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const isOpen = nav.style.display === 'flex';
      nav.style.display = isOpen ? 'none' : 'flex';
      if (!isOpen) Object.assign(nav.style, {
        flexDirection: 'column', position: 'absolute',
        top: 'var(--nav-height)', left: '5%', width: '90%', padding: '20px'
      });
    });
  }

});
