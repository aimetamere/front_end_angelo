import { tr } from './i18n';

interface Member {
  name: string;
  role: string;
  description: string;
  photo: string;
  color: string;
}

// A function so the copy is picked in the visitor's language at render time.
const getMembers = (): Member[] => [
  {
    name: 'Angelo',
    role: tr('Fondateur & Chef', 'Founder & Chef'),
    description: tr('Présentation à venir.', 'Introduction coming soon.'),
    photo: '/icons/portiait.png',
    color: 'var(--color-sage)',
  },
  {
    name: tr('Prénom Nom', 'First Last'),
    role: tr('Poste', 'Role'),
    description: tr('Présentation à venir.', 'Introduction coming soon.'),
    photo: '/icons/portiait.png',
    color: 'var(--color-cream)',
  },
  {
    name: tr('Prénom Nom', 'First Last'),
    role: tr('Poste', 'Role'),
    description: tr('Présentation à venir.', 'Introduction coming soon.'),
    photo: '/icons/portiait.png',
    color: 'var(--color-pastel-blue)',
  },
];

const chevronsRightIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 17 5-5-5-5" />
    <path d="m13 17 5-5-5-5" />
  </svg>
`;

const renderMember = ({ name, role, description, photo, color }: Member) => `
  <article class="team-card" style="--card-color: ${color}" tabindex="0">
    <img class="team-card-photo" src="${photo}" alt="${tr('Portrait de', 'Portrait of')} ${name}" />
    <div class="team-card-details">
      <div class="team-card-details-content">
        <h3>${name}</h3>
        <p>${description}</p>
        <a class="team-card-button" href="/#contact">
          ${tr('En savoir plus', 'Learn more')} ${chevronsRightIcon}
        </a>
      </div>
    </div>
    <div class="team-card-caption">
      <h3>${name}</h3>
      <p class="subtitle">${role}</p>
    </div>
  </article>
`;

/** The team section of team.html: the page's one h1. */
export const renderTeam = () => `
  <section class="team">
    <h1>${tr('Notre équipe', 'Our team')}</h1>
    <div class="team-grid">
      ${getMembers().map(renderMember).join('')}
    </div>
  </section>
`;
