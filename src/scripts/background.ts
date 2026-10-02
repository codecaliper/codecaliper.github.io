type Particle = { x: number; y: number; vx: number; vy: number };

const LINK_DISTANCE = 130;
const POINTER_RADIUS = 120;

export function initBackground(reduced: boolean) {
  const canvas = document.getElementById('bg');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let particles: Particle[] = [];
  let frame = 0;
  let rgb = readAccent();
  const pointer = { x: -1e4, y: -1e4 };

  function readAccent() {
    return getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '94 242 212';
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.min(70, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
    if (reduced) draw();
  }

  function step(p: Particle) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const distance = Math.hypot(dx, dy);
    if (distance > 0 && distance < POINTER_RADIUS) {
      p.x += (dx / distance) * 1.2;
      p.y += (dy / distance) * 1.2;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = `rgb(${rgb} / 0.55)`;
    for (const p of particles) {
      if (!reduced) step(p);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < LINK_DISTANCE) {
          ctx.strokeStyle = `rgb(${rgb} / ${(1 - distance / LINK_DISTANCE) * 0.2})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    draw();
    frame = requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  document.documentElement.addEventListener('pointerleave', () => {
    pointer.x = -1e4;
    pointer.y = -1e4;
  });
  document.addEventListener('themechange', () => {
    rgb = readAccent();
    if (reduced) draw();
  });
  document.addEventListener('visibilitychange', () => {
    if (reduced) return;
    cancelAnimationFrame(frame);
    if (!document.hidden) loop();
  });

  resize();
  if (!reduced) loop();
}
