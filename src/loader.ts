import type { Lang } from './i18n';

// Deliberately unhurried: the mark stays a little longer than loading needs, for a calm start.
const MIN_VISIBLE_MS = 2600;
// Once everything is ready, a short breath before the page rises.
const SETTLE_MS = 400;
// Safety cap only: a stalled request must never keep the visitor on the loader.
const MAX_WAIT_MS = 15000;
const REVEAL_MS = 600;

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const lockClasses = (on: boolean) => {
  document.documentElement.classList.toggle('is-loading', on);
  document.body.classList.toggle('is-loading', on);
};

export const mountLoader = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="page-loader">
      <div class="loader" role="status" aria-live="polite" aria-label="Chargement de la page">
        <span class="box1"></span>
        <span class="box2"></span>
        <span class="box3"></span>
      </div>
      <div class="lang-prompt" role="dialog" aria-modal="true" aria-labelledby="lang-prompt-title" hidden>
        <p class="lang-prompt-title" id="lang-prompt-title" lang="fr">Choisissez votre langue</p>
        <p class="lang-prompt-sub" lang="en">Choose your language</p>
        <div class="lang-prompt-options">
          <button type="button" data-lang="fr" lang="fr">Français</button>
          <button type="button" data-lang="en" lang="en">English</button>
        </div>
      </div>
    </div>
  `,
  );
  lockClasses(true);
  // A reload starts at the top of the story, not wherever the locked page was left.
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
};

/**
 * First question on a first visit: French (default, focused) or English. Shown in the olive
 * overlay before the page is built, so the page is then built once, in that language.
 */
export const askLanguage = (root: HTMLElement) =>
  new Promise<Lang>((resolve) => {
    const overlay = root.querySelector<HTMLElement>('.page-loader')!;
    const prompt = overlay.querySelector<HTMLElement>('.lang-prompt')!;
    overlay.classList.add('is-asking');
    prompt.hidden = false;
    prompt.querySelector<HTMLButtonElement>('[data-lang="fr"]')!.focus();

    prompt.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach((button) => {
      button.addEventListener('click', () => {
        prompt.hidden = true;
        overlay.classList.remove('is-asking');
        resolve(button.dataset.lang === 'en' ? 'en' : 'fr');
      });
    });
  });

/** Loader label in the page language, once it is known. */
export const labelLoader = (root: HTMLElement, label: string) => {
  root.querySelector('.page-loader .loader')?.setAttribute('aria-label', label);
};

// Resolves when the image is decoded, or failed: a broken image must never keep the page locked.
const imageReady = (img: HTMLImageElement) => {
  if (typeof img.decode === 'function') return img.decode().catch(() => undefined);
  return new Promise<void>((resolve) => {
    if (img.complete) return resolve();
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
};

const fontsReady = async () => {
  if (!('fonts' in document)) return;
  await Promise.all([
    document.fonts.load('700 1em "Cormorant Garamond"'),
    document.fonts.load('400 1em Jost'),
  ]).catch(() => undefined);
  await document.fonts.ready;
};

/**
 * Holds the loader until the page is fully loaded: fonts and every image on the page decoded
 * (and at least 2.6s has passed, plus a 0.4s settle, for a calm start). Never longer than 15s. Then fades the
 * overlay out and the page in.
 */
export const runGate = async (root: HTMLElement, beforeReveal?: () => void) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = root.querySelector<HTMLElement>('.page-loader');

  const tasks = [fontsReady(), ...[...root.querySelectorAll<HTMLImageElement>('img')].map(imageReady)];

  const ready = Promise.all([...tasks, reducedMotion ? undefined : wait(MIN_VISIBLE_MS)]).then(() =>
    reducedMotion ? undefined : wait(SETTLE_MS),
  );
  await Promise.race([ready, wait(MAX_WAIT_MS)]);

  // While still hidden: e.g. land on /#contact without a visible jump.
  beforeReveal?.();

  const html = document.documentElement;
  if (!reducedMotion) html.classList.add('is-revealing');
  lockClasses(false);

  if (!overlay) return;
  if (reducedMotion) {
    overlay.remove();
    return;
  }

  overlay.classList.add('is-ready');
  const remove = () => overlay.remove();
  overlay.addEventListener('transitionend', remove, { once: true });
  window.setTimeout(remove, REVEAL_MS + 200);
  window.setTimeout(() => html.classList.remove('is-revealing'), REVEAL_MS + 100);
};
