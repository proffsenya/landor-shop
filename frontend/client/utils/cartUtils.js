export const fmtMoney = (n) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(n);

export const pluralGoods = (n) =>
  n === 1 ? "товар" : n > 1 && n < 5 ? "товара" : "товаров";

// Приведение ответа бэкенда к формату UI
export const mapCartResponse = (data) => {
  const items = Array.isArray(data?.cartItems) ? data.cartItems : [];
  return items.map((row) => ({
    id: String(row?.id),
    cartItemId: Number(row?.id ?? 0),
    productId: Number(row?.productId ?? 0),
    variantId: Number(row?.variantId ?? NaN),
    name: row?.displayName || row?.productName || "Товар",
    price: Number(row?.currentPrice ?? row?.priceAtAdded ?? row?.price ?? 0),
    quantity: Math.max(1, Number(row?.quantity ?? 1)),
    image: row?.imageUrl || "/korm1.svg",
    weight: row?.weightLabel || "",
    stock: Number(row?.stock ?? row?.availableStock ?? row?.quantityInStock ?? 0),
  }));
};

// работа с sessionStorage для хранения списка variantId в корзине
export const loadSet = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

export const saveSet = (key, set) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
};

export const STORAGE_CART = (authToken) => `cart:variants:${authToken || "guest"}`;