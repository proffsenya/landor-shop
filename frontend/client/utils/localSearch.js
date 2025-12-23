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
// Функция нормализации е/ё и других символов для поиска
const normalizeE = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/ё/g, 'е')
    .replace(/Ё/g, 'Е')
    .replace(/\u200B/g, '') // Убираем невидимые пробелы
    .replace(/\u00A0/g, ' ') // Заменяем неразрывные пробелы на обычные
    .trim();
};

// Функция для расширения запроса синонимами и вариантами
const expandQuery = (query) => {
  const normalized = normalizeE(query.toLowerCase().trim());
  
  // Словарь синонимов и вариантов
  const synonyms = {
    'все': ['всех', 'всем', 'всеми', 'всего'],
    'породы': ['пород', 'породам', 'породами', 'породе'],
    'все породы': ['для всех', 'для всех пород', 'всех пород', 'всем породам', 'все пород'],
    'для стерилизованных': ['стерилизованным', 'стерилизованным кошкам', 'для стерилизованных кошек', 'стерилизованные', 'стерилизованным котам'],
    'стерилизованных': ['стерилизованным', 'стерилизованным кошкам', 'для стерилизованных', 'стерилизованные', 'стерилизованным котам'],
    'для котят': ['котенок', 'котенка', 'котенку', 'котенком', 'котятам', 'котят', 'для котят', 'котенку', 'котенка'],
    'котят': ['котенок', 'котенка', 'котенку', 'котенком', 'котятам', 'для котят', 'котенку', 'котенка'],
    'для щенков': ['щенок', 'щенка', 'щенку', 'щенком', 'щенкам', 'щенков', 'для щенков', 'щенку', 'щенка'],
    'щенков': ['щенок', 'щенка', 'щенку', 'щенком', 'щенкам', 'для щенков', 'щенку', 'щенка'],
    'котенок': ['котят', 'котенка', 'котенку', 'котенком', 'котятам', 'для котят'],
    'щенок': ['щенков', 'щенка', 'щенку', 'щенком', 'щенкам', 'для щенков'],
  };
  
  // Расширяем запрос синонимами
  let expanded = [normalized];
  
  // Проверяем полные фразы
  for (const [key, variants] of Object.entries(synonyms)) {
    if (normalized.includes(key)) {
      expanded.push(...variants);
      // Также добавляем комбинации
      variants.forEach(variant => {
        expanded.push(normalized.replace(key, variant));
      });
    }
  }
  
  // Проверяем отдельные слова
  const words = normalized.split(/\s+/);
  words.forEach(word => {
    if (synonyms[word]) {
      expanded.push(...synonyms[word]);
    }
  });
  
  // Убираем дубликаты и возвращаем уникальные варианты
  return [...new Set(expanded)];
};

export function localSearch(query, dataset = [], limit = 15) {
  // Более надежная нормализация запроса
  if (!query || (typeof query !== 'string' && typeof query !== 'number')) return [];
  const q = String(query).trim().toLowerCase();
  if (!q) return [];

  // Нормализуем е/ё в запросе
  const normalizedQuery = normalizeE(q);

  // Очищаем запрос от знаков препинания и разбиваем на слова
  const cleanQuery = normalizedQuery
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQuery) return [];

  // Расширяем запрос синонимами
  const expandedQueries = expandQuery(cleanQuery);
  
  // Разбиваем запрос на отдельные слова для каждого варианта
  const queryWordsVariants = expandedQueries.map(expandedQuery => 
    expandedQuery.split(' ').filter(word => word.length > 0)
  );
  
  // Берем основной вариант для проверки
  const queryWords = cleanQuery.split(' ').filter(word => word.length > 0);

  const res = [];
  for (const item of dataset) {
    // Проверяем, есть ли variants (старая структура) или это уже плоская карточка
    const variants = Array.isArray(item?.variants) ? item.variants : [];
    
    if (variants.length > 0) {
      // Старая структура: продукт с вариантами
      variants.forEach((variant) => {
        // Нормализуем все поля перед использованием
        const title = normalizeE(
          variant?.displayName || 
          variant?.display_name || 
          item?.productName || 
          item?.name || 
          ""
        );
        const desc = normalizeE(
          variant?.description || 
          item?.brand || 
          ""
        );
        
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

        // Нормализуем е/ё в тексте для поиска
        const normalizedCombined = normalizeE(combined);

        // Очищаем комбинированную строку так же как запрос
        const cleanCombined = normalizedCombined
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // Проверяем, содержатся ли все слова запроса в тексте (в любом порядке)
        // Также проверяем расширенные варианты запроса
        const checkMatch = (words) => {
          if (!words || words.length === 0) return false;
          // Проверяем, что все слова найдены (более гибкая проверка)
          return words.every(word => {
            if (word.length < 2) return true; // Игнорируем очень короткие слова
            return cleanCombined.includes(word);
          });
        };
        
        // Также проверяем частичное совпадение (хотя бы одно слово)
        const checkPartialMatch = (words) => {
          if (!words || words.length === 0) return false;
          return words.some(word => word.length >= 2 && cleanCombined.includes(word));
        };
        
        const allWordsFound = checkMatch(queryWords) || 
          queryWordsVariants.some(variantWords => checkMatch(variantWords)) ||
          expandedQueries.some(expandedQuery => cleanCombined.includes(expandedQuery)) ||
          // Дополнительная проверка: если запрос короткий (1-2 слова), используем частичное совпадение
          (queryWords.length <= 2 && checkPartialMatch(queryWords));

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
      // Собираем все возможные поля названия для более надежного поиска
      // Нормализуем все поля перед использованием
      const title = normalizeE(
        item?.displayName || 
        item?.display_name || 
        item?.productName || 
        item?.name || 
        item?.title || 
        ""
      );
      const desc = normalizeE(
        item?.description || 
        item?.brand || 
        item?.subtitle || 
        ""
      );
      
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

      // Нормализуем е/ё в тексте для поиска
      const normalizedCombined = normalizeE(combined);

      // Очищаем комбинированную строку так же как запрос
      const cleanCombined = normalizedCombined
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Проверяем, содержатся ли все слова запроса в тексте (в любом порядке)
      // Также проверяем расширенные варианты запроса
      const checkMatch = (words) => {
        if (!words || words.length === 0) return false;
        // Проверяем, что все слова найдены (более гибкая проверка)
        return words.every(word => {
          if (word.length < 2) return true; // Игнорируем очень короткие слова
          return cleanCombined.includes(word);
        });
      };
      
      // Также проверяем частичное совпадение (хотя бы одно слово)
      const checkPartialMatch = (words) => {
        if (!words || words.length === 0) return false;
        return words.some(word => word.length >= 2 && cleanCombined.includes(word));
      };
      
      const allWordsFound = checkMatch(queryWords) || 
        queryWordsVariants.some(variantWords => checkMatch(variantWords)) ||
        expandedQueries.some(expandedQuery => cleanCombined.includes(expandedQuery)) ||
        // Дополнительная проверка: если запрос короткий (1-2 слова), используем частичное совпадение
        (queryWords.length <= 2 && checkPartialMatch(queryWords));

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