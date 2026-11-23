import './style.css';
import { bootPage } from './boot';
import { tr } from './i18n';
import { renderTeam } from './team';

// The team page: same loader, language question, header and footer as the homepage.
// No story, marquees, or Lenis.
const app = document.querySelector<HTMLDivElement>('#app');
if (app) {
  bootPage(app, {
    build: (root) => {
      document.title = tr('L’équipe — À Table — By Angelo', 'Team — À Table — By Angelo');
      root.insertAdjacentHTML('beforeend', `<main class="team-page">${renderTeam()}</main>`);
    },
  });
}
