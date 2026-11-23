/**
 * Homepage only: one fixed screen height for the full-screen sticky blocks (--screen, in px).
 * It is the large viewport (the screen with Safari's bars hidden), on purpose: a panel's bottom
 * edge then sits behind the bottom bar and is never seen at the very bottom of a phone.
 *
 * iOS resizes the viewport while the Safari toolbar shows and hides. If the panel under the
 * thumb followed that (100dvh), it would grow or shrink mid-gesture and the scroll would
 * stutter. So the height is measured once after the loader lifts and then only when the layout
 * really changes: an orientation change, or a resize that changes the width. A resize that only
 * changes the height is the toolbar, and is ignored. Until this runs, the stylesheet's 100dvh
 * applies.
 */
export const lockScreenHeight = () => {
  const root = document.documentElement;
  let width = window.innerWidth;

  // A probe one large-viewport tall: lvh is the height with the browser bars hidden.
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.append(probe);

  const measure = () => {
    width = window.innerWidth;
    const large = Math.max(probe.offsetHeight, window.innerHeight);
    root.style.setProperty('--screen', `${large}px`);
  };

  measure();

  window.addEventListener('resize', () => {
    if (window.innerWidth !== width) measure();
  });

  // Some browsers fire orientationchange before the new size is applied: measure once the
  // next resize lands, or shortly after if none comes.
  window.addEventListener('orientationchange', () => {
    const once = () => {
      window.clearTimeout(fallback);
      measure();
    };
    const fallback = window.setTimeout(() => {
      window.removeEventListener('resize', once);
      measure();
    }, 400);
    window.addEventListener('resize', once, { once: true });
  });
};
