import productsJson from './products.json';
import { Product } from '@merch-band/shared';

export const staticProducts: Product[] = productsJson as unknown as Product[];

export const clothingCategories = ['T-SHIRT', 'HOODIE'] as const;

export const staticClothingProducts: Product[] = staticProducts.filter((p) =>
  clothingCategories.includes(p.category as (typeof clothingCategories)[number])
);

export function getStaticProductBySlug(slug: string): Product | undefined {
  return staticProducts.find((p) => p.slug === slug);
}

export function getStaticProductsByCategory(category?: string): Product[] {
  if (!category || category === 'ALL') return staticProducts;
  return staticProducts.filter((p) => p.category.toUpperCase() === category.toUpperCase());
}

export default staticProducts;
