/**
 * Форматирование имени/ФИО (капитализация первой буквы каждого слова)
 * @param {string} value - Входное значение
 * @returns {string} Отформатированное значение
 */
export const formatName = (value) => {
  const words = value.split(/(\s+)/);
  return words
    .map((word) => {
      if (/^\s+$/.test(word)) return word;
      if (word.length > 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join("");
};

/**
 * Форматирование телефона в формат +7 (999) 123-45-67
 * Гарантирует, что номер всегда начинается с +7
 * @param {string} value - Входное значение
 * @returns {string} Отформатированный телефон
 */
export const formatPhone = (value) => {
  // Убираем все нецифровые символы
  let digits = value.replace(/\D/g, "");
  
  if (digits.length === 0) return "";
  
  // Если номер начинается с 8, заменяем на 7
  if (digits.startsWith("8")) {
    digits = "7" + digits.slice(1);
  }
  // Если номер не начинается с 7 или 8, добавляем 7 в начало
  else if (!digits.startsWith("7")) {
    // Если у нас 10 цифр (российский номер без кода страны), добавляем 7
    if (digits.length === 10) {
      digits = "7" + digits;
    }
    // Если начинается с 9 и меньше 10 цифр, это начало российского номера - добавляем 7
    else if (digits.length < 10 && digits.length > 0) {
      digits = "7" + digits;
    }
  }
  
  // Ограничиваем до 11 цифр (7 + 10 цифр российского номера)
  if (digits.length > 11) {
    digits = digits.slice(0, 11);
  }
  
  // Гарантируем, что номер начинается с 7 (финальная проверка)
  if (!digits.startsWith("7") && digits.length > 0) {
    // Если не начинается с 7, добавляем 7 (но не более 11 цифр)
    if (digits.length < 11) {
      digits = "7" + digits;
    } else {
      // Если уже 11 цифр и не начинается с 7, заменяем первую на 7
      digits = "7" + digits.slice(1);
    }
  }
  
  // Форматируем: +7 (999) 123-45-67
  if (digits.length === 0) return "";
  if (digits.length === 1) {
    return digits.startsWith("7") ? `+${digits}` : `+7`;
  }
  if (digits.length <= 4) {
    return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
  }
  if (digits.length <= 7) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  }
  if (digits.length <= 9) {
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
};

/**
 * Алиас для formatName (используется в Cart.jsx как formatReceiver)
 */
export const formatReceiver = formatName;

/**
 * Форматирование веса - просто добавляет "кг" к значению из БД
 * @param {number|string} weightValue - Вес из базы данных
 * @returns {string} Вес с добавлением "кг"
 */
export const formatWeight = (weightValue) => {
  if (weightValue === null || weightValue === undefined || weightValue === "") return "-";
  return `${weightValue} кг`;
};

