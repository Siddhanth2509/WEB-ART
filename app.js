document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. CHARACTER SPLIT ───────────────────────────────────────────────────────
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


  // ─── 5. THREE.JS PREMIUM 3D HERO ─────────────────────────────────────────────
  /**
   * Initializes the Three.js WebGL scene for the Hero Section.
   * Renders a premium, interactive Torus Knot mesh with metallic PBR shading,
   * multiple animated point lights, dual-spin wireframe overlays, a floating
   * particle halo, smooth mouse tracking (cinematic lag), drag inertia physics,
   * and scroll-triggered perspective transformations (scale down and camera drift).
   */
  (function initScene() {
    if (typeof THREE === 'undefined') return;

    const canvas  = document.getElementById('hero-canvas');
    if (!canvas) return;
    const wrapper = canvas.parentElement;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping      = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    function resize() {
      const w = wrapper.clientWidth  || 560;
      const h = wrapper.clientHeight || 560;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Lights ────────────────────────────────────────────────────────────────
    // Soft base fill — very dark warm tone
    scene.add(new THREE.AmbientLight(0x120800, 3));

    // PRIMARY: Neon orange — signature brand light (front, moving)
    const orangeLight = new THREE.PointLight(0xff4c00, 12, 25);
    orangeLight.position.set(3, 2, 5);
    scene.add(orangeLight);

    // SECONDARY: Electric cyan — creates contrast & depth (back-left)
    const cyanLight = new THREE.PointLight(0x00e5ff, 7, 20);
    cyanLight.position.set(-4, -1, -3);
    scene.add(cyanLight);

    // ACCENT: Amber warm fill (bottom right)
    const amberLight = new THREE.PointLight(0xff8c00, 5, 18);
    amberLight.position.set(2, -3, 2);
    scene.add(amberLight);

    // RIM: Deep teal edge light (top)
    const rimLight = new THREE.PointLight(0x00ffc8, 4, 15);
    rimLight.position.set(-2, 5, -2);
    scene.add(rimLight);

    // ── Main Mesh: TorusKnot ──────────────────────────────────────────────────
    const knotGeo = new THREE.TorusKnotGeometry(1.5, 0.45, 220, 36, 3, 5);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color:              new THREE.Color(0x0d0500),  // near-black dark orange base
      metalness:          1.0,
      roughness:          0.04,
      clearcoat:          1.0,
      clearcoatRoughness: 0.03,
      reflectivity:       1.0,
      emissive:           new THREE.Color(0xff3800),
      emissiveIntensity:  0.07,
      envMapIntensity:    2.0,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);

    // ── Outer Wireframe Shell (orange glow lines) ─────────────────────────────
    const wireGeo = new THREE.TorusKnotGeometry(1.54, 0.47, 90, 18, 3, 5);
    const wireMat = new THREE.MeshBasicMaterial({
      color:       0xff5500,
      wireframe:   true,
      transparent: true,
      opacity:     0.10,
    });
    const wireKnot = new THREE.Mesh(wireGeo, wireMat);

    // ── Inner Cyan Wireframe (creates depth layering) ─────────────────────────
    const innerGeo = new THREE.TorusKnotGeometry(1.44, 0.42, 70, 14, 3, 5);
    const innerMat = new THREE.MeshBasicMaterial({
      color:       0x00e5ff,
      wireframe:   true,
      transparent: true,
      opacity:     0.05,
    });
    const innerWire = new THREE.Mesh(innerGeo, innerMat);

    // ── Group them ────────────────────────────────────────────────────────────
    const group = new THREE.Group();
    group.add(knot);
    group.add(wireKnot);
    group.add(innerWire);
    group.rotation.x = 0.35;
    scene.add(group);

    // ── Floating Particle Halo ────────────────────────────────────────────────
    const pCount = 800;
    const pPos   = new Float32Array(pCount * 3);
    const pCol   = new Float32Array(pCount * 3); // per-vertex colors

    for (let i = 0; i < pCount; i++) {
      // Distribute in a sphere shell around the knot
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const rad   = 2.5 + Math.random() * 3.5;

      pPos[i * 3]     = rad * Math.sin(phi) * Math.cos(theta);
      pPos[i * 3 + 1] = rad * Math.sin(phi) * Math.sin(theta);
      pPos[i * 3 + 2] = rad * Math.cos(phi);

      // 70% orange, 30% cyan for the brand palette
      if (Math.random() > 0.3) {
        pCol[i * 3] = 1.0; pCol[i * 3 + 1] = 0.28; pCol[i * 3 + 2] = 0.0; // orange
      } else {
        pCol[i * 3] = 0.0; pCol[i * 3 + 1] = 0.9;  pCol[i * 3 + 2] = 1.0; // cyan
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));

    const pMat = new THREE.PointsMaterial({
      size:            0.022,
      transparent:     true,
      opacity:         0.6,
      sizeAttenuation: true,
      vertexColors:    true,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Mouse & drag state ────────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let smoothX = 0, smoothY = 0;
    let dragVX = 0, dragVY = 0;
    let isDragging = false, prevMX = 0, prevMY = 0;
    let scrollProgress = 0;

    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    canvas.addEventListener('mousedown', e => {
      isDragging = true; prevMX = e.clientX; prevMY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragVX += (e.clientY - prevMY) * 0.008;
      dragVY += (e.clientX - prevMX) * 0.008;
      prevMX = e.clientX; prevMY = e.clientY;
    });
    canvas.style.cursor = 'grab';

    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero-section');
      if (hero) scrollProgress = Math.min(window.scrollY / hero.offsetHeight, 1);
    });

    // ── Render loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();

    /**
     * Continuous WebGL animation render loop executed on requestAnimationFrame.
     * Computes smooth interpolation (lerping) for mouse offsets, decays drag momentum,
     * updates primary and wireframe rotations, maps scroll percentage to transform scales,
     * and cycles light positions.
     */
    function animate() {
      requestAnimationFrame(animate);
      const t  = clock.getElapsedTime();
      const sp = scrollProgress;

      // Smooth mouse follow (lag for cinematic feel)
      smoothX += (mouseX * 0.35 - smoothX) * 0.035;
      smoothY += (mouseY * 0.25 - smoothY) * 0.035;

      // Drag inertia decay
      if (!isDragging) { dragVX *= 0.92; dragVY *= 0.92; }

      // ── Rotation: auto + mouse tilt + drag ──────────────────────────────────
      group.rotation.y  = t * 0.30 + smoothX + dragVY;
      group.rotation.x  = 0.35 + smoothY + dragVX;

      // Counter-rotate inner wire for dual-spin effect
      wireKnot.rotation.y  = -t * 0.14;
      wireKnot.rotation.z  =  t * 0.09;
      innerWire.rotation.x =  t * 0.11;
      innerWire.rotation.z = -t * 0.07;

      // ── Scroll: scale + drift ────────────────────────────────────────────────
      const targetScale = 1.0 - sp * 0.5;
      group.scale.setScalar(targetScale);
      group.position.x  = sp * -2.2;
      group.position.z  = sp * -1.5;

      // ── Camera subtle breathing drift ────────────────────────────────────────
      camera.position.x = Math.sin(t * 0.18) * 0.25;
      camera.position.y = Math.cos(t * 0.14) * 0.15;
      camera.lookAt(group.position);

      // ── Lights: orbit + pulse ────────────────────────────────────────────────
      // Orange key light orbits front
      orangeLight.position.x = Math.cos(t * 0.45) * 5;
      orangeLight.position.z = Math.sin(t * 0.45) * 4 + 2;
      orangeLight.intensity  = 12 + Math.sin(t * 1.8)  * 3;

      // Cyan light orbits back-left, opposite phase
      cyanLight.position.x   = Math.cos(t * 0.45 + Math.PI) * 5;
      cyanLight.position.z   = Math.sin(t * 0.45 + Math.PI) * 4 - 2;
      cyanLight.intensity    = 7  + Math.sin(t * 1.3 + 1) * 2;

      // Amber warm fill drifts slowly below
      amberLight.position.x  = Math.sin(t * 0.28) * 3;
      amberLight.position.y  = -2.5 + Math.cos(t * 0.35) * 1;
      amberLight.intensity   = 5  + Math.sin(t * 2.1 + 2) * 1.5;

      // Rim teal top
      rimLight.position.x    = Math.sin(t * 0.22 + 1) * 3;
      rimLight.intensity     = 4  + Math.cos(t * 1.6 + 3) * 1.2;

      // ── Emissive pulse (knot glows brighter on beat) ──────────────────────────
      knotMat.emissiveIntensity = 0.07 + Math.sin(t * 2.2) * 0.05;

      renderer.render(scene, camera);
    }
    animate();
  })();


  // ─── 6. GSAP SCROLL ANIMATIONS ───────────────────────────────────────────────
  function initGSAP() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
    tl.from('.navbar',         { y: -30, opacity: 0 })
      .from('.hero-badge',     { scale: 0.85, opacity: 0, ease: 'back.out(2)' }, '-=0.5')
      .to  ('.hero-title .char-anim', { y: '0%', stagger: 0.02, ease: 'power4.out' }, '-=0.4')
      .from('.hero-description',{ y: 20, opacity: 0 }, '-=0.6')
      .from('.hero-cta-group', { y: 20, opacity: 0 }, '-=0.55')
      .from('.hero-stats-row .stat-box', { y: 30, opacity: 0, stagger: 0.15 }, '-=0.5')
      .from('.hero-visual',    { opacity: 0, scale: 0.9, ease: 'power2.out', duration: 1.3 }, '-=1.0')
      .from('.floating-tech-card', { scale: 0.7, opacity: 0, stagger: 0.2, ease: 'back.out(1.5)' }, '-=0.7');

    const reveal = (targets, trigger, extra = {}) => gsap.from(targets, {
      scrollTrigger: { trigger, start: 'top 83%', toggleActions: 'play none none none' },
      y: 35, opacity: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out', ...extra
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
    .from('.footer-cta-content h2', { y: 30, opacity: 0, duration: 0.8 })
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
