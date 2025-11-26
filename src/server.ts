import express from 'express';
import { join } from 'node:path';
import { readFileSync, existsSync } from 'node:fs';

// Static Express server (SSR désactivé)
const app = express();
const distFolder = join(process.cwd(), 'dist/portail-doctorat-frontend/browser');
const indexHtmlPath = join(distFolder, 'index.html');

// Fichiers statiques
app.use(express.static(distFolder, { maxAge: '1y' }));

// Fallback: renvoyer l'index.html
app.get('*', (req, res) => {
  if (existsSync(indexHtmlPath)) {
    const indexHtml = readFileSync(indexHtmlPath, 'utf-8');
    res.send(indexHtml);
  } else {
    res.status(503).send('Application non construite. Lancez: ng build');
  }
});

function run() {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => console.log(`Static server listening on http://localhost:${port}`));
}

if (require.main === module) {
  run();
}

export default app;
