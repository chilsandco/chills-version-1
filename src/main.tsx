import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { initMetaPixel } from './lib/track';
import { loadProducts } from './hooks/useProducts';

initMetaPixel();
// start fetching the catalogue while the page renders, not after
loadProducts();
// photos fade in as they arrive instead of popping (see .img-in in index.css)
document.addEventListener('load', e => { if (e.target instanceof HTMLImageElement) e.target.classList.add('img-in'); }, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
);
