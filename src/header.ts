import { links } from './links';

export const mountHeader = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'afterbegin',
    `
    <header class="site-header">
      <a href="#" class="site-header-logo">
        <img src="/logo_white.png" alt="À Table — By Angelo" />
      </a>
      <button class="menu-bars site-header-toggle" type="button" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="site-drawer">
        <span class="bar bar--top" aria-hidden="true"></span>
        <span class="bar bar--middle" aria-hidden="true"></span>
        <span class="bar bar--bottom" aria-hidden="true"></span>
      </button>
    </header>

    <div class="drawer-overlay"></div>
    <div class="drawer-clip">
      <div class="drawer" id="site-drawer" role="dialog" aria-label="Menu" inert>
        <nav class="drawer-inner">
          <ul class="drawer-links">
            ${links.map(({ href, label }, i) => `<li style="--i: ${i}"><a href="${href}">${label}</a></li>`).join('')}
          </ul>
        </nav>
        <div class="drawer-handle" aria-hidden="true"></div>
      </div>
    </div>
  `,
  );

  const header = root.querySelector<HTMLElement>('.site-header')!;
  const toggle = root.querySelector<HTMLButtonElement>('.site-header-toggle')!;
  const drawer = root.querySelector<HTMLElement>('.drawer')!;
  const overlay = root.querySelector<HTMLElement>('.drawer-overlay')!;

  const isOpen = () => document.body.classList.contains('drawer-open');

  const alignDrawer = () => {
    const { bottom, left, width } = header.getBoundingClientRect();
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--header-bottom', `${bottom}px`);
    rootStyle.setProperty('--header-left', `${left}px`);
    rootStyle.setProperty('--header-width', `${width}px`);
  };

  const setOpen = (open: boolean) => {
    if (open) alignDrawer();
    document.body.classList.toggle('drawer-open', open);
    drawer.inert = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (open) {
      drawer.querySelector<HTMLElement>('.drawer-links a')?.focus({ preventScroll: true });
    } else {
      toggle.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => setOpen(!isOpen()));
  overlay.addEventListener('click', () => setOpen(false));
  drawer.querySelectorAll('.drawer-links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (isOpen()) alignDrawer();
  });
};
