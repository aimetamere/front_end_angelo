import './style.css';
import { bootPage } from './boot';
import { mountMarquees } from './marquee';
import { lockScreenHeight } from './screen-height';
import { initSmoothScroll } from './smooth-scroll';
import { renderStory, mountStory } from './story';

// Arriving from another page at /#contact: the page is built after load, so the browser's own
// hash jump happened on an empty document. Jump to the target before the reveal instead.
const jumpToHash = () => {
  const id = decodeURIComponent(window.location.hash.slice(1));
  const target = id ? document.getElementById(id) : null;
  if (!target) return;
  // offsetTop ignores the 16px rise-in transform still applied while hidden.
  let top = 0;
  for (let node: HTMLElement | null = target; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  window.scrollTo({ top: top - margin, behavior: 'instant' });
};

const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  bootPage(app, {
    build: (root) => {
      root.insertAdjacentHTML('beforeend', `<main>${renderStory()}</main>`);
      mountStory(root);
    },
    beforeReveal: jumpToHash,
  }).then(() => {
    lockScreenHeight();
    initSmoothScroll();
    mountMarquees(app, 500);
  });
}
