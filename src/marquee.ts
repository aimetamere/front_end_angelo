import { tr } from './i18n';

const getPhrases = () => [
  { text: tr('À table, l’idée devient un repas', 'At the table, the idea becomes a meal'), velocity: -3 },
  { text: tr('On vous rappelle pour confirmer', 'We call you back to confirm'), velocity: 3 },
];

export const renderMarquee = (modifier = '') => `
  <section class="marquee ${modifier}" aria-label="À Table — By Angelo">
    ${getPhrases()
      .map(
        ({ text, velocity }) => `
      <div class="marquee-row" data-velocity="${velocity}">
        <span class="sr-only">${text}</span>
        <div class="marquee-track" aria-hidden="true">
          <span class="marquee-item">${text}</span><span class="marquee-item">${text}</span>
        </div>
      </div>
    `,
      )
      .join('')}
  </section>
`;

interface Row {
  track: HTMLElement;
  text: string;
  base: number;
  stride: number;
  x: number;
  active: boolean;
}

// Keep x within [-stride, 0) so the duplicated copies loop without a gap.
const wrap = (x: number, stride: number) => (((x % stride) - stride) % stride);

/**
 * Two rows drift in opposite directions at a base velocity; scroll velocity speeds them up,
 * and scrolling up reverses them (same model as the ScrollBaseAnimation sample).
 */
export const mountMarquees = (root: HTMLElement, startDelay = 500) => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const rows: Row[] = [...root.querySelectorAll<HTMLElement>('.marquee-row')].map((row) => {
    const track = row.querySelector<HTMLElement>('.marquee-track')!;
    return {
      track,
      text: track.querySelector('.marquee-item')!.textContent ?? '',
      base: Number(row.dataset.velocity),
      stride: 0,
      x: 0,
      active: false,
    };
  });

  const fill = (row: Row) => {
    const item = `<span class="marquee-item">${row.text}</span>`;
    row.track.innerHTML = item + item;
    const [a, b] = row.track.children as HTMLCollectionOf<HTMLElement>;
    row.stride = b.offsetLeft - a.offsetLeft || a.offsetWidth || 1;
    // At least 2× the viewport plus one copy of overflow, so the wrap point is never visible.
    const copies = Math.max(2, Math.ceil((2 * window.innerWidth) / row.stride) + 2);
    row.track.innerHTML = item.repeat(copies);
    row.x = wrap(row.x, row.stride);
  };
  rows.forEach(fill);

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => rows.forEach(fill), 200);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      rows
        .filter((row) => entry.target.contains(row.track))
        .forEach((row) => (row.active = entry.isIntersecting));
    });
  });
  root.querySelectorAll('.marquee').forEach((band) => observer.observe(band));

  let last = 0;
  let lastY = window.scrollY;
  let smoothVelocity = 0;
  let direction = 1;
  let targetDirection = 1;

  const tick = (now: number) => {
    const dt = last ? Math.min(now - last, 64) : 16;
    last = now;

    const y = window.scrollY;
    const velocity = ((y - lastY) / dt) * 1000; // px per second
    lastY = y;
    smoothVelocity += (velocity - smoothVelocity) * (1 - Math.exp(-dt / 80));

    // 1000px/s of scroll adds 5× the base speed; sign follows scroll direction.
    const factor = Math.max(-8, Math.min(8, smoothVelocity / 200));
    if (factor < -0.05) targetDirection = -1;
    else if (factor > 0.05) targetDirection = 1;
    // Ease the turn-around instead of snapping, so reversing scroll never jerks the rows.
    direction += (targetDirection - direction) * (1 - Math.exp(-dt / 140));

    rows.forEach((row) => {
      if (!row.active) return;
      // Base velocity is a percentage of a four-copy strip per second, as in the sample.
      let moveBy = direction * row.base * row.stride * 0.04 * (dt / 1000);
      moveBy += moveBy * Math.abs(factor);
      row.x = wrap(row.x + moveBy, row.stride);
      row.track.style.transform = `translate3d(${row.x}px, 0, 0)`;
    });

    requestAnimationFrame(tick);
  };

  window.setTimeout(() => requestAnimationFrame(tick), startDelay);
};
