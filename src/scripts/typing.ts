const phrases = [
  'Homelab setups.',
  'Self-hosted apps & services.',
  'Kubernetes & Proxmox.',
  'Tips & tricks.',
];

export function initTyping(reduced: boolean) {
  const el = document.getElementById('typed');
  if (!el) return;

  if (reduced) {
    el.textContent = phrases[0];
    return;
  }

  let phrase = 0;
  let length = 0;
  let deleting = false;

  const tick = () => {
    const word = phrases[phrase];
    length += deleting ? -1 : 1;
    el.textContent = word.slice(0, length);

    let delay = deleting ? 35 : 75;
    if (!deleting && length === word.length) {
      deleting = true;
      delay = 1700;
    } else if (deleting && length === 0) {
      deleting = false;
      phrase = (phrase + 1) % phrases.length;
      delay = 350;
    }
    window.setTimeout(tick, delay);
  };

  tick();
}
