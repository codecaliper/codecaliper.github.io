export const SITE_URL = 'https://codecaliper.uk';

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

let toastTimer: number | undefined;

export function toast(message: string) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('show'), 2600);
}
