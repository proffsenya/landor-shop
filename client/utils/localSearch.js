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
    // Проверяем, есть ли variants (старая структура) или это уже плоская карточка
    const variants = Array.isArray(item?.variants) ? item.variants : [];
    
    if (variants.length > 0) {
      // Старая структура: продукт с вариантами
      variants.forEach((variant) => {
        const title = variant?.displayName || variant?.display_name || item?.productName || item?.name || "";
        const desc = variant?.description || item?.brand || "";
        
        // Формируем строку веса для поиска
        let weightStr = "";
        if (variant?.weight) {
          if (typeof variant.weight === "number") {
            // Добавляем разные варианты написания веса: "1", "1 кг", "1.0", "1,0" и т.д.
            const weightNum = variant.weight;
            const weightInt = Math.floor(weightNum);
            const weightDecimal = weightNum % 1 === 0 ? "" : weightNum.toFixed(3);
            weightStr = `${weightNum} ${weightInt} ${weightDecimal} кг ${weightNum.toString().replace('.', ',')} ${weightNum.toString().replace(',', '.')}`;
          } else {
            weightStr = String(variant.weight);
          }
        }
        
        const combined = `${title} ${desc} ${weightStr}`.toLowerCase().trim();

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
    } else {
      // Новая структура: плоская карточка (из /api/products/cards/search-by-url)
      const title = item?.displayName || item?.display_name || item?.productName || item?.name || "";
      const desc = item?.description || item?.brand || "";
      
      // Формируем строку веса для поиска
      let weightStr = "";
      if (item?.weight) {
        if (typeof item.weight === "number") {
          // Добавляем разные варианты написания веса: "1", "1 кг", "1.0", "1,0" и т.д.
          const weightNum = item.weight;
          const weightInt = Math.floor(weightNum);
          const weightDecimal = weightNum % 1 === 0 ? "" : weightNum.toFixed(3);
          weightStr = `${weightNum} ${weightInt} ${weightDecimal} кг ${weightNum.toString().replace('.', ',')} ${weightNum.toString().replace(',', '.')}`;
        } else {
          weightStr = String(item.weight);
        }
      }
      if (item?.weightLabel) {
        // Извлекаем число из weightLabel для поиска
        const labelNum = item.weightLabel.match(/[\d,\.]+/);
        if (labelNum) {
          weightStr += ` ${labelNum[0]} ${labelNum[0].replace(',', '.')} ${labelNum[0].replace('.', ',')}`;
        }
        weightStr += ` ${item.weightLabel} ${item.weightLabel.replace('кг', '').replace(/\s+/g, ' ').trim()}`;
      }
      
      const combined = `${title} ${desc} ${weightStr}`.toLowerCase().trim();

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
        const variantId = item?.id ?? item?.variantId;
        const productId = item?.parentId ?? item?.productId ?? item?.productId;
        
        // Сохраняем все поля из исходных данных и дополняем их
        res.push({
          ...item, // Сохраняем все исходные поля
          id: String(variantId ?? item?.id ?? Math.random()),
          title: title || item?.title || "Товар",
          displayName: title || item?.displayName || "Товар",
          subtitle: typeof item?.price === "number" ? `${item.price} ₽` : (item?.subtitle || desc),
          image: item?.imageUrl || item?.image || "/korm1.svg",
          imageUrl: item?.imageUrl || item?.image || "/korm1.svg",
          price: item?.price ?? null,
          weight: item?.weight ?? null,
          weightLabel: item?.weightLabel || (item?.weight ? (typeof item.weight === "number" ? `${item.weight} кг` : item.weight) : null),
          productId: productId,
          variantId: variantId,
          url: item?.url || (productId && variantId
            ? `/product/${encodeURIComponent(productId)}?variant=${encodeURIComponent(variantId)}`
            : variantId
            ? `/product/${encodeURIComponent(variantId)}`
            : "#"),
          type: "product",
        });
      }
    }
    
    if (res.length >= limit) break;
  }

  return res;
}