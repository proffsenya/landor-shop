/**
 * Валидация имени/фамилии/отчества
 * @param {string} value - Значение для валидации
 * @param {string} fieldName - Название поля (для сообщения об ошибке)
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validateName = (value, fieldName) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return `${fieldName} обязательно для заполнения`;
  }
  const namePattern = /^[А-ЯЁа-яё\-']+$/;
  if (!namePattern.test(trimmed)) {
    return `${fieldName} должно содержать только русские буквы, дефисы и апострофы`;
  }
  if (trimmed.length < 2) {
    return `${fieldName} должно содержать минимум 2 символа`;
  }
  return "";
};

/**
 * Валидация ФИО (полное имя с фамилией и именем)
 * @param {string} value - Значение для валидации
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validateReceiver = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "ФИО обязательно для заполнения";
  }
  // Разбиваем на слова, убирая лишние пробелы
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 2) {
    return "Укажите полное ФИО (минимум фамилия и имя)";
  }
  if (words.length > 3) {
    return "ФИО должно содержать не более 3 слов (фамилия, имя, отчество)";
  }
  // Проверяем, что каждое слово содержит только русские буквы, дефисы и апострофы
  const namePattern = /^[А-ЯЁа-яё\-']+$/;
  for (const word of words) {
    if (!namePattern.test(word)) {
      return "ФИО должно содержать только русские буквы, дефисы и апострофы";
    }
    if (word.length < 2) {
      return "Каждое слово в ФИО должно содержать минимум 2 символа";
    }
  }
  return "";
};

/**
 * Валидация email
 * @param {string} value - Значение для валидации
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validateEmail = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Email обязателен для заполнения";
  }
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(trimmed)) {
    return "Введите корректный email (например: example@mail.ru)";
  }
  return "";
};

/**
 * Валидация телефона
 * Проверяет российский формат: +7 и 10 цифр (всего 11 цифр)
 * @param {string} value - Значение для валидации
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validatePhone = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Номер телефона обязателен для заполнения";
  }
  // Убираем все пробелы, дефисы, скобки и плюсы для проверки
  let cleaned = trimmed.replace(/[\s\-()\+]/g, "");
  
  // Если начинается с 8, заменяем на 7
  if (cleaned.startsWith("8")) {
    cleaned = "7" + cleaned.slice(1);
  }
  
  // Проверяем российский формат: строго 11 цифр, начинается с 7
  // Российский номер: 7 + 10 цифр = 11 цифр
  if (cleaned.length !== 11) {
    return "Номер телефона должен содержать 11 цифр (например: +7 999 123 45 67)";
  }
  
  if (!cleaned.startsWith("7")) {
    return "Номер телефона должен начинаться с +7";
  }
  
  // Проверяем, что все символы - цифры
  if (!/^\d+$/.test(cleaned)) {
    return "Номер телефона должен содержать только цифры";
  }
  
  return "";
};

/**
 * Валидация пароля
 * @param {string} value - Значение для валидации
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validatePassword = (value) => {
  if (!value || value.trim() === "") {
    return "Пароль обязателен для заполнения";
  }
  if (value.length < 6) {
    return "Пароль должен содержать минимум 6 символов";
  }
  return "";
};

/**
 * Валидация подтверждения пароля
 * @param {string} value - Значение для валидации
 * @param {string} newPassword - Новый пароль для сравнения
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validateConfirmPassword = (value, newPassword) => {
  if (!value || value.trim() === "") {
    return "Подтвердите пароль";
  }
  if (value !== newPassword) {
    return "Пароли не совпадают";
  }
  return "";
};

/**
 * Валидация адреса доставки
 * @param {string} value - Значение для валидации
 * @returns {string} Сообщение об ошибке или пустая строка
 */
export const validateAddress = (value) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Адрес доставки обязателен для заполнения";
  }
  if (trimmed.length < 20) {
    return "Адрес слишком короткий. Укажите полный адрес (город, улица, дом, квартира)";
  }
  // Проверяем наличие города
  const cityKeywords = [
    "г.", "г ", "город", "г,",
    "поселок", "пос.", "пос ", "пос,",
    "село", "с.", "с ",
    "деревня", "д.", "д ",
  ];
  const hasCity = cityKeywords.some((keyword) =>
    trimmed.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasCity) {
    return "Укажите город (г.)";
  }
  // Проверяем наличие типа улицы (улица, проспект, переулок и т.д.)
  const streetTypes = [
    "улица", "ул.", "ул ", "ул,",
    "проспект", "пр.", "пр ", "пр,",
    "переулок", "пер.", "пер ", "пер,",
    "бульвар", "б-р", "б ",
    "проезд", "пр-д",
    "шоссе", "ш.", "ш ",
    "набережная", "наб.", "наб ",
    "площадь", "пл.", "пл ",
    "микрорайон", "мкр.", "мкр ",
  ];
  const hasStreetType = streetTypes.some((type) => 
    trimmed.toLowerCase().includes(type.toLowerCase())
  );
  if (!hasStreetType) {
    return "Укажите тип улицы (улица, проспект, переулок и т.д.)";
  }
  // Проверяем наличие номера дома (цифры в адресе)
  const hasHouseNumber = /\d/.test(trimmed);
  if (!hasHouseNumber) {
    return "Укажите номер дома";
  }
  // Проверяем наличие квартиры (обязательно)
  const apartmentKeywords = [
    "квартира", "кв.", "кв ", "кв,", "кв",
    "офис", "оф.", "оф ", "оф,",
    "помещение", "пом.", "пом ",
  ];
  const hasApartment = apartmentKeywords.some((keyword) =>
    trimmed.toLowerCase().includes(keyword.toLowerCase())
  );
  if (!hasApartment) {
    return "Укажите квартиру (кв.) или офис";
  }
  return "";
};

