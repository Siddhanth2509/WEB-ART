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


  // ─── 5. THREE.JS PREMIUM 3D HERO ─────────────────────────────────────────────
  (function initThreeJS() {
    if (typeof THREE === 'undefined') return;

    const canvas  = document.getElementById('hero-canvas');
    const wrapper = canvas.parentElement;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Scene & Camera
    const scene  = new THREE.Scene();
    scene.fog    = new THREE.FogExp2(0x000000, 0.035);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Resize
    function resize() {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Lighting ──────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x1a0800, 1.5));  // very dark orange ambient

    // Key light — bright neon orange
    const keyLight = new THREE.PointLight(0xff4c00, 8, 22);
    keyLight.position.set(4, 3, 5);
    scene.add(keyLight);

    // Fill light — amber/golden orange
    const fillLight = new THREE.PointLight(0xff8800, 4, 18);
    fillLight.position.set(-4, -2, 3);
    scene.add(fillLight);

    // Rim light — deep orange-red
    const rimLight = new THREE.PointLight(0xff2200, 5, 15);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // ── Main 3D Object: Torus Knot (complex, premium-looking) ─────────────────
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.5, 200, 32, 3, 5);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color:              0x1a0800,        // very dark burnt orange base
      metalness:          1.0,
      roughness:          0.08,
      envMapIntensity:    1.5,
      clearcoat:          1.0,
      clearcoatRoughness: 0.05,
      reflectivity:       1.0,
      emissive:           new THREE.Color(0xff4c00),
      emissiveIntensity:  0.12,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);

    // Wireframe shell (outer)
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xff4c00,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    });
    const wireKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(1.62, 0.52, 80, 16, 3, 5),
      wireMat
    );

    // Group them together
    const group = new THREE.Group();
    group.add(knot);
    group.add(wireKnot);
    group.rotation.x = 0.4;
    scene.add(group);

    // ── Floating Particle Dust (subtle, not main feature) ────────────────────
    const particleCount = 600;
    const pPositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      pPositions[i] = (Math.random() - 0.5) * 14;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xff6600,
      size: 0.018,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    // ── Mouse Interaction ─────────────────────────────────────────────────────
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── Drag Rotation ─────────────────────────────────────────────────────────
    let isDragging = false;
    let prevMX = 0, prevMY = 0;
    let dragVX = 0, dragVY = 0;

    canvas.addEventListener('mousedown', e => {
      isDragging = true;
      prevMX = e.clientX;
      prevMY = e.clientY;
      canvas.style.cursor = 'grabbing';
    });
    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });
    canvas.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragVX += (e.clientY - prevMY) * 0.01;
      dragVY += (e.clientX - prevMX) * 0.01;
      prevMX = e.clientX;
      prevMY = e.clientY;
    });
    canvas.style.cursor = 'grab';

    // ── Scroll-linked movement (GSAP) ─────────────────────────────────────────
    let scrollProgress = 0;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        onUpdate: self => { scrollProgress = self.progress; }
      });
    } else {
      document.addEventListener('scroll', () => {
        const heroH = document.querySelector('.hero-section').offsetHeight;
        scrollProgress = Math.min(window.scrollY / heroH, 1);
      });
    }

    // ── Animation Loop ────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // Smooth mouse tilt
      targetRotX += (mouseY * 0.3 - targetRotX) * 0.04;
      targetRotY += (mouseX * 0.5 - targetRotY) * 0.04;

      // Drag inertia
      if (!isDragging) {
        dragVX *= 0.93;
        dragVY *= 0.93;
      }

      // Apply all rotations
      group.rotation.x = 0.4 + targetRotX + dragVX;
      group.rotation.y = t * 0.25 + targetRotY + dragVY;

      // Wireframe rotates opposite (cool dual-spin effect)
      wireKnot.rotation.y = -t * 0.12;
      wireKnot.rotation.z =  t * 0.08;

      // Scroll: scale down and drift to background
      const sp = scrollProgress;
      group.scale.setScalar(1.0 - sp * 0.45);
      group.position.x = sp * -1.5;
      group.position.z = sp * -2;

      // Pulsing lights — all in orange spectrum
      keyLight.intensity  = 8  + Math.sin(t * 1.2) * 2.0;
      fillLight.intensity = 4  + Math.sin(t * 0.9 + 1) * 1.2;
      rimLight.intensity  = 5  + Math.sin(t * 0.7 + 2) * 1.5;

      // Orbit lights around knot
      keyLight.position.x = Math.cos(t * 0.4) * 5;
      keyLight.position.z = Math.sin(t * 0.4) * 4 + 2;
      rimLight.position.x = Math.sin(t * 0.3) * 3;
      rimLight.position.y = Math.cos(t * 0.5) * 4;

      renderer.render(scene, camera);
    }
    animate();
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

    // Footer CTA
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
