export type Theme = 'light' | 'dark';

const themeColors: Record<Theme, string> = { dark: '#0b0f14', light: '#f6f8fa' };

export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // Storage can be blocked in private browsing; the theme still applies for this visit.
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[theme]);
  document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
}

export function initThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}
