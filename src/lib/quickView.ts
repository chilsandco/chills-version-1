import { Product } from '../types';

/** Open the quick-view sheet for a product. The sheet itself loads on demand (see App.tsx). */
export const openQuickView = (product: Product, color?: string) =>
  window.dispatchEvent(new CustomEvent('quick-view', { detail: { product, color } }));
