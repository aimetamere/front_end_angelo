import { tr } from './i18n';
import { renderMarquee } from './marquee';

interface Photo {
  src: string;
  width: number;
  height: number;
  alt: string;
}

// Lightroom exports in public/photos (intrinsic sizes keep layout stable). A function so the
// alt text is picked in the visitor's language at render time.
const getPhotos = (): Photo[] => [
  { src: '/photos/_DSC2660.jpg', width: 4672, height: 3115, alt: tr('Plateau de verrines de tartare garnies de fleurs comestibles, dressé par À Table', 'Tray of tartare verrines garnished with edible flowers, served by À Table') },
  { src: '/photos/_DSC2664.jpg', width: 4672, height: 7008, alt: tr('Main du chef déposant une garniture sur un plateau de bouchées de tartare', 'The chef’s hand placing a garnish on a tray of tartare bites') },
  { src: '/photos/_DSC2693.jpg', width: 7008, height: 4672, alt: tr('Rangées de mini-sandwichs garnis, alignés sur la table d’À Table', 'Rows of filled mini sandwiches lined up on À Table’s table') },
  { src: '/photos/_DSC2761.jpg', width: 7008, height: 4672, alt: tr('Mini-sandwichs et petits feuilletés dorés disposés en rangs serrés', 'Mini sandwiches and golden puff pastries laid out in tight rows') },
  { src: '/photos/_DSC2813.jpg', width: 6520, height: 4347, alt: tr('Assiette ronde de légumes farcis disposés en couronne sur un lit de salade', 'Round plate of stuffed vegetables arranged in a ring on a bed of salad') },
  { src: '/photos/_DSC2816.jpg', width: 6588, height: 4392, alt: tr('Plat rond en porcelaine bleue et blanche garni de mini-pains et de bouchées salées', 'Round blue-and-white china platter of mini rolls and savoury bites') },
  { src: '/photos/_DSC2908.jpg', width: 4672, height: 4672, alt: tr('Plateau rond de petits fours sur porcelaine bleue et blanche', 'Round platter of petits fours on blue-and-white china') },
  { src: '/photos/_DSC2912.jpg', width: 6240, height: 4160, alt: tr('Petits fours disposés en couronne sur un plat en porcelaine bleue et blanche', 'Petits fours arranged in a ring on a blue-and-white china platter') },
  { src: '/photos/_DSC2940.jpg', width: 6595, height: 4397, alt: tr('Plateau de petits fours alignés sur une nappe blanche : choux, tartelettes et bouchées aux framboises', 'Tray of petits fours lined up on a white cloth: choux, tartlets and raspberry bites') },
  { src: '/photos/_DSC2973.jpg', width: 6548, height: 4365, alt: tr('Rangées de choux dorés au craquelin', 'Rows of golden craquelin choux') },
  { src: '/photos/_DSC2980.jpg', width: 6862, height: 4575, alt: tr('Bouchées au chocolat surmontées d’une noisette, alignées en rangs', 'Chocolate bites topped with a hazelnut, lined up in rows') },
  { src: '/photos/_DSC2986.jpg', width: 7008, height: 4672, alt: tr('Carrés aux framboises et à la meringue, vus du dessus', 'Raspberry and meringue squares, seen from above') },
  { src: '/photos/_DSC2990.jpg', width: 6618, height: 4412, alt: tr('Tartelettes au chocolat parsemées d’éclats de meringue', 'Chocolate tartlets scattered with meringue shards') },
  { src: '/photos/_DSC3030.jpg', width: 4672, height: 7008, alt: tr('Présentoir de petits fours lors d’une réception, invités en arrière-plan', 'Petits fours stand at a reception, guests in the background') },
  { src: '/photos/_DSC3034.jpg', width: 7008, height: 4672, alt: tr('Plateaux de petits fours posés sur une table, vus du dessus', 'Trays of petits fours on a table, seen from above') },
];

// Web copies made by scripts/make-web-photos.sh (long edge 1200 / 2400px). The originals in
// public/photos/ are 30+ megapixels; decoding those while scrolling stalls frames for seconds.
const WEB_SIZES = [1200, 2400];
const webSrc = (src: string, longEdge: number) =>
  src.replace('/photos/', '/photos/web/').replace(/\.jpg$/, `-${longEdge}.jpg`);

interface ImgOptions {
  /** CSS width of the slot, for the browser to pick a file. */
  sizes: string;
  /** Fetch first: the first photos the visitor meets. */
  priority?: boolean;
}

// Every photo loads up front: the page loader holds until all of them are decoded (loader.ts),
// so nothing pops in or decodes mid-scroll.
const img = ({ src, width, height, alt }: Photo, { sizes, priority = false }: ImgOptions) => {
  const srcset = WEB_SIZES.map(
    (edge) => `${webSrc(src, edge)} ${Math.round((width * edge) / Math.max(width, height))}w`,
  ).join(', ');
  return `<img src="${webSrc(src, 1200)}" srcset="${srcset}" sizes="${sizes}" width="${width}" height="${height}" alt="${alt}" decoding="async" loading="eager"${priority ? ' fetchpriority="high"' : ''} />`;
};

const srOnly = (text: string) => `<span class="sr-only">${text}</span>`;

// Letter-by-letter beat: each letter is its own span; words stay unbroken.
const splitLetters = (text: string) => {
  let i = 0;
  const words = text
    .split(' ')
    .map(
      (word) =>
        `<span class="beat-word">${[...word]
          .map((char) => `<span class="beat-char" style="--i: ${i++}">${char}</span>`)
          .join('')}</span>`,
    )
    .join(' ');
  return `${srOnly(text)}<span aria-hidden="true">${words}</span>`;
};

// Line-by-line beat: one line per sentence.
const splitLines = (text: string) =>
  text
    .split('.')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => `<span class="beat-line" style="--i: ${i}">${line}.</span>`)
    .join('');

const spacer = `<div class="story-spacer" aria-hidden="true"></div>`;

const sendIcons = {
  plane: `
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  `,
  check: `
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  `,
};

const letterSpans = (text: string, offset = 0) =>
  [...text].map((char, i) => `<span style="--i: ${i + offset}">${char}</span>`).join('');

const field = (id: string, label: string, control: string) => `
  <div class="field">
    <div class="field-control">
      ${control}
      <span class="field-highlight" aria-hidden="true"></span>
      <span class="field-bar" aria-hidden="true"></span>
      <label for="${id}">${label}</label>
    </div>
    <p class="field-error" id="${id}-error" hidden></p>
  </div>
`;

const renderForm = () => `
  <section class="contact" id="contact" aria-labelledby="contact-title">
    <h2 id="contact-title">${tr('Racontez-nous', 'Tell us about it')}</h2>
    <p class="contact-intro">
      ${tr(
        'Dites-nous ce que vous avez en tête. Nous vous rappelons pour confirmer que ce que vous avez demandé est exactement ce que nous ferons.',
        'Tell us what you have in mind. We call you back to confirm that what you asked for is exactly what we will do.',
      )}
    </p>

    <form class="contact-form" novalidate>
      ${field('contact-name', tr('Nom', 'Name'), `<input id="contact-name" name="name" type="text" autocomplete="name" placeholder=" " required aria-describedby="contact-name-error" />`)}
      ${field('contact-phone', tr('Téléphone', 'Phone'), `<input id="contact-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder=" " required aria-describedby="contact-phone-error" />`)}
      ${field('contact-email', 'Email', `<input id="contact-email" name="email" type="email" autocomplete="email" placeholder=" " required aria-describedby="contact-email-error" />`)}
      ${field(
        'contact-occasion',
        'Occasion',
        `<select id="contact-occasion" name="occasion" required aria-describedby="contact-occasion-error">
          <option value="" disabled selected hidden></option>
          <option value="dejeuner">${tr('Déjeuner', 'Lunch')}</option>
          <option value="diner">${tr('Dîner', 'Dinner')}</option>
          <option value="privatisation">${tr('Privatisation', 'Private hire')}</option>
          <option value="autre">${tr('Autre', 'Other')}</option>
        </select>`,
      )}
      ${field('contact-guests', tr('Nombre de convives', 'Number of guests'), `<input id="contact-guests" name="guests" type="number" min="1" step="1" inputmode="numeric" placeholder=" " required aria-describedby="contact-guests-error" />`)}
      ${field('contact-message', 'Message', `<textarea id="contact-message" name="message" rows="4" placeholder=" " aria-describedby="contact-message-hint"></textarea>`)}
      <p class="field-hint" id="contact-message-hint">${tr('Facultatif : date souhaitée, allergies, contraintes…', 'Optional: preferred date, allergies, constraints…')}</p>

      <div class="field field--check">
        <label class="field-checkbox">
          <input id="contact-callback" name="callback" type="checkbox" required aria-describedby="contact-callback-error" />
          <span>${tr('Je souhaite être rappelé pour confirmer ma demande.', 'I would like a call back to confirm my request.')}</span>
        </label>
        <p class="field-error" id="contact-callback-error" hidden></p>
      </div>

      <button class="send-button" type="submit">
        <span class="send-button-outline" aria-hidden="true"></span>
        <span class="send-state send-state--default">
          <span class="send-icon">${sendIcons.plane}</span>
          <span class="send-label">${letterSpans(tr('Envoyer', 'Send'))}</span>
        </span>
        <span class="send-state send-state--sent" aria-hidden="true">
          <span class="send-icon">${sendIcons.check}</span>
          <span class="send-label">${letterSpans(tr('Envoyé', 'Sent'), tr(5, 3))}</span>
        </span>
      </button>
    </form>

    <div class="contact-confirm" hidden>
      <h3 class="contact-confirm-title" tabindex="-1">${tr('C’est envoyé.', 'It’s sent.')}</h3>
      <p>${tr('Nous vous appellerons au numéro que vous nous avez donné.', 'We will call you at the number you gave us.')}</p>
      <p>
        ${tr(
          'Cet appel sert à reprendre votre demande avec vous — date, nombre de convives, occasion, contraintes — et à nous mettre d’accord avant toute réservation.',
          'This call is to go over your request with you — date, number of guests, occasion, constraints — and agree on it before anything is booked.',
        )}
      </p>
      <dl class="contact-confirm-details">
        <div>
          <dt>${tr('Nom', 'Name')}</dt>
          <dd data-confirm="name"></dd>
        </div>
        <div>
          <dt>${tr('Téléphone', 'Phone')}</dt>
          <dd data-confirm="phone"></dd>
        </div>
      </dl>
      <button class="contact-edit" type="button">${tr('Corriger', 'Edit')}</button>
    </div>
  </section>
`;

export const renderStory = () => {
  const p = getPhotos();
  return `
    <div class="story">
      <div class="story-stack">
        <section class="panel panel--intro" aria-labelledby="story-title">
          <div>
            <h1 id="story-title">${tr('Contactez-nous', 'Contact us')}</h1>
            <p class="panel-subline">${tr(
              'Prenez votre temps et défilez. Plus bas, un formulaire de contact vous attend : racontez-nous votre événement, et nous vous accompagnons.',
              'Take your time and scroll. Further down, a contact form is waiting: tell us about your event, and we will be with you through it.',
            )}</p>
            <p class="panel-subline">${tr(
              'Si vous savez déjà ce que vous voulez, appuyez sur Contact et faites-nous part de vos attentes.',
              'If you already know what you want, press Contact and tell us what you expect.',
            )}</p>
          </div>
          <a class="story-cue" href="#story-start">
            <span>${tr('Défiler', 'Scroll')}</span>
            <span class="story-cue-line" aria-hidden="true"></span>
          </a>
        </section>
        ${spacer}

        ${renderMarquee('marquee--sheet')}

        <section class="panel panel--olive" id="story-start">
          <p class="beat-text beat-text--a" data-reveal>${tr('L’idée commence à table.', 'The idea starts at the table.')}</p>
        </section>
        ${spacer}

        <section class="panel panel--cream">
          <p class="beat-text beat-text--b" data-reveal>${splitLetters(tr('On s’assoit, on écoute, on fait naître le repas.', 'We sit down, we listen, we bring the meal to life.'))}</p>
        </section>
        ${spacer}
      </div>

      <section class="chapter-split">
        <div class="chapter-split-title">
          <p class="beat-text beat-text--c" data-reveal>${tr('Du premier geste jusqu’à l’assiette.', 'From the first gesture to the plate.')}</p>
        </div>
        <div class="chapter-split-list">
          ${[0, 2, 5, 9]
            .map(
              (n, i) =>
                `<figure class="skew-figure">${img(p[n], { sizes: '(min-width: 900px) 20rem, 68vw', priority: i < 2 })}</figure>`,
            )
            .join('')}
        </div>
      </section>

      <section class="chapter-stack">
        <div class="chapter-stack-photos">
          ${[6, 7, 10, 13].map((n) => `<figure class="stack-figure">${img(p[n], { sizes: 'min(24rem, 80vw)' })}</figure>`).join('')}
        </div>
        <div class="chapter-stack-title">
          <p class="beat-text beat-text--d" data-reveal>${splitLines(tr('Rêver grand. Travailler juste. Recevoir vraiment.', 'Dream big. Work with care. Host with heart.'))}</p>
        </div>
      </section>

      <section class="gallery" aria-label="${tr('Galerie', 'Gallery')}">
        <div class="gallery-column">
          ${[1, 3, 4, 8, 11].map((n) => `<figure>${img(p[n], { sizes: '33vw' })}</figure>`).join('')}
        </div>
        <div class="gallery-column gallery-column--sticky">
          ${[12, 0, 5].map((n) => `<figure>${img(p[n], { sizes: '33vw' })}</figure>`).join('')}
        </div>
        <div class="gallery-column">
          ${[2, 9, 6, 10, 13].map((n) => `<figure>${img(p[n], { sizes: '33vw' })}</figure>`).join('')}
        </div>
      </section>

      <figure class="chapter-closing">${img(p[14], { sizes: '100vw' })}</figure>

      ${renderMarquee()}

      ${renderForm()}
    </div>
  `;
};

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const errorFor = (control: Control): string | null => {
  const { validity } = control;
  const value = control.value.trim();

  switch (control.name) {
    case 'name':
      return value ? null : tr('Indiquez votre nom.', 'Please enter your name.');
    case 'phone': {
      if (!value) return tr('Indiquez un numéro où vous rappeler.', 'Please enter a number we can call you back on.');
      const digits = value.replace(/\D/g, '').length;
      return /^\+?[\d\s.()-]+$/.test(value) && digits >= 9 && digits <= 15
        ? null
        : tr('Ce numéro ne semble pas valide.', 'This number doesn’t look valid.');
    }
    case 'email':
      if (!value) return tr('Indiquez votre email.', 'Please enter your email.');
      return validity.typeMismatch
        ? tr('Cette adresse email ne semble pas valide.', 'This email address doesn’t look valid.')
        : null;
    case 'occasion':
      return value ? null : tr('Choisissez une occasion.', 'Please choose an occasion.');
    case 'guests':
      if (validity.badInput) return tr('Indiquez un nombre.', 'Please enter a number.');
      if (!value) return tr('Indiquez le nombre de convives.', 'Please enter the number of guests.');
      if (validity.rangeUnderflow) return tr('Il faut au moins un convive.', 'At least one guest, please.');
      return validity.stepMismatch ? tr('Indiquez un nombre entier.', 'Please enter a whole number.') : null;
    case 'callback':
      return (control as HTMLInputElement).checked
        ? null
        : tr('Cochez cette case pour que nous puissions vous rappeler.', 'Tick this box so we can call you back.');
    default:
      return null;
  }
};

const setupReveals = (root: HTMLElement, reducedMotion: boolean) => {
  const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    // A thin band across the middle of the viewport: fires once the beat's panel is the one in view.
    { rootMargin: '-40% 0px -40% 0px' },
  );
  targets.forEach((el) => observer.observe(el));
};

const setupForm = (root: HTMLElement, reducedMotion: () => boolean) => {
  const form = root.querySelector<HTMLFormElement>('.contact-form')!;
  const button = form.querySelector<HTMLButtonElement>('.send-button')!;
  const confirm = root.querySelector<HTMLElement>('.contact-confirm')!;
  const confirmTitle = confirm.querySelector<HTMLElement>('.contact-confirm-title')!;
  const editButton = confirm.querySelector<HTMLButtonElement>('.contact-edit')!;
  const controls = [...form.querySelectorAll<Control>('input, select, textarea')];
  let sending = false;

  const clearError = (control: Control) => {
    control.removeAttribute('aria-invalid');
    const error = form.querySelector<HTMLElement>(`#${control.id}-error`);
    if (error) {
      error.hidden = true;
      error.textContent = '';
    }
  };

  controls.forEach((control) => {
    const clear = () => clearError(control);
    control.addEventListener('input', clear);
    control.addEventListener('change', clear);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (sending) return;

    controls.forEach(clearError);
    button.classList.remove('is-sent');

    for (const control of controls) {
      const message = errorFor(control);
      if (!message) continue;
      const error = form.querySelector<HTMLElement>(`#${control.id}-error`)!;
      error.textContent = message;
      error.hidden = false;
      control.setAttribute('aria-invalid', 'true');
      control.focus();
      return;
    }

    sending = true;
    button.classList.add('is-sent');
    button.setAttribute('aria-disabled', 'true');

    // No backend yet: a real request would go here before showing the confirmation.
    window.setTimeout(
      () => {
        const data = new FormData(form);
        confirm.querySelector('[data-confirm="name"]')!.textContent = String(data.get('name')).trim();
        confirm.querySelector('[data-confirm="phone"]')!.textContent = String(data.get('phone')).trim();
        form.hidden = true;
        confirm.hidden = false;
        confirmTitle.focus();
      },
      reducedMotion() ? 0 : 1800,
    );
  });

  editButton.addEventListener('click', () => {
    sending = false;
    button.classList.remove('is-sent');
    button.removeAttribute('aria-disabled');
    confirm.hidden = true;
    form.hidden = false;
    controls[0].focus();
  });
};

export const mountStory = (root: HTMLElement) => {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  setupReveals(root, motionQuery.matches);
  setupForm(root, () => motionQuery.matches);
};
