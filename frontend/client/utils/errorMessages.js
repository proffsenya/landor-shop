/**
 * Утилита для преобразования технических ошибок API в понятные сообщения для пользователя
 */

/**
 * Преобразует техническую ошибку базы данных в понятное сообщение для пользователя
 * @param {string} errorText - Текст ошибки от API
 * @param {string} context - Контекст операции (например, "удаление", "создание", "обновление")
 * @param {string} entityName - Название сущности (например, "тип продукта", "фильтр")
 * @returns {string} Понятное сообщение об ошибке на русском языке
 */
export function formatErrorMessage(errorText, context = "операция", entityName = "элемент") {
  if (!errorText) {
    return `Ошибка при выполнении ${context}`;
  }

  const errorLower = errorText.toLowerCase();

  // Обработка ошибок foreign key constraint (связанные записи)
  if (errorLower.includes("foreign key constraint") || 
      errorLower.includes("violates foreign key constraint") ||
      errorLower.includes("still referenced from table")) {
    
    // Определяем, какая таблица ссылается на удаляемую запись
    let referencedTable = "";
    if (errorLower.includes("products")) {
      referencedTable = "товары";
    } else if (errorLower.includes("orders")) {
      referencedTable = "заказы";
    } else if (errorLower.includes("cart")) {
      referencedTable = "корзина";
    } else if (errorLower.includes("favorites")) {
      referencedTable = "избранное";
    } else {
      referencedTable = "другие записи";
    }

    // Определяем тип сущности для более точного сообщения
    let entityLabel = entityName;
    if (entityName.toLowerCase().includes("тип") || entityName.toLowerCase().includes("type")) {
      entityLabel = "тип продукта";
    } else if (entityName.toLowerCase().includes("категори") || entityName.toLowerCase().includes("categor")) {
      entityLabel = "категорию";
    } else if (entityName.toLowerCase().includes("бренд") || entityName.toLowerCase().includes("brand")) {
      entityLabel = "бренд";
    } else if (entityName.toLowerCase().includes("пород") || entityName.toLowerCase().includes("breed")) {
      entityLabel = "породу";
    } else if (entityName.toLowerCase().includes("цвет") || entityName.toLowerCase().includes("color")) {
      entityLabel = "цвет";
    } else if (entityName.toLowerCase().includes("вкус") || entityName.toLowerCase().includes("flavor")) {
      entityLabel = "вкус";
    } else if (entityName.toLowerCase().includes("запах") || entityName.toLowerCase().includes("scent")) {
      entityLabel = "запах";
    } else if (entityName.toLowerCase().includes("страна") || entityName.toLowerCase().includes("countr")) {
      entityLabel = "страну";
    } else if (entityName.toLowerCase().includes("корм") || entityName.toLowerCase().includes("food")) {
      entityLabel = "тип корма";
    }

    if (context.includes("удал")) {
      return `Нельзя удалить ${entityLabel}: этот ${entityLabel} используется в ${referencedTable}. Сначала удалите или измените связанные ${referencedTable}.`;
    } else {
      return `Нельзя выполнить операцию с ${entityLabel}: он используется в ${referencedTable}.`;
    }
  }

  // Обработка ошибок уникальности (duplicate key)
  if (errorLower.includes("unique constraint") || 
      errorLower.includes("duplicate key") ||
      errorLower.includes("already exists")) {
    return `Такой ${entityName} уже существует. Пожалуйста, используйте другое название.`;
  }

  // Обработка ошибок валидации
  if (errorLower.includes("validation") || 
      errorLower.includes("invalid") ||
      errorLower.includes("required")) {
    return `Некорректные данные для ${entityName}. Проверьте заполнение всех обязательных полей.`;
  }

  // Обработка ошибок не найдено
  if (errorLower.includes("not found") || 
      errorLower.includes("does not exist") ||
      errorLower.includes("не найден")) {
    return `${entityName.charAt(0).toUpperCase() + entityName.slice(1)} не найден.`;
  }

  // Обработка ошибок доступа
  if (errorLower.includes("unauthorized") || 
      errorLower.includes("forbidden") ||
      errorLower.includes("access denied") ||
      errorLower.includes("401") ||
      errorLower.includes("403")) {
    return "У вас нет прав для выполнения этой операции.";
  }

  // Обработка ошибок сервера
  if (errorLower.includes("internal server error") ||
      errorLower.includes("500") ||
      errorLower.includes("server error")) {
    return "Ошибка сервера. Попробуйте позже или обратитесь в поддержку.";
  }

  // Обработка ошибок сети
  if (errorLower.includes("network") ||
      errorLower.includes("fetch") ||
      errorLower.includes("connection")) {
    return "Ошибка соединения. Проверьте подключение к интернету.";
  }

  // Обработка ошибок превышения количества (stock)
  if (errorLower.includes("stock") ||
      errorLower.includes("наличи") ||
      errorLower.includes("количеств")) {
    // Обработка сообщений вида "Not enough stock for variant X"
    const variantMatch = errorText.match(/variant\s+(\d+)/i);
    if (variantMatch) {
      const variantId = variantMatch[1];
      return `Недостаточно товара в наличии для товара ${variantId}. Уменьшите количество или выберите другой вариант.`;
    }
    return "Недостаточно товара в наличии.";
  }

  // Если ошибка содержит "Something went wrong", пытаемся извлечь полезную информацию
  if (errorLower.includes("something went wrong")) {
    // Пытаемся найти более конкретную ошибку после "Something went wrong"
    const match = errorText.match(/Something went wrong:\s*(.+)/i);
    if (match && match[1]) {
      // Рекурсивно обрабатываем найденную ошибку
      return formatErrorMessage(match[1], context, entityName);
    }
  }

  // Если ошибка содержит SQL или технические детали, пытаемся извлечь основную информацию
  if (errorLower.includes("sql") || 
      errorLower.includes("constraint") ||
      errorLower.includes("detail:")) {
    // Пытаемся найти более понятную часть ошибки
    const detailMatch = errorText.match(/Detail:\s*(.+?)(?:\[|$)/i);
    if (detailMatch && detailMatch[1]) {
      return formatErrorMessage(detailMatch[1].trim(), context, entityName);
    }
  }

  // Если ничего не подошло, возвращаем общее сообщение
  // Но пытаемся убрать технические детали
  let cleanError = errorText;
  
  // Убираем технические префиксы
  cleanError = cleanError.replace(/^Something went wrong:\s*/i, "");
  cleanError = cleanError.replace(/^ERROR:\s*/i, "");
  cleanError = cleanError.replace(/\[ERROR:.*?\]/gi, "");
  cleanError = cleanError.replace(/SQL \[.*?\]/gi, "");
  cleanError = cleanError.replace(/constraint \[.*?\]/gi, "");
  
  // Если после очистки осталось что-то осмысленное, используем это
  cleanError = cleanError.trim();
  if (cleanError && cleanError.length < 200) {
    return cleanError;
  }

  // В крайнем случае - общее сообщение
  return `Ошибка при ${context} ${entityName}. Попробуйте позже или обратитесь в поддержку.`;
}

/**
 * Извлекает сообщение об ошибке из ответа API
 * @param {Response} response - Объект Response от fetch
 * @returns {Promise<string>} Текст ошибки
 */
export async function extractErrorText(response) {
  try {
    const text = await response.text();
    // Пытаемся распарсить как JSON
    try {
      const json = JSON.parse(text);
      return json.message || json.error || json.errorMessage || text;
    } catch {
      // Если не JSON, возвращаем текст как есть
      return text || response.statusText;
    }
  } catch {
    return response.statusText || "Неизвестная ошибка";
  }
}

/**
 * Обрабатывает ошибку API и возвращает понятное сообщение
 * @param {Response|Error|string} error - Ошибка от API (Response, Error или строка)
 * @param {string} context - Контекст операции
 * @param {string} entityName - Название сущности
 * @returns {Promise<string>} Понятное сообщение об ошибке
 */
export async function handleApiError(error, context = "операция", entityName = "элемент") {
  // Если это Response объект
  if (error instanceof Response) {
    const errorText = await extractErrorText(error);
    return formatErrorMessage(errorText, context, entityName);
  }
  
  // Если это Error объект
  if (error instanceof Error) {
    return formatErrorMessage(error.message, context, entityName);
  }
  
  // Если это строка
  if (typeof error === "string") {
    return formatErrorMessage(error, context, entityName);
  }
  
  // В остальных случаях
  return formatErrorMessage(String(error), context, entityName);
}

