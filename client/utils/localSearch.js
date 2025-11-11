/**
 * Простой локальный поиск по каталогу, избранному, корзине и т.д.
 * Ищет подстроку без учёта регистра.
 *
 * @param {string} query - строка поиска
 * @param {Array} dataset - массив объектов (например, карточек товаров)
 * @param {number} [limit=15] - максимум результатов
 * @returns {Array<{id, title, subtitle, url, image, type}>}
 */
export function localSearch(query, dataset = [], limit = 15) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];

  const res = [];
  for (const item of dataset) {
    const title =
      item?.title ||
      item?.name ||
      item?.displayName ||
      item?.display_name ||
      "";
    const desc = item?.description || item?.brand || "";
    const combined = `${title} ${desc}`.toLowerCase();

    if (combined.includes(q)) {
      res.push({
        id: String(item?.id ?? Math.random()),
        title: title || "Товар",
        subtitle: typeof item?.price === "number" ? `${item.price} ₽` : desc,
        image: item?.image || item?.imageUrl || "/korm1.svg",
        url:
          item?.url ||
          (item?.parentId
            ? `/product/${encodeURIComponent(
                item.parentId
              )}?variant=${encodeURIComponent(item.id)}`
            : `/product/${encodeURIComponent(item.id)}`),
        type: "product",
      });
    }
    if (res.length >= limit) break;
  }

  return res;
}
