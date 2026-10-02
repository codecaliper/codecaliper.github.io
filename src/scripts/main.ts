import { initBackground } from './background';
import { initKonami } from './konami';
import { initShareButton } from './share';
import { initTerminal } from './terminal';
import { initThemeToggle } from './theme';
import { initTyping } from './typing';
import { prefersReducedMotion } from './util';

const reduced = prefersReducedMotion();

initThemeToggle();
initShareButton();
initTyping(reduced);
initBackground(reduced);
initTerminal();
initKonami();

for (const card of document.querySelectorAll<HTMLElement>('.link')) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
    card.style.setProperty('--my', `${event.clientY - rect.top}px`);
  });
}
