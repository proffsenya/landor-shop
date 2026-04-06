// форматирование денег (можно использовать общую утилиту)
export const fmtMoney = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(n);

// преобразование продукта из API в карточку (если нужно)
export const expandProductToCards = (product) => { /* ... скопировать из оригинального файла ... */ };

export const getProductName = (p) => p?.name ?? p?.title ?? p?.productName ?? p?.display_name ?? p?.displayName ?? 'Товар';

// вспомогательные функции для работы с Set (можно перенести из cartUtils)
export const loadSet = (key) => { /* ... */ };
export const saveSet = (key, set) => { /* ... */ };