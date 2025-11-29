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
import { AuthToast } from "@/components/AuthToast";
import { getAuthToken } from "@/utils/auth";
import { formatName, formatPhone } from "@/utils/formatting";
import { validateReceiver, validatePhone, validateAddress } from "@/utils/validation";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Алиас для совместимости
const formatReceiver = formatName;
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

// Функция для получения URL страницы товара
const getProductUrl = (item) => {
  if (item.productId && Number.isFinite(item.productId) && item.productId > 0) {
    return `/product/${item.productId}${item.variantId && Number.isFinite(item.variantId) ? `?variant=${item.variantId}` : ''}`;
  }
  return null;
};

// Приводим ответ бэкенда к виду, понятному UI
const mapCartResponse = (data) => {
  const items = Array.isArray(data?.cartItems) ? data.cartItems : [];
  return items.map((row) => ({
    id: String(row?.id), // стабильный ключ строки = cartItem.id
    cartItemId: Number(row?.id ?? 0),
    productId: Number(row?.productId ?? 0),
    variantId: Number(row?.variantId ?? NaN), // variantId обязателен, не используем productId как fallback
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
  const [customerNotes, setCustomerNotes] = useState("");
  const [toast, setToast] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");
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
      
      // Обработка 401 - показываем пустую корзину и уведомление
      if (res.status === 401) {
        setItems([]);
        setSelected(new Set());
        setError(""); // Не показываем техническую ошибку
        setAuthToastMessage("Для просмотра корзины необходимо авторизоваться");
        setShowAuthToast(true);
        setLoading(false);
        return;
      }
      
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
          // Если imageUrl уже есть в формате /api/products/{productId}/images/{variantId}, парсим и загружаем
          if (item.image && item.image.startsWith("/api/products/")) {
            const match = item.image.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
            if (match) {
              const productId = match[1];
              const variantId = match[2];
              const imageUrl = await fetchImageUrl(productId, variantId, authToken);
              if (imageUrl) {
                imageMap.set(item.id, imageUrl);
              }
            }
          } 
          // Если imageUrl нет, но есть productId и variantId, загружаем через API
          else if (item.productId && item.variantId && Number.isFinite(item.variantId)) {
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
      // Проверяем, не 401 ли это (может быть в сообщении об ошибке)
      if (e?.message && (e.message.includes("401") || e.message.includes("Unauthorized"))) {
        setItems([]);
        setSelected(new Set());
        setError(""); // Не показываем техническую ошибку
        setAuthToastMessage("Для просмотра корзины необходимо авторизоваться");
        setShowAuthToast(true);
      } else {
        setItems([]);
        setSelected(new Set());
        setError(e?.message || "Не удалось загрузить корзину");
      }
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
  // Функции форматирования и валидации импортированы из утилит
  const formatReceiver = formatName; // formatReceiver это то же самое что formatName

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

  const onPay = async () => {
    // Проверка авторизации
    if (!authToken || authToken === "guest") {
      showToast("Для оформления заказа необходимо авторизоваться", 3000);
      return;
    }

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

    try {
      // Получаем cartItemIds выбранных товаров
      const selectedItems = items.filter((i) => selected.has(i.id));
      const cartItemIds = selectedItems.map((i) => i.cartItemId).filter((id) => id > 0);

      if (cartItemIds.length === 0) {
        showToast("Не удалось определить товары для заказа");
        return;
      }

      // Вычисляем сумму только выбранных товаров
      const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Парсим адрес для формирования billingAddress и shippingAddress
      // Формат адреса: "г. Москва, ул. Ленина, д. 10, кв. 25"
      const addressParts = address.trim().split(",").map((s) => s.trim());
      
      // Нормализуем номер телефона для отправки в API (убираем форматирование, оставляем только цифры)
      // Гарантируем, что номер начинается с 7
      let normalizedPhone = phone.replace(/[\s\-()\+]/g, "");
      if (normalizedPhone.startsWith("8")) {
        normalizedPhone = "7" + normalizedPhone.slice(1);
      }
      if (!normalizedPhone.startsWith("7") && normalizedPhone.length === 10) {
        normalizedPhone = "7" + normalizedPhone;
      }
      
      // Формируем адреса (используем один адрес для обоих)
      // По структуре из API: { name, phone, street }
      const shippingAddress = {
        name: receiver.trim(),
        phone: normalizedPhone,
        street: address.trim(),
      };

      const billingAddress = { ...shippingAddress };

      // Парсим ФИО на отдельные части
      // Порядок: Фамилия Имя Отчество (как в России)
      const fullNameParts = receiver.trim().split(/\s+/).filter(Boolean);
      const lastName = fullNameParts[0] || "";      // Фамилия (первое слово)
      const firstName = fullNameParts[1] || "";     // Имя (второе слово)
      const middleName = fullNameParts.length >= 3 ? fullNameParts[2] : ""; // Отчество (третье слово, если есть)

      // Формируем customerSnapshot по структуре из API
      const customerSnapshot = {
        phone: normalizedPhone,
        last_name: lastName,
        middle_name: middleName,
        first_name: firstName,
        email: "", // Email можно получить из профиля, если нужно
      };

      const requestBody = {
        cartItemIds: cartItemIds,
        billingAddress: billingAddress,
        shippingAddress: shippingAddress,
        customerSnapshot: customerSnapshot,
        customerNotes: customerNotes.trim() || "",
      };

      const headers = {
        "Content-Type": "application/json",
      };

      if (authToken && authToken !== "guest") {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthToastMessage("Для оформления заказа необходимо авторизоваться");
          setShowAuthToast(true);
          return;
        }
        const errorText = await response.text();
        let errorMessage = `Ошибка ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const orderData = await response.json();
      console.log("Order created:", orderData);
      
      // Получаем orderId из ответа
      const orderId = orderData?.id || orderData?.orderId;
      
      if (!orderId) {
        throw new Error("Не удалось получить ID заказа");
      }

      // Маппинг способа оплаты для API (передаем строковые значения как отображаются пользователю)
      const paymentMethodMap = {
        cash: "наличными",
        sbp: "СБП",
        requisites: "По реквизитам"
      };
      
      const apiPaymentMethod = paymentMethodMap[payMethod] || "наличными";
      
      // Вызываем API оплаты
      try {
        const paymentResponse = await fetch(`/api/payments/mock/${orderId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            amount: selectedTotalPrice,
            paymentMethod: apiPaymentMethod,
          }),
        });

        if (!paymentResponse.ok) {
          const errorText = await paymentResponse.text();
          console.warn("Payment API error:", paymentResponse.status, errorText);
          // Не прерываем процесс, заказ уже создан
        } else {
          const paymentData = await paymentResponse.json();
          console.log("Payment created:", paymentData);
        }
      } catch (paymentError) {
        console.error("Error creating payment:", paymentError);
        // Не прерываем процесс, заказ уже создан
      }
      
      showToast("Заказ успешно оформлен!");
      
      // Можно перенаправить на страницу заказа или обновить корзину
      // Например, перезагрузить корзину
      setTimeout(() => {
        fetchCart();
      }, 1500);

    } catch (error) {
      console.error("Error creating order:", error);
      showToast(error.message || "Не удалось оформить заказ. Попробуйте позже.");
    }
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
                              {getProductUrl(i) ? (
                                <Link
                                  to={getProductUrl(i)}
                                  className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded"
                                >
                                  <img
                                    src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                    alt={i.name}
                                    className="w-[80px] h-[110px] object-contain"
                                    onError={(e) => {
                                      e.currentTarget.src = "/korm1.svg";
                                    }}
                                  />
                                </Link>
                              ) : (
                                <img
                                  src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                  alt={i.name}
                                  className="w-[80px] h-[110px] object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = "/korm1.svg";
                                  }}
                                />
                              )}
                            </div>

                            <div className="pl-2">
                              {getProductUrl(i) ? (
                                <Link
                                  to={getProductUrl(i)}
                                  className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded hover:text-[#6F2A2B] transition-colors"
                                >
                                  <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                    {i.name}
                                  </p>
                                </Link>
                              ) : (
                                <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                  {i.name}
                                </p>
                              )}
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
                                {getProductUrl(i) ? (
                                  <Link
                                    to={getProductUrl(i)}
                                    className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded h-full"
                                  >
                                    <img
                                      src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                      alt={i.name}
                                      className="object-contain w-full h-full"
                                      onError={(e) => {
                                        e.currentTarget.src = "/korm1.svg";
                                      }}
                                    />
                                  </Link>
                                ) : (
                                  <img
                                    src={imageUrls.get(i.id) || i.image || "/korm1.svg"}
                                    alt={i.name}
                                    className="object-contain w-full h-full"
                                    onError={(e) => {
                                      e.currentTarget.src = "/korm1.svg";
                                    }}
                                  />
                                )}
                              </div>
                              <div className="flex-1">
                                {getProductUrl(i) ? (
                                  <Link
                                    to={getProductUrl(i)}
                                    className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded hover:text-[#6F2A2B] transition-colors"
                                  >
                                    <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                      {i.name}
                                    </p>
                                  </Link>
                                ) : (
                                  <p className="text-[15px] text-[#1E1E1E] leading-tight">
                                    {i.name}
                                  </p>
                                )}
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
                    <p className="text-[#6F2A2B] mb-3">Способ оплаты</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-[15px] cursor-pointer hover:opacity-80">
                        <input
                          type="radio"
                          name="pay"
                          value="cash"
                          checked={payMethod === "cash"}
                          onChange={() => setPayMethod("cash")}
                          className="accent-[#6F2A2B]"
                        />
                        Наличными
                      </label>
                      <label className="flex items-center gap-2 text-[15px] cursor-pointer hover:opacity-80">
                        <input
                          type="radio"
                          name="pay"
                          value="sbp"
                          checked={payMethod === "sbp"}
                          onChange={() => setPayMethod("sbp")}
                          className="accent-[#6F2A2B]"
                        />
                        СБП
                      </label>
                      <label className="flex items-center gap-2 text-[15px] cursor-pointer hover:opacity-80">
                        <input
                          type="radio"
                          name="pay"
                          value="requisites"
                          checked={payMethod === "requisites"}
                          onChange={() => setPayMethod("requisites")}
                          className="accent-[#6F2A2B]"
                        />
                        По реквизитам
                      </label>
                    </div>
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
                        <p className="text-gray-500 text-xs mt-1">Пример: +7 (999) 123-45-67</p>
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
                    
                    {/* Комментарий клиента */}
                    <div className="mb-4">
                      <Label htmlFor="customerNotes" className="text-[#6F2A2B] text-[15px] mb-2 block">
                        Комментарий к заказу
                      </Label>
                      <Textarea
                        id="customerNotes"
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Например: не звонить, оставить у двери, позвонить за час и т.д."
                        className="w-full min-h-[100px] border-[#E2E2E2] text-[14px] placeholder:text-[#B0B0B0] resize-y"
                        maxLength={500}
                      />
                      {customerNotes.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {customerNotes.length}/500 символов
                        </p>
                      )}
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
        <AuthToast 
          show={showAuthToast} 
          onClose={() => setShowAuthToast(false)}
          message={authToastMessage}
        />
      </PageFade>
      <Footer />
    </div>
  );
}