// client/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import ProductSection from "../components/ProductsSection";
import { PageFade, ListMotion, ToastMotion } from "@/utils/PageAnimations";
import { motion, AnimatePresence } from "framer-motion";

// ---- helpers: authToken + sessionStorage sync с карточками ----
const getAuthToken = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("authToken") || "guest";
};
const STORAGE_CART = (authToken) => `cart:variants:${authToken || "guest"}`;

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

const loadSet = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};
const saveSet = (key, set) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
};

// Кэш для изображений
const imageCache = new Map();

// Функция для получения изображения через API
async function fetchImageUrl(productId, variantId, token) {
  if (!productId || !variantId) return null;
  const cacheKey = `${productId}:${variantId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(variantId)}`,
      {
        headers: token && token !== "guest" ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) {
      console.warn("[Cart images]", res.status, res.url);
      return null;
    }
    const blob = await res.blob();
    const ct = res.headers.get("content-type") || blob.type || "";
    if (!ct.startsWith("image/")) {
      console.warn(
        `[Cart images] not image content for variantId=${variantId}, content-type=${ct}`
      );
      return null;
    }
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch (e) {
    console.warn("[Cart images] error", e);
    return null;
  }
}

// ---- утилиты отображения ----
const fmtMoney = (n) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(n);

const pluralGoods = (n) =>
  n === 1 ? "товар" : n > 1 && n < 5 ? "товара" : "товаров";

// Приводим ответ бэкенда к виду, понятному UI
const mapCartResponse = (data) => {
  const items = Array.isArray(data?.cartItems) ? data.cartItems : [];
  return items.map((row) => ({
    id: String(row?.id), // стабильный ключ строки = cartItem.id
    cartItemId: Number(row?.id ?? 0),
    productId: Number(row?.productId ?? 0),
    variantId: Number(
    row?.variantId ?? row?.productId ?? NaN), // если бэк не отдаёт variantId),
    name: row?.displayName || row?.productName || "Товар",
    price: Number(row?.currentPrice ?? row?.priceAtAdded ?? row?.price ?? 0),
    quantity: Math.max(1, Number(row?.quantity ?? 1)),
    image: row?.imageUrl || "/korm1.svg",
    weight: row?.weightLabel || "",
  }));
};

export default function Cart() {
  const authToken = getAuthToken();
  const cartKey = STORAGE_CART(authToken);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageUrls, setImageUrls] = useState(new Map()); // Map<itemId, imageUrl>

  const [selected, setSelected] = useState(new Set());
  const [payMethod, setPayMethod] = useState("cash");
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({
    receiver: "",
    phone: "",
    address: "",
  });

  const allSelected = selected.size === items.length && items.length > 0;
  const isEmpty = !loading && items.length === 0;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  };

  // ---- загрузка корзины с бэкенда ----
  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/cart", {
        method: "GET",
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });
      if (!res.ok) {
        let body = "";
        try {
          body = await res.text();
        } catch {}
        throw new Error(`HTTP ${res.status}${body ? ` · ${body}` : ""}`);
      }
      const data = await res.json();
      const mapped = mapCartResponse(data);
      setItems(mapped);
      setSelected(new Set(mapped.map((i) => i.id))); // выбрать всё по умолчанию

      // Загружаем изображения через API
      const imageMap = new Map();
      await Promise.all(
        mapped.map(async (item) => {
          if (item.productId && item.variantId) {
            const imageUrl = await fetchImageUrl(item.productId, item.variantId, authToken);
            if (imageUrl) {
              imageMap.set(item.id, imageUrl);
            }
          }
        })
      );
      setImageUrls(imageMap);

      // синхронизируем локальный набор вариантов «в корзине», чтобы кнопки на карточках были актуальны
      const setCart = new Set(
        mapped
          .map((i) => i.variantId)
          .filter((v) => v !== null && v !== undefined)
          .map(String)
      );
      saveSet(cartKey, setCart);
    } catch (e) {
      setItems([]);
      setSelected(new Set());
      setError(e?.message || "Не удалось загрузить корзину");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  // ---- API: удаление позиции из корзины ----
  async function apiRemoveCartItem(item) {
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    const vId = Number(item.variantId);

    if (!Number.isFinite(vId)) {
      console.warn("[cart] variantId отсутствует у позиции, удалить нельзя:", item);
      return false;
    }

    try {
      const r = await fetch(`/api/cart/${encodeURIComponent(vId)}`, {
        method: "DELETE",
        headers,
        body: JSON.stringify({
          variantId: vId,
          quantity: 1,
        }),
      });

      if (r.ok) return true;
      console.warn(
        "DELETE /api/cart/:variantId ->",
        r.status,
        await safeText(r)
      );
      return false;
    } catch (e) {
      console.warn("delete error", e);
      return false;
    }
  }

  // ---- изменение количества товара на бэке ----
  const changeQuantityOnServer = async (item, direction /* "inc" | "dec" */) => {
    const vId = Number(item.variantId);
    if (!Number.isFinite(vId)) {
      console.warn("[cart] нет variantId у позиции", item);
      return false;
    }

    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    const url = `/api/cart/${encodeURIComponent(vId)}/${direction}`;

    try {
      const res = await fetch(url, { method: "POST", headers });
      if (res.ok) return true;

      console.warn(url, res.status, await safeText(res));
      return false;
    } catch (e) {
      console.warn(url, e);
      return false;
    }
  };

  const handleIncrease = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const ok = await changeQuantityOnServer(item, "inc");
    if (!ok) {
      showToast("Не удалось увеличить количество");
      return;
    }
    updateQuantity(id, item.quantity + 1);
  };

  const handleDecrease = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!item || item.quantity <= 1) return;

    const ok = await changeQuantityOnServer(item, "dec");
    if (!ok) {
      showToast("Не удалось уменьшить количество");
      return;
    }
    updateQuantity(id, item.quantity - 1);
  };

  // ---- локальные действия (оптимистично) ----
  const toggleAll = () => {
    setSelected((prev) =>
      prev.size === items.length ? new Set() : new Set(items.map((i) => i.id))
    );
  };
  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const updateQuantity = (id, n) => {
    if (n < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: n } : i)));
  };

  const removeItem = async (id) => {
    const item = items.find((x) => x.id === id);
    if (!item) return;

    // оптимистично скрываем конкретную строку
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    const ok = await apiRemoveCartItem(item);

    if (ok) {
      showToast("Товар удалён из корзины");

      // обновляем локальный список variantId в корзине (для кнопок «В корзину»)
      if (Number.isFinite(item.variantId)) {
        const setCart = loadSet(cartKey);
        setCart.delete(String(item.variantId));
        saveSet(cartKey, setCart);
      }

      // сообщим хедеру, чтобы обновил бейдж
      window.dispatchEvent(new Event("cart:update"));
    } else {
      // откат
      setItems((prev) => [item, ...prev]);
      showToast("Не получилось удалить. Повторите позже");
    }
  };

  // ---- вычисления ----
  const { totalCount, totalPrice } = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const price = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { totalCount: count, totalPrice: price };
  }, [items]);

  // Форматирование ФИО: первая буква каждого слова заглавная
  const formatReceiver = (value) => {
    // Разбиваем на слова, сохраняя пробелы
    const words = value.split(/(\s+)/);
    return words
      .map((word) => {
        // Если это пробелы, возвращаем как есть
        if (/^\s+$/.test(word)) return word;
        // Если слово не пустое, делаем первую букву заглавной
        if (word.length > 0) {
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }
        return word;
      })
      .join("");
  };

  // Валидация ФИО
  const validateReceiver = (value) => {
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

  // Форматирование телефона при вводе
  const formatPhone = (value) => {
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

  // Валидация телефона
  const validatePhone = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return "Номер телефона обязателен для заполнения";
    }
    // Убираем все пробелы, дефисы, скобки и плюсы для проверки
    const cleaned = trimmed.replace(/[\s\-()\+]/g, "");
    // Проверяем российский формат: начинается с 7 или 8, затем 10 цифр
    const phonePattern = /^(7|8)?\d{10}$/;
    if (!phonePattern.test(cleaned)) {
      return "Введите корректный номер телефона (например: +7 999 123 45 67 или 8 999 123 45 67)";
    }
    return "";
  };

  // Валидация адреса
  const validateAddress = (value) => {
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
      "квартира", "кв.", "кв ", "кв,",
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

  // Валидация всех полей
  const validateForm = () => {
    const newErrors = {
      receiver: validateReceiver(receiver),
      phone: validatePhone(phone),
      address: validateAddress(address),
    };
    setErrors(newErrors);
    return !newErrors.receiver && !newErrors.phone && !newErrors.address;
  };

  const onPay = () => {
    // Проверяем, есть ли выбранные товары
    if (selected.size === 0) {
      showToast("Выберите товары для оформления заказа");
      return;
    }

    // Валидируем форму
    if (!validateForm()) {
      showToast("Пожалуйста, исправьте ошибки в форме");
      return;
    }

    console.log("Текущая корзина:");
    items.forEach((i) => {
      console.log({
        id: i.id,
        cartItemId: i.cartItemId,
        variantId: i.variantId,
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        total: i.price * i.quantity,
      });
    });
    showToast("Проверь консоль, корзина выведена");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="container mx-auto px-4 sm:px-6 lg:px-[80px] py-8 lg:py-10">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Корзина" }
          ]} />
          <h1 className="text-[#6F2A2B] text-2xl sm:text-3xl mb-8 lg:mb-20">
            Ваша корзина
          </h1>

          {/* Состояния загрузки/ошибки */}
          {loading && (
            <div className="py-12 text-center text-gray-500">Загрузка…</div>
          )}
          {!loading && error && (
            <div className="py-12 text-center text-red-600">{error}</div>
          )}

          {/* Пустая корзина */}
          {!loading && !error && isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16"
            >
              <img
                src="/empty.svg"
                alt="Корзина пуста"
                className="h-auto mb-4 w-60 sm:w-72 sm:mb-6"
              />
              <p className=" text-[16px] sm:text-[18px] mb-3 sm:mb-4">
                Корзина ждёт товаров
              </p>
              <Link
                to="/catalog"
                className="bg-[#6F2A2B] text-white px-5 py-2.5 rounded-full hover:bg-[#5a2223] transition-colors text-sm sm:text-base"
              >
                За покупками
              </Link>
            </motion.div>
          )}

          {/* Корзина с товарами */}
          {!loading && !error && !isEmpty && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
              {/* Левая часть */}
              <div>
                {/* Шапка таблицы — desktop */}
                <div className="hidden lg:grid grid-cols-[150px_200px_1fr_200px_150px_60px] items-center border-b border-[#E2E2E2] pb-2 text-[#1E1E1E] text-[15px]">
                  <div className="flex items-center gap-2 pl-1">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#6F2A2B]"
                    />
                    <span>Выбрать всё</span>
                  </div>
                  <div>Товар</div>
                  <div />
                  <div className="text-center">Количество</div>
                  <div className="text-center">Стоимость</div>
                  <div className="text-center">Удалить</div>
                </div>

                {/* «Выбрать всё» — mobile */}
                <div className="mb-3 lg:hidden">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#6F2A2B]"
                    />
                    <span className="text-sm text-[#1E1E1E]">Выбрать всё</span>
                  </label>
                </div>

                {/* Desktop строки */}
                <div className="hidden lg:block">
                  <motion.div initial={false}>
                    <AnimatePresence mode="sync">
                      {items.map((i) => (
                        <motion.div
                          key={i.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          style={{ position: "relative", translateX: 0 }}
                          transformTemplate={({ y, scale, rotate }) =>
                            `translateY(${y || 0}) ${scale ? `scale(${scale})` : ""} ${rotate ? `rotate(${rotate})` : ""}`
                          }
                          className="border-b border-[#E2E2E2] py-4 lg:py-6"
                        >
                          <div className="grid grid-cols-[50px_110px_1fr_200px_150px_60px] items-center">
                            <div className="pl-1">
                              <input
                                type="checkbox"
                                checked={selected.has(i.id)}
                                onChange={() => toggleOne(i.id)}
                                className="w-4 h-4 accent-[#6F2A2B]"
                              />
                            </div>

                            <div className="pl-4">
                              <img
                                src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                alt={i.name}
                                className="w-[80px] h-[110px] object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/korm1.svg";
                                }}
                              />
                            </div>

                            <div className="pl-2">
                              <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                {i.name}
                              </p>
                              {i.weight ? (
                                <p className="text-sm text-[#7A7A7A] mt-2">
                                  Вес: {i.weight}
                                </p>
                              ) : null}
                            </div>

                            <div className="flex justify-center">
                              <div className="flex items-center justify-between w-[120px] h-[38px] border border-[#1E1E1E] rounded-full text-[16px]">
                                <button
                                  onClick={() => handleIncrease(i.id)}
                                  className="w-10 text-lg leading-none"
                                  aria-label="Увеличить"
                                >
                                  +
                                </button>
                                <span>{i.quantity}</span>
                                <button
                                  onClick={() => handleDecrease(i.id)}
                                  className="w-10 text-lg leading-none"
                                  aria-label="Уменьшить"
                                >
                                  –
                                </button>
                              </div>
                            </div>

                            <div className="text-center text-[#6F2A2B] text-[16px]">
                              {fmtMoney(i.price * i.quantity)}
                            </div>

                            <div className="flex justify-center">
                              <button
                                onClick={() => removeItem(i.id)}
                                className="hover:opacity-70"
                                aria-label="Удалить"
                              >
                                <Trash2 className="w-5 h-5 text-[#1E1E1E]" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Mobile/Tablet карточки */}
                <div className="lg:hidden">
                  <ListMotion
                    items={items}
                    renderItem={(i) => (
                      <div className="border-b border-[#E2E2E2] py-4">
                        <div className="grid grid-cols-[36px_auto] gap-3">
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selected.has(i.id)}
                              onChange={() => toggleOne(i.id)}
                              className="w-4 h-4 accent-[#6F2A2B]"
                            />
                          </div>

                          <div>
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-16 h-24">
                                <img
                                  src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                  alt={i.name}
                                  className="object-contain w-full h-full"
                                  onError={(e) => {
                                    e.currentTarget.src = "/korm1.svg";
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                  {i.name}
                                </p>
                                {i.weight ? (
                                  <p className="text-sm text-[#7A7A7A] mt-1">
                                    Вес: {i.weight}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center">
                                <div className="flex items-center justify-between w-[110px] h-[36px] border border-[#1E1E1E] rounded-full text-[16px]">
                                  <button
                                    onClick={() => handleIncrease(i.id)}
                                    className="w-10 text-lg leading-none"
                                    aria-label="Увеличить"
                                  >
                                    +
                                  </button>
                                  <span>{i.quantity}</span>
                                  <button
                                    onClick={() => handleDecrease(i.id)}
                                    className="w-10 text-lg leading-none"
                                    aria-label="Уменьшить"
                                  >
                                    –
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="text-[#6F2A2B] text-[16px]">
                                  {fmtMoney(i.price * i.quantity)}
                                </div>
                                <button
                                  onClick={() => removeItem(i.id)}
                                  className="p-2 rounded hover:bg-gray-100"
                                  aria-label="Удалить"
                                >
                                  <Trash2 className="w-5 h-5 text-[#1E1E1E]" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>

                <div className="mt-6">
                  <Link
                    to="/catalog"
                    className="text-[#1E1E1E] text-[15px] hover:text-[#6F2A2B]"
                  >
                    ← В каталог
                  </Link>
                </div>
              </div>

              {/* Правая часть (сайдбар) */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="lg:border-l lg:border-[#E2E2E2] lg:pl-8"
              >
                <div className="border border-[#E2E2E2] rounded-[12px] p-5 sm:p-6 shadow-sm lg:sticky lg:top-4">
                  <h2 className="text-center text-[#1E1E1E] text-[18px] sm:text-[20px]">
                    Информация по заказу
                  </h2>

                  <div className="mt-4 sm:mt-5">
                    <div className="text-[#6F2A2B] text-[15px] sm:text-[16px] mb-2">
                      Итоговая стоимость
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-[15px] sm:text-[16px]">
                        {totalCount} {pluralGoods(totalCount)}
                      </div>
                      <div className="text-[16px] font-medium text-[#1E1E1E]">
                        {fmtMoney(totalPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <p className="text-[#6F2A2B] mb-2">Платежная информация</p>
                    <label className="flex items-center gap-2 text-[15px] mb-2">
                      <input
                        type="radio"
                        name="pay"
                        value="cash"
                        checked={payMethod === "cash"}
                        onChange={() => setPayMethod("cash")}
                        className="accent-[#6F2A2B]"
                      />
                      Наличные
                    </label>
                    <label className="flex items-center gap-2 text-[15px]">
                      <input
                        type="radio"
                        name="pay"
                        value="umoney"
                        checked={payMethod === "umoney"}
                        onChange={() => setPayMethod("umoney")}
                        className="accent-[#6F2A2B]"
                      />
                      Юmoney
                    </label>
                  </div>

                  <div className="mt-5 sm:mt-6">
                    <p className="text-[#6F2A2B] mb-3">Доставка</p>
                    <div className="mb-3">
                      <input
                        value={receiver}
                        onChange={(e) => {
                          const formatted = formatReceiver(e.target.value);
                          setReceiver(formatted);
                          if (errors.receiver) {
                            setErrors((prev) => ({ ...prev, receiver: validateReceiver(formatted) }));
                          }
                        }}
                        onBlur={() => {
                          const formatted = formatReceiver(receiver);
                          setReceiver(formatted);
                          setErrors((prev) => ({ ...prev, receiver: validateReceiver(formatted) }));
                        }}
                        placeholder="Иванов Иван Иванович"
                        className={`w-full h-[40px] border rounded px-3 text-[14px] placeholder:text-[#B0B0B0] ${
                          errors.receiver ? "border-red-500" : "border-[#E2E2E2]"
                        }`}
                      />
                      {errors.receiver ? (
                        <p className="text-red-500 text-xs mt-1">{errors.receiver}</p>
                      ) : !receiver.trim() ? (
                        <p className="text-gray-500 text-xs mt-1">Пример: Иванов Иван Иванович</p>
                      ) : null}
                    </div>
                    <div className="mb-3">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const formatted = formatPhone(e.target.value);
                          setPhone(formatted);
                          if (errors.phone) {
                            setErrors((prev) => ({ ...prev, phone: validatePhone(formatted) }));
                          }
                        }}
                        onBlur={() => {
                          setErrors((prev) => ({ ...prev, phone: validatePhone(phone) }));
                        }}
                        placeholder="+7 (999) 123-45-67"
                        className={`w-full h-[40px] border rounded px-3 text-[14px] placeholder:text-[#B0B0B0] ${
                          errors.phone ? "border-red-500" : "border-[#E2E2E2]"
                        }`}
                      />
                      {errors.phone ? (
                        <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                      ) : !phone.trim() ? (
                        <p className="text-gray-500 text-xs mt-1">Пример: +7 (999) 123-45-67 или 8 (999) 123-45-67</p>
                      ) : null}
                    </div>
                    <div className="mb-4">
                      <input
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) {
                            setErrors((prev) => ({ ...prev, address: validateAddress(e.target.value) }));
                          }
                        }}
                        onBlur={() => {
                          setErrors((prev) => ({ ...prev, address: validateAddress(address) }));
                        }}
                        placeholder="г. Москва, ул. Ленина, д. 10, кв. 25"
                        className={`w-full h-[40px] border rounded px-3 text-[14px] placeholder:text-[#B0B0B0] ${
                          errors.address ? "border-red-500" : "border-[#E2E2E2]"
                        }`}
                      />
                      {errors.address ? (
                        <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                      ) : !address.trim() ? (
                        <p className="text-gray-500 text-xs mt-1">Пример: г. Москва, ул. Ленина, д. 10, кв. 25</p>
                      ) : null}
                    </div>
                    <button
                      onClick={onPay}
                      className="w-full h-[48px] sm:h-[50px] rounded bg-[#6F2A2B] text-white text-[15px] sm:text-[16px] hover:bg-[#5a2223]"
                    >
                      Оплатить
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>

        <ProductSection title="Рекомендовано для Вас" />

        {/* Тосты */}
        <ToastMotion show={!!toast}>{toast}</ToastMotion>
      </PageFade>
      <Footer />
    </div>
  );
}