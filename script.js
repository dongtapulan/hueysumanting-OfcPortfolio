(function () {
  const btns = document.querySelectorAll('#theme-toggle');

  function setLightMode(isLight, persist = true) {
    const body = document.body;
    if (isLight) {
      body.classList.add('light-mode');
    } else {
      body.classList.remove('light-mode');
    }

    // update all buttons
    btns.forEach(btn => {
      btn.classList.toggle('toggled', isLight);
      btn.setAttribute('aria-pressed', String(isLight));
      const icon = btn.querySelector('.icon');
      const label = btn.querySelector('.label');
      if (isLight) {
        if (icon) icon.textContent = '🌙';
        if (label) label.textContent = 'Dark Mode';
      } else {
        if (icon) icon.textContent = '☀️';
        if (label) label.textContent = 'Light Mode';
      }
      btn.animate(
        [{ transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
        { duration: 180, easing: 'ease-out' }
      );
    });

    // Persist preference
    if (persist) localStorage.setItem('huey_theme_light', isLight ? '1' : '0');

    // update canvas star color
    updateCanvasColors();
  }

  document.addEventListener('DOMContentLoaded', () => {
    // attach handler for each toggle button
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const isLight = !document.body.classList.contains('light-mode');
        setLightMode(isLight);
      });
    });

    // restore preference or follow system theme
    const saved = localStorage.getItem('huey_theme_light');
    if (saved !== null) {
      setLightMode(saved === '1', false);
    } else {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      setLightMode(prefersLight, false);
    }
  });

  // === CANVAS STARFIELD ===
  const cnv = document.createElement("canvas");
  document.body.appendChild(cnv);
  const c = cnv.getContext("2d");
  function resizeCanvas() {
    cnv.width = innerWidth;
    cnv.height = innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  cnv.style.position = "fixed";
  cnv.style.top = 0;
  cnv.style.left = 0;
  cnv.style.zIndex = -1;
  cnv.style.pointerEvents = "none";

  const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * cnv.width,
    y: Math.random() * cnv.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    size: Math.random() * 2 + 0.5,
    twinkle: Math.random()
  }));

  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * cnv.width,
    y: Math.random() * cnv.height,
    vy: 0.1 + Math.random() * 0.3,
    size: Math.random() * 1.5,
    opacity: Math.random() * 0.4 + 0.2
  }));

  let mouse = { x: 0, y: 0 };
  document.addEventListener("mousemove", e => (mouse = { x: e.x, y: e.y }));

  let starColor = "255,255,255"; // default white
  let connectColor = "100,150,255"; // bluish line

  function updateCanvasColors() {
    const isLight = document.body.classList.contains('light-mode');
    if (isLight) {
      starColor = "173,216,255"; // light blue
      connectColor = "120,180,255"; // softer blue
      cnv.style.background = "linear-gradient(to bottom, #f5faff, #e8f0ff)";
    } else {
      starColor = "255,255,255"; // white
      connectColor = "100,150,255"; // glowing blue
      cnv.style.background = "transparent";
    }
  }
  // === CONSTELLATIONS + PIXEL PARTICLES UPDATE ===

  // pixel particles (8-bit feel)
  const pixelParticles = Array.from({ length: 80 }, () => ({
    x: Math.random() * cnv.width,
    y: Math.random() * cnv.height,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    size: 2 + Math.floor(Math.random() * 2),
    opacity: 0.4 + Math.random() * 0.4
  }));

  function drawStars() {
    stars.forEach(s => {
      s.x += s.vx;
      s.y += s.vy;

      if (s.x < 0 || s.x > cnv.width) s.vx *= -1;
      if (s.y < 0 || s.y > cnv.height) s.vy *= -1;

      s.twinkle += 0.02;

      c.fillStyle = `rgba(${starColor}, ${0.6 + Math.sin(s.twinkle) * 0.3})`;
      c.beginPath();
      c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      c.fill();
    });
  }

  function drawConstellations() {
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const alpha = 1 - dist / 120;
          c.strokeStyle = `rgba(${connectColor}, ${alpha * 0.35})`;
          c.lineWidth = 0.6;
          c.beginPath();
          c.moveTo(stars[i].x, stars[i].y);
          c.lineTo(stars[j].x, stars[j].y);
          c.stroke();
        }
      }
    }
  }

  function drawPixelParticles() {
    pixelParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = cnv.width;
      if (p.y < 0) p.y = cnv.height;
      if (p.x > cnv.width) p.x = 0;
      if (p.y > cnv.height) p.y = 0;

      c.fillStyle = `rgba(${starColor}, ${p.opacity})`;
      c.fillRect(p.x, p.y, p.size, p.size);
    });
  }

  function animate() {
    c.clearRect(0, 0, cnv.width, cnv.height);

    drawStars();
    drawConstellations();
    drawPixelParticles();

    requestAnimationFrame(animate);
  }

  updateCanvasColors();
  animate();
  
  
})();
