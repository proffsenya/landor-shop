import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
import { ScalePulse, FadeSwitch } from "../utils/ActionAnimations";

// ---- helpers: storage by authToken ------------------------------------------
const STORAGE_CART = (authToken) => `cart:variants:${authToken || "guest"}`;
const STORAGE_FAVS = (authToken) => `favs:variants:${authToken || "guest"}`;

const getAuthToken = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("authToken") || "guest";
};

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

export default function ProductCard({
  productId,
  variantId,
  image,
  title,
  price,
  to,
  stock,
}) {
  const productUrl =
    to ??
    (variantId != null && productId != null
      ? `/product/${encodeURIComponent(productId)}?variant=${encodeURIComponent(variantId)}`
      : "#");

  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  const numericStock = Number(stock);
  const available = Number.isFinite(numericStock) && numericStock >= 1;

  const authToken = getAuthToken();
  const cartKey = STORAGE_CART(authToken);
  const favsKey = STORAGE_FAVS(authToken);

  // ---- Инициализация из sessionStorage ----
  useEffect(() => {
    if (!variantId) return;
    const cartSet = loadSet(cartKey);
    const favSet = loadSet(favsKey);
    setInCart(cartSet.has(String(variantId)));
    setIsFavorite(favSet.has(String(variantId)));
  }, [variantId, cartKey, favsKey]);

  // ---- Добавить в корзину ----
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!available || !variantId) return;
    if (inCart) return; // уже в корзине — не дублируем

    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ variantId: Number(variantId), quantity: 1 }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setInCart(true);
      const cartSet = loadSet(cartKey);
      cartSet.add(String(variantId));
      saveSet(cartKey, cartSet);
    } catch (err) {
      console.warn("Ошибка при добавлении в корзину:", err);
    }
  };

  // ---- Избранное (POST /api/favorites при включении) ----
  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId) return;

    const next = !isFavorite;

    // оптимистично меняем локально
    setIsFavorite(next);
    const favSet = loadSet(favsKey);
    if (next) favSet.add(String(variantId));
    else favSet.delete(String(variantId));
    saveSet(favsKey, favSet);

    // при включении — шлём POST /api/favorites
    if (next) {
      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ variantId: Number(variantId) }),
        });
        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status} ${txt}`);
        }
        // успех — ничего не делаем (локальное состояние уже выставлено)
      } catch (err) {
        console.warn("Не удалось добавить в избранное:", err);
        // откат
        setIsFavorite(false);
        const rollback = loadSet(favsKey);
        rollback.delete(String(variantId));
        saveSet(favsKey, rollback);
      }
    } else {
      // выключение: ТЗ просило только POST для добавления.
      // Если появится API удаления — сюда можно добавить DELETE /api/favorites.
    }
  };

  return (
    <StaggerItem>
      <HoverLift>
        <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
          {/* Верхняя часть карточки */}
          <div className="relative p-4 bg-white border-b border-gray-200 sm:p-6 lg:p-8">
            {/* Избранное */}
            <button
              type="button"
              onClick={handleToggleFavorite}
              className="absolute z-10 transition-transform top-3 right-3 sm:top-4 sm:right-4 hover:scale-110"
              aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              <ScalePulse active={isFavorite}>
                <FadeSwitch active={isFavorite}>
                  <Heart
                    className={`transition-colors ${
                      isFavorite ? "text-red-500 fill-red-500" : "text-[#6F2A2B]"
                    } w-5 h-5 sm:w-6 sm:h-6`}
                  />
                </FadeSwitch>
              </ScalePulse>
            </button>

            {/* Переход по картинке */}
            <Link
              to={productUrl}
              className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded"
              aria-label={title || "Товар"}
            >
              <img
                src={image}
                alt={title}
                className="object-contain w-24 mx-auto h-44 sm:h-56 sm:w-28 lg:h-64 lg:w-32"
                loading="lazy"
              />
            </Link>
          </div>

          {/* Инфо-блок */}
          <div className="p-3 sm:p-4">
            <Link
              to={productUrl}
              className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded"
              title={title}
              aria-label={title || "Товар"}
            >
              <p className="text-[#1E1E1E] text-sm sm:text-base mb-6 line-clamp-2 lg:line-clamp-3">
                {title}
              </p>
            </Link>

            {/* Цена + кнопка */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-xl sm:text-2xl text-[#6F2A2B] font-normal whitespace-nowrap">
                {price}
              </span>

              {available ? (
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`
                    flex items-center justify-center
                    rounded-md text-sm sm:text-[15px]
                    transition-colors
                    px-3 py-[10px]
                    h-11
                    min-w-[110px]
                    ${
                      inCart
                        ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                        : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                    }
                  `}
                  aria-label={inCart ? "Убрать из корзины" : "Добавить в корзину"}
                >
                  <FadeSwitch active={inCart}>
                    <span className="flex items-center justify-center gap-1 leading-none whitespace-nowrap">
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>В корзине</span>
                        </>
                      ) : (
                        <span>В корзину</span>
                      )}
                    </span>
                  </FadeSwitch>
                </button>
              ) : (
                <span
                  className="
                    inline-flex items-center justify-center
                    rounded-md text-sm sm:text-[15px]
                    px-3 py-[10px]
                    h-11
                    min-w-[110px]
                    bg-gray-100 text-gray-500
                    whitespace-nowrap
                  "
                >
                  Нет в наличии
                </span>
              )}
            </div>
          </div>
        </div>
      </HoverLift>
    </StaggerItem>
  );
}
