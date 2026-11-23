import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

/**
 * One root Lenis instance for the whole document. Skipped under prefers-reduced-motion,
 * where native scrolling (and native anchor jumps) stay in place.
 *
 * Only the mouse wheel and trackpad are eased. A finger is left entirely to the browser, on every
 * touch device whatever its width: native one-to-one tracking, native momentum, the iOS
 * rubber-band, and scrolling on the compositor so sticky panels and the Safari toolbar stay
 * smooth. In Lenis 1.3 that is `syncTouch: false`: Lenis then returns before preventDefault on
 * touch events and only follows the native scroll position. (`syncTouch: true` does the
 * opposite: it cancels every touchmove and replaces the browser's momentum with its own.)
 */
export const initSmoothScroll = (): Lenis | null => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
  });

  const raf = (time: number) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  // The drawer scrolls on its own. The page keeps scrolling while the menu is open.
  document.querySelector('.drawer')?.setAttribute('data-lenis-prevent', '');

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

    // Lenis applies the target's scroll-margin-top itself (sticky header clearance).
    lenis.scrollTo(target);
    history.pushState(null, '', hash === '#' ? location.pathname + location.search : hash);
  });

  return lenis;
};
