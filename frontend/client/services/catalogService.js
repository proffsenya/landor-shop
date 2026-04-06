import { ITEMS_PER_PAGE } from '@/constants/catalogConstants';

export async function fetchCatalogCards(filtersUrlString, pageNumber = 1, signal) {
  // filtersUrlString ожидается в виде "catalog?typeoffood_dry=true&brand_landy=true..."
  let filtersUrlValue = filtersUrlString || '';
  if (filtersUrlValue.startsWith('?')) filtersUrlValue = filtersUrlValue.substring(1);
  const filtersUrl = filtersUrlValue ? `catalog?${filtersUrlValue}` : 'catalog?';
  const pageParam = pageNumber - 1; // API 0-based
  const url = `/api/products/cards/search-by-url?filtersUrl=${encodeURIComponent(filtersUrl)}&page=${pageParam}&size=${ITEMS_PER_PAGE}&sort=id,asc`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchFilterOptions() {
  const [brandsRes, flavorsRes, scentsRes, countriesRes, breedsRes, categoriesRes, typeOfFoodsRes, productTypesRes] = await Promise.all([
    fetch('/api/catalog/brands'),
    fetch('/api/catalog/flavors'),
    fetch('/api/catalog/scents'),
    fetch('/api/catalog/countries'),
    fetch('/api/catalog/breeds'),
    fetch('/api/catalog/categories'),
    fetch('/api/catalog/typeOfFoods'),
    fetch('/api/catalog/productTypes'),
  ]);
  return {
    brands: brandsRes.ok ? await brandsRes.json() : [],
    flavors: flavorsRes.ok ? await flavorsRes.json() : [],
    scents: scentsRes.ok ? await scentsRes.json() : [],
    countries: countriesRes.ok ? await countriesRes.json() : [],
    breeds: breedsRes.ok ? await breedsRes.json() : [],
    categories: categoriesRes.ok ? await categoriesRes.json() : [],
    typeOfFoods: typeOfFoodsRes.ok ? await typeOfFoodsRes.json() : [],
    productTypes: productTypesRes.ok ? await productTypesRes.json() : [],
  };
}

export async function fetchProductDetails(productId) {
  const res = await fetch(`/api/products/${productId}/details`);
  if (!res.ok) return null;
  return res.json();
}