export type Lang = 'fr' | 'en';

const STORAGE_KEY = 'atable-lang';
let current: Lang = 'fr';

export const lang = () => current;

export const setLang = (next: Lang) => {
  current = next;
  document.documentElement.lang = next;
};

/** The visitor's earlier choice, if any. Storage can be blocked (private mode): then ask again. */
export const storedLang = (): Lang | null => {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'fr' || value === 'en' ? value : null;
  } catch {
    return null;
  }
};

export const storeLang = (value: Lang) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Not remembered; the page still renders in the chosen language this time.
  }
};

/** Pick the copy for the current language. Call at render time, not at module load. */
export const tr = <T>(fr: T, en: T): T => (current === 'en' ? en : fr);

/** Switch language from the menu or footer: remember it and rebuild the page. */
export const switchLang = (next: Lang) => {
  storeLang(next);
  window.location.reload();
};
