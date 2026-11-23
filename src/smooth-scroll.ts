import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * One root Lenis instance for the whole document. Skipped under prefers-reduced-motion,
 * where native scrolling (and native anchor jumps) stay in place.
 */
export const initSmoothScroll = (): Lenis | null => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({ lerp: 0.1 });

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // The drawer scrolls on its own, and the page behind it stays put while it is open.
  document.querySelector('.drawer')?.setAttribute('data-lenis-prevent', '');
  new MutationObserver(() => {
    if (document.body.classList.contains('drawer-open')) lenis.stop();
    else lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // In-page links go through Lenis instead of jumping past it.
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href')!;
    const target = hash === '#' ? 0 : document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target === null) return;
    event.preventDefault();

    // Drawer links close the drawer first (header.ts). Restart now: start() resets Lenis,
    // so restarting after scrollTo would cancel the scroll.
    lenis.start();
    // Lenis applies the target's scroll-margin-top itself (sticky header clearance).
    lenis.scrollTo(target);
    history.pushState(null, '', hash === '#' ? location.pathname + location.search : hash);
  });

  return lenis;
};
