import { SITE_URL, toast } from './util';

export async function share() {
  const data = {
    title: 'CodeCaliper',
    text: 'Homelab builds, self-hosted apps, tips & tricks.',
    url: SITE_URL,
  };

  if (navigator.share) {
    try {
      await navigator.share(data);
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
    }
  }

  try {
    await navigator.clipboard.writeText(SITE_URL);
    toast('Link copied to clipboard');
  } catch {
    toast(SITE_URL);
  }
}

export function initShareButton() {
  document.getElementById('share')?.addEventListener('click', () => void share());
}
