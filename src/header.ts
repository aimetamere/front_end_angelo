import { lang, switchLang, tr } from './i18n';
import { getLinks, renderLink } from './links';

/**
 * FR/EN switch in the header bar. French is the left/off side, English the right/on side.
 * Activating it goes through switchLang (stores the choice and reloads into the other language).
 */
const renderLangToggle = () => `
  <button class="lang-toggle" type="button" role="switch" aria-checked="${lang() === 'en'}" aria-label="${tr('Langue : français', 'Language: English')}">
    <span class="lang-toggle-track" aria-hidden="true">
      <span class="lang-toggle-thumb"></span>
      <span class="lang-toggle-label lang-toggle-label--fr">FR</span>
      <span class="lang-toggle-label lang-toggle-label--en">EN</span>
    </span>
  </button>
`;

export const mountHeader = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'afterbegin',
    `
    <header class="site-header">
      <a href="${getLinks()[0].href}" class="site-header-logo">
        <img src="/logo_white.png" alt="À Table — By Angelo" />
      </a>
      ${renderLangToggle()}
      <button class="menu-bars site-header-toggle" type="button" aria-label="${tr('Ouvrir le menu', 'Open the menu')}" aria-expanded="false" aria-controls="site-drawer">
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
            ${getLinks()
              .map((link, i) => `<li style="--i: ${i}">${renderLink(link)}</li>`)
              .join('')}
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
    toggle.setAttribute(
      'aria-label',
      open ? tr('Fermer le menu', 'Close the menu') : tr('Ouvrir le menu', 'Open the menu'),
    );
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

  // The link to the page you are on stays put.
  drawer.querySelectorAll<HTMLAnchorElement>('a[aria-current="page"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  root.querySelector<HTMLButtonElement>('.lang-toggle')!.addEventListener('click', () => {
    switchLang(lang() === 'en' ? 'fr' : 'en');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (isOpen()) alignDrawer();
  });
};
