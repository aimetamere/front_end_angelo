import { mountFooter } from './footer';
import { mountHeader } from './header';
import { mountHeaderTheme } from './header-theme';
import { setLang, storedLang, storeLang, tr } from './i18n';
import { askLanguage, labelLoader, mountLoader, runGate } from './loader';

interface BootOptions {
  /** Insert the page's <main> into #app (and wire it). Runs once the language is known. */
  build: (app: HTMLElement) => void;
  /** Runs while the page is still hidden, right before the reveal. */
  beforeReveal?: () => void;
}

/**
 * Shared start-up for every page: loader, first-visit language question, page build in that
 * language, header and footer, then the gate (fonts and every image ready) and the reveal.
 */
export const bootPage = async (app: HTMLElement, { build, beforeReveal }: BootOptions) => {
  mountLoader(app);

  // First visit: ask. Returning visitors get the language they chose before.
  let lang = storedLang();
  if (!lang) {
    lang = await askLanguage(app);
    storeLang(lang);
  }
  setLang(lang);
  labelLoader(app, tr('Chargement de la page', 'Loading the page'));

  build(app);
  mountHeader(app);
  mountFooter(app);
  mountHeaderTheme(app);

  // The overlay stays the first child of #app, covering the header too.
  const overlay = app.querySelector('.page-loader');
  if (overlay) app.prepend(overlay);

  await runGate(app, beforeReveal);
};
