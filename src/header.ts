import { lang, switchLang, tr } from './i18n';
import { getLinks, renderLink } from './links';

/**
 * FR/EN switch, shown in the menu and the footer. French is the left/off side,
 * English the right/on side. Every copy is wired by one delegated listener in mountHeader;
 * activating it goes through switchLang (stores the choice and reloads into the other language).
 */
export const renderLangToggle = () => `
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
          <div class="drawer-lang">${renderLangToggle()}</div>
          <ul class="drawer-links">
            ${getLinks()
              .map((link) => `<li>${renderLink(link)}</li>`)
              .join('')}
          </ul>
        </nav>
      </div>
    </div>
  `,
  );

  const header = root.querySelector<HTMLElement>('.site-header')!;
  const toggle = root.querySelector<HTMLButtonElement>('.site-header-toggle')!;
  const drawer = root.querySelector<HTMLElement>('.drawer')!;
  const overlay = root.querySelector<HTMLElement>('.drawer-overlay')!;

  const isOpen = () => document.body.classList.contains('drawer-open');

  // The menu's top-right corner is the three-line button: it comes out of the button and goes
  // back into it. Measured from the button itself, never from the header bar.
  const alignDrawer = () => {
    const button = toggle.getBoundingClientRect();
    const rootStyle = document.documentElement.style;
    // Fixed boxes are placed against the viewport without the scrollbar: clientWidth.
    const viewportWidth = document.documentElement.clientWidth;
    rootStyle.setProperty('--menu-top', `${button.top + button.height / 2}px`);
    rootStyle.setProperty('--menu-right', `${viewportWidth - button.right}px`);
    rootStyle.setProperty('--menu-button', `${button.width}px`);
    // Room from the button back to just past the logo: the line never slides under the logo.
    const logo = header.querySelector('.site-header-logo')!.getBoundingClientRect();
    rootStyle.setProperty('--menu-room', `${button.right - logo.right - 24}px`);
    // Phones: the line runs just under the bar, on the bar's colour.
    rootStyle.setProperty('--menu-bar-bottom', `${header.getBoundingClientRect().bottom}px`);
    // The menu wears the header's current colours (they follow the section under the header).
    const headerStyle = getComputedStyle(header);
    rootStyle.setProperty('--menu-fg', headerStyle.color);
    rootStyle.setProperty('--menu-bg', headerStyle.getPropertyValue('--header-bg').trim());
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

  // The logo starts larger on the first screen and settles to its normal size once the page
  // scrolls. It is a transform, so the header bar keeps its height and nothing below moves.
  const markTop = () => header.classList.toggle('is-top', window.scrollY < 8);
  markTop();
  window.addEventListener('scroll', markTop, { passive: true });
  overlay.addEventListener('click', () => setOpen(false));
  drawer.querySelectorAll('.drawer-links a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // The link to the page you are on stays put.
  drawer.querySelectorAll<HTMLAnchorElement>('a[aria-current="page"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });

  // Menu and footer switches both land here.
  document.addEventListener('click', (event) => {
    if ((event.target as Element).closest('.lang-toggle')) switchLang(lang() === 'en' ? 'fr' : 'en');
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false);
  });
  window.addEventListener('resize', () => {
    if (isOpen()) alignDrawer();
  });

  // The page scrolls with the menu open: keep the menu on the button and in the colours of the
  // section now under the header (header-theme.ts updates those on the same scroll).
  let realignQueued = false;
  window.addEventListener(
    'scroll',
    () => {
      if (!isOpen() || realignQueued) return;
      realignQueued = true;
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          realignQueued = false;
          if (isOpen()) alignDrawer();
        }),
      );
    },
    { passive: true },
  );
};
