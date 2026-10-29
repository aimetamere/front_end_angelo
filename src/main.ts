import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app) {
  app.innerHTML = `
    <main>
      <h1>À Table</h1>
      <p class="subtitle">By Angelo</p>
      <p>Le projet est prêt.</p>
    </main>
  `;
}
