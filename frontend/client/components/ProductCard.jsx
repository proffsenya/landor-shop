import { useEffect, useState, memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
import { ScalePulse, FadeSwitch } from "../utils/ActionAnimations";
import { ToastMotion } from "../utils/PageAnimations";
import { AuthToast } from "./AuthToast";

// ---- helpers: storage by authToken ------------------------------------------
const STORAGE_CART = (authToken) => `cart:variants:${authToken || "guest"}`;
const STORAGE_FAVS = (authToken) => `favs:variants:${authToken || "guest"}`;

import { getAuthToken } from "@/utils/auth";
import { safeWarn } from "@/utils/logger";
import { formatWeight } from "@/utils/formatting";

// --- ДОБАВЬ ЭТИ ХЕЛПЕРЫ ВЫШЕ (рядом с loadSet/saveSet) ---
async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

async function apiDeleteFavorite(variantId, authToken) {
  const headers = authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {};
  try {
    const r = await fetch(`/api/favorites/${encodeURIComponent(variantId)}`, { method: "DELETE", headers });
    if (r.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (r.ok) return true;
    safeWarn("DELETE /api/favorites/:variantId ->", r.status, await safeText(r));
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
    safeWarn("favorites delete path err", e);
  }

  try {
    const r = await fetch(`/api/favorites?variantId=${encodeURIComponent(variantId)}`, { method: "DELETE", headers });
    if (r.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (r.ok) return true;
    safeWarn("DELETE /api/favorites?variantId ->", r.status, await safeText(r));
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
    safeWarn("favorites delete query err", e);
  }

  try {
    const r = await fetch(`/api/favorites`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ id: Number(variantId), variantId: Number(variantId) })
    });
    if (r.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (r.ok) return true;
    safeWarn("DELETE /api/favorites body ->", r.status, await safeText(r));
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
    safeWarn("favorites delete body err", e);
  }

  return false;
}

async function apiDeleteFromCart(variantId, authToken) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const vId = Number(variantId);
  
  if (!Number.isFinite(vId)) {
    safeWarn("[cart] variantId невалиден:", variantId);
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
    safeWarn("DELETE /api/cart/:variantId ->", r.status, await safeText(r));
  } catch (e) { safeWarn("cart delete path err", e); }

  try {
    const r = await fetch(`/api/cart?variantId=${encodeURIComponent(vId)}`, { method: "DELETE", headers });
    if (r.ok) return true;
    safeWarn("DELETE /api/cart?variantId ->", r.status, await safeText(r));
  } catch (e) { safeWarn("cart delete query err", e); }

  try {
    const r = await fetch(`/api/cart`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ variantId: vId, quantity: 1 })
    });
    if (r.ok) return true;
    safeWarn("DELETE /api/cart body ->", r.status, await safeText(r));
  } catch (e) { safeWarn("cart delete body err", e); }

  return false;
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

const ProductCard = memo(function ProductCard({
  productId,
  variantId,
  image,
  title,
  price,
  to,
  stock,
  weight,
}) {
  const productUrl =
    to ??
    (variantId != null && productId != null
      ? `/product/${encodeURIComponent(productId)}?variant=${encodeURIComponent(variantId)}`
      : "#");

  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [toast, setToast] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  // Функция для показа уведомлений
  const showToast = (msg, ms = 1500) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

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
  const handleAddToCart = useCallback(async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!variantId || !available) return;

  // Проверка авторизации
  if (!authToken || authToken === "guest") {
    showToast("Для добавления товара в корзину необходимо авторизоваться", 3000);
    return;
  }

  // Проверка количества в наличии
  if (numericStock < 1) {
    showToast("Товар отсутствует в наличии", 3000);
    return;
  }

  const vidStr = String(variantId);
  const vidNum = Number(variantId);

  if (!inCart) {
    // ДОБАВИТЬ
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ variantId: vidNum, quantity: 1 }),
      });
      if (res.status === 401) {
        setAuthToastMessage("Для добавления товара в корзину необходимо авторизоваться");
        setShowAuthToast(true);
        return;
      }
      if (!res.ok) {
        const errorText = await safeText(res);
        if (res.status === 401) {
          setAuthToastMessage("Для добавления товара в корзину необходимо авторизоваться");
          setShowAuthToast(true);
          return;
        }
        
        // Проверка на ошибку превышения количества
        if (res.status === 400 || res.status === 422) {
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.message && (errorJson.message.includes("stock") || errorJson.message.includes("наличи") || errorJson.message.includes("количеств"))) {
              showToast(errorJson.message || "Недостаточно товара в наличии", 3000);
              return;
            }
            // Если есть другое сообщение об ошибке, показываем его
            if (errorJson.message) {
              showToast(errorJson.message, 3000);
              return;
            }
          } catch {
            // Если не JSON, проверяем текст на наличие ключевых слов
            if (errorText && (errorText.includes("stock") || errorText.includes("наличи") || errorText.includes("количеств"))) {
              showToast("Недостаточно товара в наличии", 3000);
              return;
            }
          }
        }
        
        // Для ошибок сервера показываем понятное сообщение
        if (res.status >= 500) {
          showToast("Ошибка сервера. Попробуйте позже", 3000);
          return;
        }
        
        throw new Error(`HTTP ${res.status} ${errorText}`);
      }

      setInCart(true);
      const cartSet = loadSet(cartKey);
      cartSet.add(vidStr);
      saveSet(cartKey, cartSet);
      window.dispatchEvent(new Event("cart:update"));
      showToast("Товар добавлен в корзину");
    } catch (err) {
      safeWarn("Ошибка при добавлении в корзину:", err);
      showToast("Не удалось добавить в корзину", 2000);
    }
  } else {
    // УДАЛИТЬ (второй клик по кнопке «В корзине»)
    const ok = await apiDeleteFromCart(vidNum, authToken);
    if (ok) {
      setInCart(false);
      const cartSet = loadSet(cartKey);
      cartSet.delete(vidStr);
      saveSet(cartKey, cartSet);
      window.dispatchEvent(new Event("cart:update"));
      showToast("Товар удалён из корзины");
    } else {
      safeWarn("Не удалось удалить из корзины");
      showToast("Не получилось удалить. Повторите позже", 2000);
    }
  }
}, [variantId, available, inCart, authToken, cartKey]);


  // ---- Избранное (POST /api/favorites при включении) ----
  // ---- Избранное: повторное нажатие удаляет из избранного И из корзины ----
const handleToggleFavorite = useCallback(async (e) => {
  e.preventDefault();
  e.stopPropagation();
  if (!variantId) return;

  // Проверка авторизации
  if (!authToken || authToken === "guest") {
    showToast("Для добавления товара в избранное необходимо авторизоваться", 3000);
    return;
  }

  const vidStr = String(variantId);
  const vidNum = Number(variantId);
  const next = !isFavorite;

  // оптимистично
  setIsFavorite(next);
  const favSet = loadSet(favsKey);
  if (next) favSet.add(vidStr);
  else favSet.delete(vidStr);
  saveSet(favsKey, favSet);

  if (next) {
    // добавить в избранное
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ variantId: vidNum }),
      });
      if (res.status === 401) {
        setIsFavorite(false);
        const rb = loadSet(favsKey); rb.delete(vidStr); saveSet(favsKey, rb);
        setAuthToastMessage("Для добавления товара в избранное необходимо авторизоваться");
        setShowAuthToast(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${await safeText(res)}`);
      window.dispatchEvent(new Event("favorites:update"));
      showToast("Товар добавлен в избранное");
    } catch (err) {
      // откат
      setIsFavorite(false);
      const rb = loadSet(favsKey); rb.delete(vidStr); saveSet(favsKey, rb);
      safeWarn("Не удалось добавить в избранное:", err);
      showToast("Не удалось добавить в избранное", 2000);
    }
  } else {
    // удалить из избранного
    try {
    const ok = await apiDeleteFavorite(vidNum, authToken);
    if (ok) {
      window.dispatchEvent(new Event("favorites:update"));
      showToast("Товар удалён из избранного");
    } else {
      // откат
      setIsFavorite(true);
      const rb = loadSet(favsKey); rb.add(vidStr); saveSet(favsKey, rb);
      safeWarn("Не удалось удалить из избранного");
      showToast("Не удалось удалить из избранного", 2000);
      }
    } catch (e) {
      if (e.message === "401 Unauthorized") {
        setIsFavorite(true);
        const rb = loadSet(favsKey); rb.add(vidStr); saveSet(favsKey, rb);
        setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
        setShowAuthToast(true);
      } else {
        setIsFavorite(true);
        const rb = loadSet(favsKey); rb.add(vidStr); saveSet(favsKey, rb);
        safeWarn("Не удалось удалить из избранного");
        showToast("Не удалось удалить из избранного", 2000);
      }
    }
  }
}, [variantId, isFavorite, authToken, favsKey]);



  const renderCardContent = () => (
    <>
      <div className="flex flex-col h-full overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
        {/* Верхняя часть карточки */}
        <div className="relative flex-shrink-0 p-2 bg-white border-b border-gray-200 sm:p-3 lg:p-4">
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
            className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded relative"
            aria-label={title || "Товар"}
          >
            {imageError || !image ? (
              <div className="w-32 h-56 mx-auto sm:h-72 sm:w-40 lg:h-80 lg:w-48 bg-transparent" />
            ) : (
              <img
                src={image}
                alt={title}
                className="object-contain w-32 h-56 mx-auto sm:h-72 sm:w-40 lg:h-80 lg:w-48"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            )}
          </Link>
        </div>

        {/* Инфо-блок */}
        <div className="flex flex-col flex-1 p-3 sm:p-4">
          <Link
            to={productUrl}
            className="block flex-1 focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded"
            title={title}
            aria-label={title || "Товар"}
          >
            <p className="text-[#1E1E1E] text-sm sm:text-base mb-2">
              {title}
            </p>
            {weight && (
              <p className="text-[#8B8B8B] text-xs sm:text-sm mb-4"> 
                {typeof weight === "number" 
                  ? formatWeight(weight)
                  : weight}
              </p>
            )}
          </Link>

          {/* Цена + кнопка */}
          <div className="flex items-center justify-between gap-3 mt-auto">
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
    </>
  );

  return (
    <>
      {/* Десктоп версия с анимацией */}
      <div className="h-full hidden lg:block">
        <StaggerItem className="h-full">
          <HoverLift className="h-full">
            {renderCardContent()}
          </HoverLift>
        </StaggerItem>
      </div>
      {/* Мобильная версия без анимации */}
      <div className="h-full lg:hidden">
        <HoverLift className="h-full">
          {renderCardContent()}
        </HoverLift>
      </div>
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
      <AuthToast 
        show={showAuthToast} 
        onClose={() => setShowAuthToast(false)}
        message={authToastMessage}
      />
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
