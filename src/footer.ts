import { links } from './links';

export const mountFooter = (root: HTMLElement) => {
  root.insertAdjacentHTML(
    'beforeend',
    `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <a href="#" class="site-footer-logo">
          <img src="/logo_white.png" alt="À Table — By Angelo" />
        </a>
        <nav aria-label="Liens du pied de page">
          <ul class="site-footer-links">
            ${links.map(({ href, label }) => `<li><a href="${href}">${label}</a></li>`).join('')}
          </ul>
        </nav>
      </div>
      <p class="site-footer-copy">© ${new Date().getFullYear()} À Table — By Angelo</p>
    </footer>
  `,
  );
};
