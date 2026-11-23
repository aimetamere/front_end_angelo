import { tr } from './i18n';

export interface NavLink {
  href: string;
  label: string;
  current: boolean;
}

/** team.html sets <body data-page="team">; everything else is the homepage. */
export const onTeamPage = () => document.body.dataset.page === 'team';

/**
 * The three destinations, shared by the drawer and the footer. In-page hashes on the
 * homepage (scrolled by Lenis); real URLs from the team page (normal navigations).
 */
export const getLinks = (): NavLink[] => {
  const team = onTeamPage();
  return [
    { href: team ? '/' : '#', label: tr('Début', 'Start'), current: false },
    { href: team ? '/#contact' : '#contact', label: 'Contact', current: false },
    { href: '/team.html', label: tr('L’équipe', 'Team'), current: team },
  ];
};

export const renderLink = ({ href, label, current }: NavLink) =>
  `<a href="${href}"${current ? ' aria-current="page"' : ''}>${label}</a>`;
