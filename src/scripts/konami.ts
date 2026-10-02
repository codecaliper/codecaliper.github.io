import { isTyping, prefersReducedMotion, toast } from './util';

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const COLORS = ['#5ef2d4', '#818cf8', '#f472b6', '#facc15', '#ffffff'];

export function celebrate() {
  toast('🎮 +30 lives unlocked. Now go subscribe!');

  const logo = document.querySelector<HTMLElement>('.logo');
  if (logo) {
    logo.classList.remove('spin');
    void logo.offsetWidth;
    logo.classList.add('spin');
  }

  if (!prefersReducedMotion()) confetti();
}

function confetti() {
  const canvas = document.getElementById('confetti');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = (canvas.width = window.innerWidth);
  const height = (canvas.height = window.innerHeight);
  const pieces = Array.from({ length: 160 }, () => ({
    x: width / 2,
    y: height / 3,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -12 - 4,
    size: Math.random() * 6 + 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 0.3,
  }));
  const start = performance.now();

  const frame = (now: number) => {
    ctx.clearRect(0, 0, width, height);
    for (const p of pieces) {
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.angle += p.spin;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    if (now - start < 3500) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, width, height);
  };
  requestAnimationFrame(frame);
}

export function initKonami() {
  let position = 0;
  document.addEventListener('keydown', (event) => {
    if (isTyping(event.target)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    position = key === CODE[position] ? position + 1 : key === CODE[0] ? 1 : 0;
    if (position === CODE.length) {
      position = 0;
      celebrate();
    }
  });

  // Touch devices have no arrow keys: tapping the logo five times quickly does the same.
  let taps = 0;
  let tapTimer: number | undefined;
  document.querySelector('.logo')?.addEventListener('click', () => {
    taps++;
    clearTimeout(tapTimer);
    tapTimer = window.setTimeout(() => (taps = 0), 800);
    if (taps === 5) {
      taps = 0;
      celebrate();
    }
  });
}
