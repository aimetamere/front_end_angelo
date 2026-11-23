import { tr } from './i18n';
import { renderLangToggle } from './header';
import { getLinks, renderLink } from './links';

export const mountFooter = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'beforeend',
    `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <a href="${getLinks()[0].href}" class="site-footer-logo">
          <img src="/logo_white.png" alt="À Table — By Angelo" />
        </a>
        <nav aria-label="${tr('Liens du pied de page', 'Footer links')}">
          <ul class="site-footer-links">
            ${getLinks()
              .map((link) => `<li>${renderLink(link)}</li>`)
              .join('')}
          </ul>
        </nav>
        ${renderLangToggle()}
      </div>
      <ul class="site-footer-legal" aria-label="${tr('Informations légales', 'Legal information')}">
        <li>${tr('Mentions légales', 'Legal notice')} <span class="site-footer-legal-status">(${tr('en construction', 'under construction')})</span></li>
        <li>${tr('Protection des données (nLPD)', 'Data protection (Swiss FADP)')} <span class="site-footer-legal-status">(${tr('en construction', 'under construction')})</span></li>
      </ul>
      <p class="site-footer-copy">© ${new Date().getFullYear()} À Table — By Angelo</p>
    </footer>
  `,
  );

  // The link to the page you are on stays put.
  root.querySelectorAll<HTMLAnchorElement>('.site-footer a[aria-current="page"]').forEach((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
};
