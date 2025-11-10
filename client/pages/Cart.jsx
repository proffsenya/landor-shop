// client/pages/Cart.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  return items.map((row, idx) => ({
    id:
      row?.id ??
      `${row?.productId ?? "p"}-${row?.variantId ?? "v"}-${idx}`, // безопасный ключ
    productId: row?.productId ?? null,
    variantId: row?.variantId ?? null,
    name: row?.displayName || row?.productName || "Товар",
    // показываем актуальную цену, если есть; иначе — цену на момент добавления
    price: Number(row?.currentPrice ?? row?.priceAtAdded ?? row?.price ?? 0),
    quantity: Math.max(1, Number(row?.quantity ?? 1)),
    // если бек отдаёт imageUrl — берём его; иначе плейсхолдер
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

  const [selected, setSelected] = useState(new Set());
  const [payMethod, setPayMethod] = useState("cash");
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [toast, setToast] = useState("");

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
    const variantId = item.variantId != null ? Number(item.variantId) : null;
    const cartItemId = item.id != null ? String(item.id) : null;

    // 1) попытка: DELETE с JSON-телом { variantId } или { cartItemId }
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          variantId != null ? { variantId } : { cartItemId }
        ),
      });
      if (res.ok) return true;

      // Если сервер не принимает тело (400/405/415) — пробуем query
      if ([400, 405, 415].includes(res.status)) {
        const qp = new URLSearchParams(
          variantId != null
            ? { variantId: String(variantId) }
            : { cartItemId: String(cartItemId || "") }
        ).toString();

        const res2 = await fetch(`/api/cart?${qp}`, {
          method: "DELETE",
          headers: {
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
        });
        if (res2.ok) return true;

        if (variantId == null && cartItemId) {
          return false;
        }
        return false;
      }

      return false;
    } catch {
      return false;
    }
  }

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

    // оптимистично уберём из UI
    setItems((prev) => prev.filter((i) => i.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    const ok = await apiRemoveCartItem(item);

    if (ok) {
      showToast("Товар удалён из корзины");

      // синхронизация sessionStorage для кнопки «В корзину» в карточках
      if (item.variantId != null) {
        const setCart = loadSet(cartKey);
        setCart.delete(String(item.variantId));
        saveSet(cartKey, setCart);
      }

      // при необходимости можно подтянуть корзину заново:
      // await fetchCart();
    } else {
      // откат, если сервер не подтвердил
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

  const onPay = () => {
    showToast("Переход к оплате…");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="container mx-auto px-4 sm:px-6 lg:px-[80px] py-8 lg:py-10">
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
                                src={i.image}
                                alt={i.name}
                                className="w-[80px] h-[110px] object-contain"
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
                                  onClick={() => updateQuantity(i.id, i.quantity + 1)}
                                  className="w-10 text-lg leading-none"
                                  aria-label="Увеличить"
                                >
                                  +
                                </button>
                                <span>{i.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(i.id, i.quantity - 1)}
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
                                  src={i.image}
                                  alt={i.name}
                                  className="object-contain w-full h-full"
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
                                    onClick={() => updateQuantity(i.id, i.quantity + 1)}
                                    className="w-10 text-lg leading-none"
                                    aria-label="Увеличить"
                                  >
                                    +
                                  </button>
                                  <span>{i.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(i.id, i.quantity - 1)}
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
                    <input
                      value={receiver}
                      onChange={(e) => setReceiver(e.target.value)}
                      placeholder="ФИО получателя"
                      className="w-full h-[40px] border border-[#E2E2E2] rounded px-3 text-[14px] mb-3 placeholder:text-[#B0B0B0]"
                    />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Номер телефона"
                      className="w-full h-[40px] border border-[#E2E2E2] rounded px-3 text-[14px] mb-3 placeholder:text-[#B0B0B0]"
                    />
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Адрес доставки"
                      className="w-full h-[40px] border border-[#E2E2E2] rounded px-3 text-[14px] mb-4 placeholder:text-[#B0B0B0]"
                    />
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
