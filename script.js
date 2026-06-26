// ── Orb Canvas (Infinite Craft style, potato-PC friendly) ──────────
(function () {
  const canvas = document.getElementById('orbs');
  const ctx = canvas.getContext('2d');

  let W, H, orbs = [], connections = [];
  const ORB_COUNT = 28;         // low count = low CPU
  const CONNECT_DIST = 180;     // max distance to draw a line
  const SPEED = 0.25;           // slow drift

  const COLORS = [
    'rgba(79, 195, 247,',       // cyan
    'rgba(124, 109, 250,',      // violet
    'rgba(100, 180, 255,',      // blue
  ];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Orb {
    constructor() { this.reset(true); }

    reset(init) {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 3 + 1.5;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = (Math.random() - 0.5) * SPEED;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.alpha = Math.random() * 0.5 + 0.3;
      // Pulse
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      // Bounce off edges
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
      // Pulse alpha
      this.currentAlpha = this.alpha + Math.sin(t * this.pulseSpeed + this.pulsePhase) * 0.15;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.currentAlpha + ')';
      ctx.fill();
    }
  }

  function init() {
    resize();
    orbs = [];
    for (let i = 0; i < ORB_COUNT; i++) orbs.push(new Orb());
  }

  let t = 0;
  let lastFrame = 0;
  const TARGET_FPS = 40; // cap at 40fps to save CPU
  const FRAME_MIN = 1000 / TARGET_FPS;

  function animate(now) {
    requestAnimationFrame(animate);
    if (now - lastFrame < FRAME_MIN) return;
    lastFrame = now;
    t++;

    ctx.clearRect(0, 0, W, H);

    // Draw connections first
    for (let i = 0; i < orbs.length; i++) {
      for (let j = i + 1; j < orbs.length; j++) {
        const dx = orbs[i].x - orbs[j].x;
        const dy = orbs[i].y - orbs[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const opacity = (1 - dist / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(orbs[i].x, orbs[i].y);
          ctx.lineTo(orbs[j].x, orbs[j].y);
          ctx.strokeStyle = `rgba(79, 195, 247, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw orbs
    for (const orb of orbs) {
      orb.update(t);
      orb.draw();
    }
  }

  window.addEventListener('resize', () => {
    resize();
    // Re-clamp orbs inside new bounds
    for (const orb of orbs) {
      orb.x = Math.min(orb.x, W);
      orb.y = Math.min(orb.y, H);
    }
  });

  init();
  requestAnimationFrame(animate);
})();


// ── Scroll fade-in ─────────────────────────────────────────────────
(function () {
  const els = document.querySelectorAll('.fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.fade-in');
        let delay = 0;
        siblings.forEach((s, idx) => { if (s === entry.target) delay = idx * 80; });
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();


// ── Nav scroll style ───────────────────────────────────────────────
(function () {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(6,9,18,0.97)'
      : 'rgba(6,9,18,0.8)';
  }, { passive: true });
})();


// ── Smooth anchor scroll ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
