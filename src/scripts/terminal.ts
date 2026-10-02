import { links } from '../data/links';
import { celebrate } from './konami';
import { share } from './share';
import { setTheme, toggleTheme } from './theme';
import { isTyping } from './util';

const PROMPT = 'guest@codecaliper:~$';

type Command = { desc?: string; run: (args: string[]) => void };

export function initTerminal() {
  const root = document.getElementById('terminal');
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-in');
  const toggle = document.getElementById('terminal-toggle');
  const closeButton = document.getElementById('term-close');
  if (!root || !out || !(form instanceof HTMLFormElement) || !(input instanceof HTMLInputElement)) return;

  const history: string[] = [];
  let historyIndex = 0;
  let greeted = false;
  let lastFocus: HTMLElement | null = null;

  const print = (...parts: (string | Node)[]) => {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.append(...parts);
    out.append(line);
    out.scrollTop = out.scrollHeight;
  };

  const anchor = (href: string, text: string) => {
    const a = document.createElement('a');
    a.href = href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = text;
    return a;
  };

  const promptSpan = () => {
    const span = document.createElement('span');
    span.className = 'prompt';
    span.textContent = PROMPT;
    return span;
  };

  const socialNames = links.map((link) => link.icon);

  const commands: Record<string, Command> = {
    help: {
      desc: 'list commands',
      run: () => {
        for (const [name, command] of Object.entries(commands)) {
          if (command.desc) print(`${name.padEnd(9)} ${command.desc}`);
        }
        print(`shortcuts ${socialNames.join(', ')}`);
      },
    },
    whoami: {
      desc: 'about CodeCaliper',
      run: () => print('CodeCaliper: homelab builds, self-hosted apps, Kubernetes & Proxmox, tips & tricks.'),
    },
    socials: {
      desc: 'list social links',
      run: () => links.forEach((link) => print(link.label.padEnd(10), anchor(link.href, link.handle))),
    },
    open: {
      desc: `open <${socialNames.join('|')}>`,
      run: ([name]) => {
        const link = links.find((candidate) => candidate.icon === name?.toLowerCase());
        if (!link) {
          print(`usage: open <${socialNames.join('|')}>`);
          return;
        }
        print(`opening ${link.label}…`);
        window.open(link.href, '_blank', 'noopener,noreferrer');
      },
    },
    share: { desc: 'share this page', run: () => void share() },
    theme: {
      desc: 'theme [light|dark]',
      run: ([theme]) => {
        if (theme === 'light' || theme === 'dark') setTheme(theme);
        else toggleTheme();
        print(`theme: ${document.documentElement.dataset.theme}`);
      },
    },
    date: { desc: 'print the date', run: () => print(new Date().toString()) },
    clear: { desc: 'clear the screen', run: () => out.replaceChildren() },
    exit: { desc: 'close the terminal', run: () => hide() },
    ls: { run: () => print(socialNames.join('  ')) },
    echo: { run: (args) => print(args.join(' ')) },
    history: { run: () => history.forEach((entry, i) => print(`${String(i + 1).padStart(4)}  ${entry}`)) },
    sudo: { run: () => print('guest is not in the sudoers file. This incident will be reported.') },
    rm: { run: () => print('rm: permission denied. Nice try.') },
    konami: { run: () => celebrate() },
  };

  for (const name of socialNames) {
    commands[name] = { run: () => commands.open.run([name]) };
  }

  function run(raw: string) {
    const line = raw.trim();
    print(promptSpan(), ` ${line}`);
    if (!line) return;
    history.push(line);
    historyIndex = history.length;

    const [name, ...args] = line.split(/\s+/);
    const command = commands[name.toLowerCase()];
    if (command) command.run(args);
    else print(`command not found: ${name}. Type 'help'.`);
  }

  function show() {
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root!.hidden = false;
    toggle?.setAttribute('aria-expanded', 'true');
    if (!greeted) {
      greeted = true;
      print("Welcome to CodeCaliper. Type 'help' to get started.");
    }
    input!.focus();
  }

  function hide() {
    root!.hidden = true;
    toggle?.setAttribute('aria-expanded', 'false');
    lastFocus?.focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run(input.value);
    input.value = '';
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (historyIndex > 0) input.value = history[--historyIndex];
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex < history.length) input.value = history[++historyIndex] ?? '';
    } else if (event.key === 'Tab' && !event.shiftKey && input.value.trim()) {
      event.preventDefault();
      const partial = input.value.trim().toLowerCase();
      const matches = Object.keys(commands).filter((name) => name.startsWith(partial));
      if (matches.length === 1) input.value = `${matches[0]} `;
      else if (matches.length > 1) print(matches.join('  '));
    } else if (event.key === 'Escape') {
      hide();
    }
  });

  toggle?.addEventListener('click', () => (root.hidden ? show() : hide()));
  closeButton?.addEventListener('click', hide);
  out.addEventListener('click', (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) input.focus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === '`' && root.hidden && !isTyping(event.target)) {
      event.preventDefault();
      show();
    }
  });
}
