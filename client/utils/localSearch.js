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
    // Преобразуем каждый вариант товара в результаты поиска
    item.variants.forEach((variant) => {
      const title = variant?.displayName || item?.productName || "";
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
        res.push({
          id: String(variant?.id ?? Math.random()),
          title: title || "Товар",
          subtitle: typeof variant?.price === "number" ? `${variant.price} ₽` : desc,
          image: variant?.imageUrl || item?.imageUrl || "/korm1.svg",
          url:
            variant?.url ||
            (item?.parentId
              ? `/product/${encodeURIComponent(item.parentId)}?variant=${encodeURIComponent(variant.id)}`
              : `/product/${encodeURIComponent(variant.id)}`),
          type: "product",
        });
      }
      if (res.length >= limit) return;
    });
    
    if (res.length >= limit) break;
  }

  return res;
}