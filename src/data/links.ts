export type Link = {
  label: string;
  href: string;
  handle: string;
  icon: 'youtube' | 'tiktok' | 'instagram' | 'github';
};

export const links: Link[] = [
  { label: 'YouTube', href: 'https://www.youtube.com/@codecaliper', handle: '@codecaliper', icon: 'youtube' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@codecaliper', handle: '@codecaliper', icon: 'tiktok' },
  { label: 'Instagram', href: 'https://www.instagram.com/codecaliper', handle: '@codecaliper', icon: 'instagram' },
  { label: 'GitHub', href: 'https://github.com/codecaliper', handle: 'codecaliper', icon: 'github' },
];
