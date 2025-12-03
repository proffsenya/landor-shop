// client/pages/Favorites.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { PageFade, ListMotion, ToastMotion } from "@/utils/PageAnimations";
import { motion, AnimatePresence } from "framer-motion";
import { AuthToast } from "@/components/AuthToast";

import { getAuthToken } from "@/utils/auth";

const favsKeyByToken = (token) => `favs:variants:${token || "guest"}`;

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");
  const authToken = getAuthToken();

  // ===== функция загрузки избранного =====
  const loadFavorites = useCallback(async () => {
    let mounted = true;
    setLoading(true);
    (async () => {
      // Проверка авторизации
      if (!authToken || authToken === "guest") {
        if (mounted) {
          setFavorites([]);
          setLoading(false);
          setAuthToastMessage("Для просмотра избранного необходимо авторизоваться");
          setShowAuthToast(true);
        }
        return;
      }

      try {
        const res = await fetch("/api/favorites", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        
        // Обработка 401 - показываем пустое избранное и уведомление
        if (res.status === 401) {
          if (mounted) {
            setFavorites([]);
            setLoading(false);
            setAuthToastMessage("Для просмотра избранного необходимо авторизоваться");
            setShowAuthToast(true);
          }
          return;
        }
        
        if (!res.ok) {
          let body = "";
          try { body = await res.text(); } catch {}
          throw new Error(`HTTP ${res.status}${body ? ` · ${body}` : ""}`);
        }
        const data = await res.json();
        if (!mounted) return;

        // ВАЖНО: храним и favoriteId (id записи), и variantId (что нужно для DELETE /favorites/{variantId})
        const dataArray = Array.isArray(data) ? data : [];
        const mapped = dataArray.map((item) => {
              console.log("[Favorites] Processing item:", item);
              
              let productId = NaN;
              let variantId = NaN;
              
              // ВАЖНО: variantId - это id записи избранного (item.id)
              if (item.id !== undefined && item.id !== null) {
                variantId = Number(item.id);
              }
              
              // Извлекаем variantId из явных полей (если есть, перезаписываем)
              if (item.variantId !== undefined && item.variantId !== null) {
                variantId = Number(item.variantId);
              } else if (item.variantID !== undefined && item.variantID !== null) {
                variantId = Number(item.variantID);
              } else if (item.variant_id !== undefined && item.variant_id !== null) {
                variantId = Number(item.variant_id);
              } else if (item.variant !== undefined && item.variant !== null) {
                variantId = Number(item.variant);
              }
              
              // Извлекаем productId из явных полей (приоритет 1)
              if (item.productId !== undefined && item.productId !== null) {
                productId = Number(item.productId);
              } else if (item.productID !== undefined && item.productID !== null) {
                productId = Number(item.productID);
              } else if (item.product_id !== undefined && item.product_id !== null) {
                productId = Number(item.product_id);
              } else if (item.parentId !== undefined && item.parentId !== null && Number.isFinite(Number(item.parentId))) {
                productId = Number(item.parentId);
              }
              
              // Извлекаем productId из imageUrl (если не был найден ранее)
              if (!Number.isFinite(productId) && item.imageUrl && item.imageUrl.startsWith("/api/products/")) {
                  const match = item.imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
                if (match) {
                  productId = Number(match[1]);
                }
              }
              
              return {
                // id — это id записи избранного (нужен для удаления конкретной записи)
                id: Number(item.id),

                // ВАЖНО: variantId — то, что требуется для move-to-cart и для добавления в корзину
                // variantId = item.id (id записи избранного)
                variantId: Number.isFinite(variantId) && variantId > 0 ? variantId : NaN,

                // productId для навигации на страницу товара
                productId: Number.isFinite(productId) && productId > 0 ? productId : NaN,

                name: item.displayName,
                price: Number(item.price ?? 0),
                image: item.imageUrl || "/korm1.svg",
                isInStock: Number(item.stock) > 0,
                weight: item.weight || "—",
                dateAdded: new Date().toLocaleDateString("ru-RU"),
              };
            });





        setFavorites(mapped);
        
        // Сохраняем в sessionStorage для синхронизации
        const key = favsKeyByToken(authToken);
        const variantIds = mapped
          .map((item) => item.variantId)
          .filter((id) => Number.isFinite(id) && id > 0)
          .map(String);
        sessionStorage.setItem(key, JSON.stringify(variantIds));
      } catch (e) {
        // Проверяем, не 401 ли это (может быть в сообщении об ошибке)
        if (e?.message && (e.message.includes("401") || e.message.includes("Unauthorized"))) {
          if (mounted) {
            setFavorites([]);
            setLoading(false);
            setAuthToastMessage("Для просмотра избранного необходимо авторизоваться");
            setShowAuthToast(true);
          }
        } else {
        console.warn("Ошибка загрузки избранного:", e);
          if (mounted) {
            setFavorites([]);
            setLoading(false);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [authToken]);

  // Вызываем loadFavorites при монтировании и изменении authToken
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Слушаем события обновления избранного - делаем легкий fetch только при изменениях
  useEffect(() => {
    const handleFavoritesUpdate = () => {
      console.log("[Favorites] Favorites update event received, checking for changes...");
      // Проверяем, изменился ли список в sessionStorage
      const key = favsKeyByToken(authToken);
      const storedIds = (() => {
        try {
          const raw = sessionStorage.getItem(key);
          if (!raw) return [];
          return JSON.parse(raw);
        } catch {
          return [];
        }
      })();
      
      // Сравниваем текущий список с хранимым
      const currentVariantIds = favorites
        .map((item) => item.variantId)
        .filter((id) => Number.isFinite(id) && id > 0)
        .map(String)
        .sort();
      const storedVariantIds = storedIds.sort();
      
      const idsChanged = 
        currentVariantIds.length !== storedVariantIds.length ||
        currentVariantIds.some((id, idx) => id !== storedVariantIds[idx]);
      
      if (idsChanged) {
        // Только если список действительно изменился, делаем легкий fetch
        console.log("[Favorites] List changed, fetching updated data...");
        loadFavorites();
      } else {
        console.log("[Favorites] No changes detected, skipping fetch");
      }
    };

    window.addEventListener("favorites:update", handleFavoritesUpdate);

    return () => {
      window.removeEventListener("favorites:update", handleFavoritesUpdate);
    };
  }, [authToken, favorites, loadFavorites]);

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
  // ===== helpers: DELETE по id из /api/favorites =====
async function apiDeleteFavorite(id) {
  const headers = authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};

  // основной вариант
  try {
    const res = await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    if (res.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (res.ok) return true;
    const body = await safeText(res);
    console.warn(`[favorites] DELETE /favorites/${id} -> ${res.status}`, body);
    if (![400,404,405,415].includes(res.status)) return false;
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
    console.warn("[favorites] path delete error", e);
  }

  // фолбэк через query
  try {
    const res = await fetch(`/api/favorites?variantId=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    if (res.ok) return true;
    const body = await safeText(res);
    console.warn(`[favorites] DELETE /favorites?variantId=${id} -> ${res.status}`, body);
  } catch (e) {
    console.warn("[favorites] query delete error", e);
  }

  // фолбэк через тело
  try {
    const res = await fetch(`/api/favorites`, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id) }),
    });
    if (res.ok) return true;
    const body = await safeText(res);
    console.warn(`[favorites] DELETE /favorites (body) -> ${res.status}`, body);
  } catch (e) {
    console.warn("[favorites] body delete error", e);
  }

  return false;
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

  // какие именно id удаляем
  const toDelete = allSelected
    ? favorites.map((i) => i.id)
    : Array.from(selected);

  if (toDelete.length === 0) return;

  const headers =
    authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};

  const failed = new Set();

  // последовательно или параллельно — выбери сам; ниже параллельно
  let has401 = false;
  await Promise.all(
    toDelete.map(async (id) => {
      try {
        const res = await fetch(`/api/favorites/${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers,
        });
        if (res.status === 401) {
          has401 = true;
          failed.add(id);
          return;
        }
        if (!res.ok) {
          const body = await safeText(res);
          console.warn(`[favorites] DELETE /favorites/${id} -> ${res.status}`, body);
          failed.add(id);
        }
      } catch (e) {
        console.warn(`[favorites] delete error id=${id}`, e);
        failed.add(id);
      }
    })
  );

  if (has401) {
    setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
    setShowAuthToast(true);
    return;
  }

  // успешные = toDelete \ failed
  const succeeded = new Set(toDelete.filter((id) => !failed.has(id)));

  // обновляем список
  setFavorites((prev) => prev.filter((i) => !succeeded.has(i.id)));

  // в selected оставим только то, что не удалилось
  setSelected((prev) => {
    const next = new Set(prev);
    for (const id of succeeded) next.delete(id);
    return next;
  });

  // sessionStorage: храним id оставшихся
  const key = favsKeyByToken(authToken);
  const after = favorites
    .filter((i) => !succeeded.has(i.id))
    .map((i) => String(i.id));
  sessionStorage.setItem(key, JSON.stringify(after));

  // бейдж в шапке
  try { window.dispatchEvent(new Event("favorites:update")); } catch {}

  if (failed.size === 0) {
    showToast("Выбранные товары удалены");
  } else if (failed.size === toDelete.length) {
    showToast("Не удалось удалить выбранные (см. консоль)", 2000);
  } else {
    showToast(
      `Удалено: ${toDelete.length - failed.size}, не удалено: ${failed.size}`,
      2000
    );
  }
};

async function moveFavoritesToCart(variantIdsRaw) {
  const headers =
    authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  const all = (variantIdsRaw || []).map((x) => Number(x)).filter(Number.isFinite);

  if (all.length === 0) return { ok: false, moved: new Set() };

  try {
    const res = await fetch("/api/favorites/move-to-cart", {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      // Вариант 1 (рабочий у тебя): сырым массивом чисел
      body: JSON.stringify(all),
    });
    if (res.ok) {
      return { ok: true, moved: new Set(all) };
    }
    const body = await safeText(res);
    console.warn("[move-to-cart] raw array ->", res.status, body);
    return { ok: false, moved: new Set() };
  } catch (e) {
    console.warn("[move-to-cart] error", e);
    return { ok: false, moved: new Set() };
  }
}



  // ===== Добавить выбранные в корзину =====
  const addAllToCart = async () => {
  // Берём только отмеченные позиции
  const chosen = favorites.filter((f) => selected.has(f.id));

  if (chosen.length === 0) {
    showToast("Выберите товары");
    return;
  }

  // Можно отправлять любые (в наличии и нет) — бэк сам решит.
  const toMoveVariantIds = chosen.map((f) => f.variantId);

  const { ok, moved } = await moveFavoritesToCart(toMoveVariantIds);
  if (!ok) {
    showToast("Не удалось добавить в корзину", 2000);
    return;
  }

  // Убираем перемещённые из локального списка (по variantId)
  setFavorites((prev) => prev.filter((f) => !moved.has(f.variantId)));

  // Чистим выделение от того, чего больше нет
  setSelected((prev) => {
    const next = new Set(prev);
    for (const f of chosen) next.delete(f.id);
    return next;
  });

  // Синхронизируем sessionStorage избранного (храним id записей)
  const key = favsKeyByToken(authToken);
  const afterIds = favorites
    .filter((f) => !moved.has(f.variantId))
    .map((f) => String(f.id));
  sessionStorage.setItem(key, JSON.stringify(afterIds));

  // Обновим бейджи
  try { window.dispatchEvent(new Event("favorites:update")); } catch {}
  try { window.dispatchEvent(new Event("cart:update")); } catch {}

  showToast(`Добавлено в корзину: ${moved.size}`);
};


  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-[80px] py-6 sm:py-8 lg:py-10">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Избранное" }
          ]} />
          <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-10 lg:mb-20">
            Избранное
          </h1>

          {loading && (
            <div className="flex justify-center py-20 text-lg text-gray-500">
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
                              <button
                                className="h-[40px] px-4 rounded-[10px] bg-[#6F2A2B] text-white text-[15px] hover:bg-[#5a2223]"
                                onClick={async () => {
                                  const { ok, moved } = await moveFavoritesToCart([item.variantId]);
                                  if (ok && moved.has(item.variantId)) {
                                    // убрать товар из локального избранного
                                    setFavorites((prev) => prev.filter((x) => x.variantId !== item.variantId));
                                    setSelected((prev) => {
                                      const next = new Set(prev);
                                      next.delete(item.id);
                                      return next;
                                    });

                                    // обновить sessionStorage (храним variantId)
                                    const key = favsKeyByToken(authToken);
                                    const after = favorites
                                      .filter((x) => x.variantId !== item.variantId)
                                      .map((x) => String(x.variantId));
                                    sessionStorage.setItem(key, JSON.stringify(after));

                                    try { window.dispatchEvent(new Event("favorites:update")); } catch {}
                                    try { window.dispatchEvent(new Event("cart:update")); } catch {}
                                    showToast("Перенесено в корзину");
                                  } else {
                                    showToast("Не удалось добавить", 1800);
                                  }
                                }}
                              >
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
                        <th className="px-5 py-3 font-normal text-center">Вес</th>
                        <th className="px-5 py-3 font-normal text-center">Стоимость</th>
                        <th className="px-5 py-3 font-normal text-center">Дата добавления</th>
                        <th className="px-5 py-3 font-normal text-center">Статус</th>
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
                            <td className="px-5 py-6 text-center">{item.weight}</td>
                            <td className="px-5 py-6 text-center">{formatPrice(item.price)}</td>
                            <td className="px-5 py-6 text-center text-[#8B8B8B]">{item.dateAdded}</td>
                            <td className="px-5 py-6 text-center">
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

              <div className="flex-col items-stretch justify-between hidden gap-4 mt-6 md:flex sm:flex-row sm:items-center">
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
        </div>

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
