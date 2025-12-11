// Кэш для изображений
const imageCache = new Map();

/**
 * Загрузка изображения продукта через API
 * @param {string|number} productId - ID продукта
 * @param {string|number} imageId - ID изображения (или variantId)
 * @param {string|null} token - Токен авторизации (опционально)
 * @returns {Promise<string>} URL изображения или fallback
 */
export async function fetchImageUrl(productId, imageId, token = null) {
  if (!productId || !imageId) return "/korm1.svg";
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(
        productId
      )}/images/${encodeURIComponent(imageId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) {
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const blob = await res.blob();
    const ct = res.headers.get("content-type") || blob.type || "";
    if (!ct.startsWith("image/")) {
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch (e) {
    const fb = "/korm1.svg";
    imageCache.set(cacheKey, fb);
    return fb;
  }
}

