import { DEFAULT_IMAGE } from "@/constants/productConstants";
import { safeWarn } from "@/utils/logger";

const imageCache = new Map();

export async function fetchProductDetails(productId) {
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}/details`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.isActive === false) throw new Error("PRODUCT_INACTIVE");
  return data;
}

export async function fetchProductImagesMeta(productId, authToken) {
  const headers = authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  const res = await fetch(`/api/products/${encodeURIComponent(productId)}/images`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchImageBlobUrl(productId, imageId, authToken) {
  if (!productId || !imageId) return DEFAULT_IMAGE;
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
  try {
    const headers = authToken && authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, { headers });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch {
    imageCache.set(cacheKey, DEFAULT_IMAGE);
    return DEFAULT_IMAGE;
  }
}