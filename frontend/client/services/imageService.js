const imageCache = new Map();

export async function fetchImageUrl(productId, imageId, token) {
  if (!productId || !imageId) return '/korm1.svg';
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch {
    const fb = '/korm1.svg';
    imageCache.set(cacheKey, fb);
    return fb;
  }
}