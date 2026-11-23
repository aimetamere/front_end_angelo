type Theme = 'olive' | 'cream' | 'sage' | 'blue' | 'white' | 'dark';

// Innermost match wins, so a band inside a section can override it.
const themes: [selector: string, theme: Theme][] = [
  ['.panel--intro', 'cream'],
  ['.panel--olive', 'olive'],
  ['.panel--cream', 'cream'],
  ['.marquee', 'cream'],
  ['.chapter-split', 'sage'],
  ['.chapter-stack', 'blue'],
  ['.gallery', 'cream'],
  ['.chapter-closing', 'olive'],
  ['.contact', 'white'],
  ['.site-footer', 'olive'],
];

const themeOf = (start: Element | null): Theme | null => {
  for (let node = start; node; node = node.parentElement) {
    const match = themes.find(([selector]) => node!.matches(selector));
    if (match) return match[1];
  }
  return null;
};

/**
 * Desktop only: the header takes the colour of whatever section is painted under it.
 * Sticky panels overlap, so this asks the browser what is actually on top at that point.
 */
export const mountHeaderTheme = (root: HTMLElement) => {
  const header = root.querySelector<HTMLElement>('.site-header');
  if (!header) return;
  const desktop = window.matchMedia('(min-width: 768px)');
  let queued = false;

  const update = () => {
    queued = false;
    if (!desktop.matches) {
      delete header.dataset.theme;
      return;
    }
    const { top, bottom } = header.getBoundingClientRect();
    const x = window.innerWidth / 2;
    const y = (top + bottom) / 2;
    const under = document
      .elementsFromPoint(x, y)
      .find((el) => !header.contains(el) && !el.closest('.drawer-clip, .drawer-overlay, .page-loader'));
    // Nothing themed under the bar (team page, page ground): the ground is cream.
    const theme = themeOf(under ?? null) ?? 'cream';
    if (header.dataset.theme !== theme) header.dataset.theme = theme;
  };

  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  desktop.addEventListener('change', queue);
  update();
};
