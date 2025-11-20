/**
 * Простой локальный поиск по каталогу, избранному, корзине и т.д.
 * Ищет подстроку без учёта регистра, без чувствительности к знакам препинания
 * и с поддержкой перестановки слов.
 *
 * @param {string} query - строка поиска
 * @param {Array} dataset - массив объектов (например, карточек товаров)
 * @param {number} [limit=15] - максимум результатов
 * @returns {Array<{id, title, subtitle, url, image, type}>}
 */
export function localSearch(query, dataset = [], limit = 15) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  // Очищаем запрос от знаков препинания и разбиваем на слова
  const cleanQuery = q
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQuery) return [];

  // Разбиваем запрос на отдельные слова
  const queryWords = cleanQuery.split(' ').filter(word => word.length > 0);

  const res = [];
  for (const item of dataset) {
    // Проверяем наличие variants
    const variants = Array.isArray(item?.variants) ? item.variants : [];
    
    // Если нет variants, пропускаем этот товар
    if (variants.length === 0) continue;
    
    // Преобразуем каждый вариант товара в результаты поиска
    variants.forEach((variant) => {
      const title = variant?.displayName || variant?.display_name || item?.productName || item?.name || "";
      const desc = variant?.description || item?.brand || "";
      const combined = `${title} ${desc}`.toLowerCase();

      // Очищаем комбинированную строку так же как запрос
      const cleanCombined = combined
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Проверяем, содержатся ли все слова запроса в тексте (в любом порядке)
      const allWordsFound = queryWords.every(word => 
        cleanCombined.includes(word)
      );

      if (allWordsFound) {
        const variantId = variant?.id ?? variant?.variantId;
        const productId = item?.id ?? item?.productId ?? item?.parentId;
        
        res.push({
          id: String(variantId ?? Math.random()),
          title: title || "Товар",
          subtitle: typeof variant?.price === "number" ? `${variant.price} ₽` : desc,
          image: variant?.imageUrl || item?.imageUrl || "/korm1.svg",
          url: productId && variantId
            ? `/product/${encodeURIComponent(productId)}?variant=${encodeURIComponent(variantId)}`
            : variantId
            ? `/product/${encodeURIComponent(variantId)}`
            : "#",
          type: "product",
        });
      }
      if (res.length >= limit) return;
    });
    
    if (res.length >= limit) break;
  }

  return res;
}