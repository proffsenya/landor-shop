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
  return localStorage.getItem("authToken") || "guest";
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const token = getAuthToken();

  // ===== Загрузка избранных товаров =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/favorites", {
          headers: token !== "guest" ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!mounted) return;
        const mapped = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              name: item.displayName,
              price: item.price,
              image: item.imageUrl || "/korm1.svg",
              isInStock: item.stock > 0,
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
    return () => {
      mounted = false;
    };
  }, [token]);

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

  const removeSelected = () => {
    if (selected.size === 0) return;
    setFavorites((prev) => prev.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    setToast("Удалено из избранного");
    setTimeout(() => setToast(""), 1500);
  };

  const addAllToCart = async () => {
    const inStockItems = favorites.filter((item) => item.isInStock && selected.has(item.id));
    if (inStockItems.length === 0) {
      setToast("Нет товаров в наличии");
      setTimeout(() => setToast(""), 1500);
      return;
    }

    try {
      for (const item of inStockItems) {
        await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ variantId: item.id, quantity: 1 }),
        });
      }
      setToast(`Добавлено в корзину: ${inStockItems.length}`);
      setTimeout(() => setToast(""), 1500);
    } catch (e) {
      console.warn("Ошибка добавления:", e);
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

          {/* ===== LOADING ===== */}
          {loading && (
            <div className="flex justify-center py-20 text-gray-500 text-lg">
              Загрузка избранного...
            </div>
          )}

          {/* ===== ПУСТОЕ СОСТОЯНИЕ ===== */}
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-12 sm:py-16"
            >
              <img
                src="/empty.svg"
                alt="Избранное пусто"
                className="h-auto mb-4 w-60 sm:w-72 sm:mb-6"
              />
              <p className=" text-[16px] sm:text-[18px] mb-3 sm:mb-4">Избранное ждёт товаров</p>
              <Link
                to="/catalog"
                className="bg-[#6F2A2B] text-white px-5 py-2.5 rounded-full hover:bg-[#5a2223] transition-colors text-sm sm:text-base"
              >
                За покупками
              </Link>
            </motion.div>
          )}

          {/* ===== КОНТЕНТ ===== */}
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
                    disabled={selected.size === 0}
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
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain w-full h-full"
                          />
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
                            <span
                              className={item.isInStock ? "text-green-600" : "text-red-600"}
                            >
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
                        <th className="px-5 py-3 font-normal text-left"></th>
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
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="object-contain w-full h-full"
                                  />
                                </div>
                                <div className="text-[15px] text-[#1E1E1E] leading-tight pr-6 line-clamp-3">
                                  {item.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-6 text-[15px] text-[#1E1E1E] whitespace-nowrap">
                              {item.weight}
                            </td>
                            <td className="px-5 py-6 text-[15px] text-[#1E1E1E] whitespace-nowrap">
                              {formatPrice(item.price)}
                            </td>
                            <td className="px-5 py-6 text-[15px] text-[#8B8B8B] whitespace-nowrap">
                              {item.dateAdded}
                            </td>
                            <td className="px-5 py-6 text-[15px] whitespace-nowrap">
                              <span className={item.isInStock ? "text-green-600" : "text-red-600"}>
                                {item.isInStock ? "В наличии" : "Нет в наличии"}
                              </span>
                            </td>
                            <td className="px-5 py-6 text-right whitespace-nowrap">
                              {item.isInStock && (
                                <button className="h-[40px] px-4 rounded-[10px] bg-[#6F2A2B] text-white text-[15px] hover:bg-[#5a2223]">
                                  Добавить в корзину
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </motion.tbody>
                  </table>
                </div>
              </div>

              {/* Нижняя панель */}
              <div className="flex flex-col items-stretch justify-between gap-4 mt-6 sm:flex-row sm:items-center">
                <Link
                  to="/catalog"
                  className="inline-flex items-center justify-center text-[#5A5A5A] hover:text-[#1E1E1E]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  В каталог
                </Link>

                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={removeSelected}
                    className="text-[#B00020] hover:opacity-80 disabled:opacity-40"
                    disabled={selected.size === 0}
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
