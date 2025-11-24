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
 * @param {string} value - Входное значение
 * @returns {string} Отформатированный телефон
 */
export const formatPhone = (value) => {
  // Убираем все нецифровые символы
  const digits = value.replace(/\D/g, "");
  
  // Если начинается с 8, заменяем на 7
  let formatted = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
  
  // Ограничиваем до 11 цифр
  if (formatted.length > 11) {
    formatted = formatted.slice(0, 11);
  }
  
  // Форматируем: +7 (999) 123-45-67
  if (formatted.length === 0) return "";
  if (formatted.length <= 1) return `+${formatted}`;
  if (formatted.length <= 4) return `+${formatted.slice(0, 1)} (${formatted.slice(1)}`;
  if (formatted.length <= 7) return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4)}`;
  if (formatted.length <= 9) return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7)}`;
  return `+${formatted.slice(0, 1)} (${formatted.slice(1, 4)}) ${formatted.slice(4, 7)}-${formatted.slice(7, 9)}-${formatted.slice(9, 11)}`;
};

/**
 * Алиас для formatName (используется в Cart.jsx как formatReceiver)
 */
export const formatReceiver = formatName;

