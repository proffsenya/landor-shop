// client/pages/Favorites.jsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import ProductsSection from "../components/ProductsSection";
import { PageFade, ListMotion, ToastMotion } from "@/utils/PageAnimations";
import { motion, AnimatePresence } from "framer-motion";

const getAuthToken = () => {
  if (typeof window === "undefined") return "guest";
  return (
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    "guest"
  );
};

const favsKeyByToken = (token) => `favs:variants:${token || "guest"}`;

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const authToken = getAuthToken();

  // ===== загрузка избранного =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/favorites", {
          headers:
            authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {},
        });
        if (!res.ok) {
          let body = "";
          try { body = await res.text(); } catch {}
          throw new Error(`HTTP ${res.status}${body ? ` · ${body}` : ""}`);
        }
        const data = await res.json();
        if (!mounted) return;

        // ВАЖНО: храним и favoriteId (id записи), и variantId (что нужно для DELETE /favorites/{variantId})
        const mapped = Array.isArray(data)
          ? data.map((item) => ({
              favoriteId: Number(item.favoriteId ?? item.id),           // id записи (если бэк его даёт)
              variantId: Number(item.variantId ?? item.id),             // пытаемся получить настоящий variantId
              id: Number(item.variantId ?? item.id),                    // используем variantId как ключ для выбора/удаления
              name: item.displayName,
              price: Number(item.price ?? 0),
              image: item.imageUrl || "/korm1.svg",
              isInStock: Number(item.stock) > 0,
              weight: item.weight || "—",
              dateAdded: new Date().toLocaleDateString("ru-RU"),
            }))
          : [];

        setFavorites(mapped);
      } catch (e) {
        console.warn("Ошибка загрузки избранного:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authToken]);

  const favoriteIds = useMemo(() => new Set(favorites.map((i) => i.id)), [favorites]);
  const allSelected =
    selected.size > 0 && favorites.length > 0 && favorites.every((i) => selected.has(i.id));
  const isEmpty = !loading && favorites.length === 0;

  const formatPrice = (price) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);

  const showToast = (msg, ms = 1500) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

  const toggleAll = () => {
    setSelected((prev) => (allSelected ? new Set() : new Set(favorites.map((i) => i.id))));
  };

  const toggleOne = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      for (const x of Array.from(next)) if (!favoriteIds.has(x)) next.delete(x);
      return next;
    });
  };

  // ===== helpers: DELETE по variantId с фолбэками =====
  async function apiDeleteFavorite(variantId) {
    const headers = authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};

    // 1) DELETE /api/favorites/{variantId}
    try {
      const res = await fetch(`/api/favorites/${encodeURIComponent(variantId)}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) return true;
      const body = await safeText(res);
      console.warn(`[favorites] DELETE /favorites/${variantId} -> ${res.status}`, body);
      if (![400, 404, 405, 415].includes(res.status)) return false; // другие ошибки — стоп
    } catch (e) {
      console.warn(`[favorites] path delete error`, e);
    }

    // 2) DELETE /api/favorites?variantId=...
    try {
      const res = await fetch(`/api/favorites?variantId=${encodeURIComponent(variantId)}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) return true;
      const body = await safeText(res);
      console.warn(`[favorites] DELETE /favorites?variantId=${variantId} -> ${res.status}`, body);
      if (![400, 404, 405, 415].includes(res.status)) return false;
    } catch (e) {
      console.warn(`[favorites] query delete error`, e);
    }

    // 3) DELETE /api/favorites с JSON-teleм { variantId }
    try {
      const res = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: Number(variantId) }),
      });
      if (res.ok) return true;
      const body = await safeText(res);
      console.warn(`[favorites] DELETE /favorites (body) -> ${res.status}`, body);
      return false;
    } catch (e) {
      console.warn(`[favorites] body delete error`, e);
      return false;
    }
  }

  // ===== helpers: DELETE all с фолбэком тела =====
  async function deleteAllFavorites() {
    const headers = authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};

    // 1) без тела
    try {
      const res = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) return true;
      const body = await safeText(res);
      console.warn(`[favorites] DELETE ALL (no body) -> ${res.status}`, body);
      if (![400, 404, 405, 415, 500].includes(res.status)) return false;
    } catch (e) {
      console.warn(`[favorites] delete-all no body error`, e);
    }

    // 2) с телом { all: true }
    try {
      const res = await fetch(`/api/favorites`, {
        method: "DELETE",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) return true;
      const body = await safeText(res);
      console.warn(`[favorites] DELETE ALL (body) -> ${res.status}`, body);
      return false;
    } catch (e) {
      console.warn(`[favorites] delete-all body error`, e);
      return false;
    }
  }

  async function safeText(res) {
    try { return await res.text(); } catch { return ""; }
  }

  // ===== Удаление (всё / выбранные) =====
  const removeSelected = async () => {
    if (favorites.length === 0) return;
    const key = favsKeyByToken(authToken);

    try {
      if (allSelected) {
        const ok = await deleteAllFavorites();
        if (!ok) {
          showToast("Сервер не удалил все избранные (см. консоль)", 2000);
          return;
        }
        setFavorites([]);
        setSelected(new Set());
        sessionStorage.setItem(key, "[]");
        showToast("Все товары удалены из избранного");
      } else {
        const toDelete = Array.from(selected).map((x) => Number(x)); // x — это variantId
        for (const variantId of toDelete) {
          const ok = await apiDeleteFavorite(variantId);
          if (!ok) console.warn(`Не удалось удалить variantId=${variantId}`);
        }
        const updated = favorites.filter((i) => !selected.has(i.id));
        setFavorites(updated);
        setSelected(new Set());
        sessionStorage.setItem(key, JSON.stringify(updated.map((i) => String(i.id))));
        showToast("Выбранные товары удалены");
      }
    } catch (err) {
      console.warn("Ошибка удаления избранного:", err);
      showToast("Ошибка при удалении", 2000);
    }
  };

  // ===== Добавить выбранные в корзину =====
  const addAllToCart = async () => {
    const inStockItems = favorites.filter(
      (item) => item.isInStock && selected.has(item.id)
    );
    if (inStockItems.length === 0) {
      showToast("Нет товаров в наличии");
      return;
    }

    try {
      for (const item of inStockItems) {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({ variantId: Number(item.id), quantity: 1 }),
        });
        if (!res.ok) {
          const body = await safeText(res);
          console.warn(`Ошибка добавления в корзину (variantId=${item.id}): HTTP ${res.status} · ${body}`);
        }
      }
      showToast(`Добавлено в корзину: ${inStockItems.length}`);
    } catch (e) {
      console.warn("Ошибка добавления:", e);
      showToast("Не удалось добавить в корзину", 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="container mx-auto px-4 sm:px-6 lg:px-[80px] py-6 sm:py-8 lg:py-10">
          <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-10 lg:mb-20">
            Избранное
          </h1>

          {loading && (
            <div className="flex justify-center py-20 text-gray-500 text-lg">
              Загрузка избранного...
            </div>
          )}

          {(!loading && favorites.length === 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16"
            >
              <img src="/empty.svg" alt="Избранное пусто" className="h-auto mb-4 w-60 sm:w-72 sm:mb-6" />
              <p className=" text-[16px] sm:text-[18px] mb-3 sm:mb-4">Избранное ждёт товаров</p>
              <Link to="/catalog" className="bg-[#6F2A2B] text-white px-5 py-2.5 rounded-full hover:bg-[#5a2223] transition-colors text-sm sm:text-base">
                За покупками
              </Link>
            </motion.div>
          )}

          {!loading && favorites.length > 0 && (
            <>
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                <div className="flex items-center justify-between mb-2">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#6F2A2B]"
                    />
                    <span>Выбрать все</span>
                  </label>

                  <button
                    onClick={removeSelected}
                    className="text-[#B00020] text-sm hover:opacity-80 disabled:opacity-40"
                    disabled={selected.size === 0 && !allSelected}
                  >
                    Удалить выбранные
                  </button>
                </div>

                <ListMotion
                  items={favorites}
                  renderItem={(item) => (
                    <div className="rounded-xl border border-[#E8E8E8] p-4 bg-white">
                      <div className="flex items-start gap-3">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={selected.has(item.id)}
                            onChange={() => toggleOne(item.id)}
                            className="w-4 h-4 accent-[#6F2A2B]"
                          />
                        </div>

                        <div className="flex-shrink-0 w-20 overflow-hidden rounded-md h-28 bg-gray-50">
                          <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[15px] text-[#1E1E1E] leading-tight line-clamp-3">
                            {item.name}
                          </div>

                          <div className="flex flex-wrap items-center mt-2 text-sm gap-x-4 gap-y-1">
                            <span className="text-[#1E1E1E]">Вес: {item.weight}</span>
                            <span className="text-[#8B8B8B]">{item.dateAdded}</span>
                          </div>

                          <div className="mt-2 text-sm">
                            <span className={item.isInStock ? "text-green-600" : "text-red-600"}>
                              {item.isInStock ? "В наличии" : "Нет в наличии"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="text-base font-medium text-[#1E1E1E]">
                              {formatPrice(item.price)}
                            </div>
                            {item.isInStock && (
                              <button className="h-[40px] px-4 rounded-[10px] bg-[#6F2A2B] text-white text-[15px] hover:bg-[#5a2223]">
                                В корзину
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-[#E8E8E8] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[#1E1E1E] text-[15px] border-b border-[#E8E8E8]">
                        <th className="px-5 py-3 text-left font-normal w-[160px]">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <span>Выбрать все</span>
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={toggleAll}
                              className="w-4 h-4 accent-[#6F2A2B]"
                            />
                          </label>
                        </th>
                        <th className="px-5 py-3 font-normal text-left">Товар</th>
                        <th className="px-5 py-3 font-normal text-left">Вес</th>
                        <th className="px-5 py-3 font-normal text-left">Стоимость</th>
                        <th className="px-5 py-3 font-normal text-left">Дата добавления</th>
                        <th className="px-5 py-3 font-normal text-left">Статус</th>
                      </tr>
                    </thead>
                    <motion.tbody initial={false}>
                      <AnimatePresence mode="sync">
                        {favorites.map((item) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="border-b border-[#E2E2E2]"
                          >
                            <td className="px-5 py-6 text-center align-middle">
                              <input
                                type="checkbox"
                                checked={selected.has(item.id)}
                                onChange={() => toggleOne(item.id)}
                                className="w-4 h-4 accent-[#6F2A2B]"
                              />
                            </td>
                            <td className="px-5 py-6">
                              <div className="flex items-center gap-6">
                                <div className="w-[64px] h-[96px] overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="object-contain w-full h-full" />
                                </div>
                                <div className="text-[15px] text-[#1E1E1E] leading-tight pr-6 line-clamp-3">
                                  {item.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-6">{item.weight}</td>
                            <td className="px-5 py-6">{formatPrice(item.price)}</td>
                            <td className="px-5 py-6 text-[#8B8B8B]">{item.dateAdded}</td>
                            <td className="px-5 py-6">
                              <span className={item.isInStock ? "text-green-600" : "text-red-600"}>
                                {item.isInStock ? "В наличии" : "Нет в наличии"}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </motion.tbody>
                  </table>
                </div>
              </div>

              {/* Панель */}
              <div className="flex flex-col items-stretch justify-between gap-4 mt-6 sm:flex-row sm:items-center">
                <Link to="/catalog" className="inline-flex items-center justify-center text-[#5A5A5A] hover:text-[#1E1E1E]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  В каталог
                </Link>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={removeSelected}
                    className="text-[#B00020] hover:opacity-80 disabled:opacity-40"
                    disabled={selected.size === 0 && !allSelected}
                  >
                    Удалить выбранные
                  </button>

                  <button
                    onClick={addAllToCart}
                    className="inline-flex items-center justify-center h-[44px] px-4 rounded-[10px] bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Добавить в корзину
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-12">
          <ProductsSection title="Рекомендовано для Вас" />
        </div>

        <ToastMotion show={!!toast}>{toast}</ToastMotion>
      </PageFade>
      <Footer />
    </div>
  );
}
