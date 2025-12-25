// client/components/Header.jsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Heart, ShoppingCart, Search } from "lucide-react";
import AccordionMotion from "@/utils/AccordionMotion";
import GlobalSearch from "@/components/GlobalSearch";


import { getAuthToken } from "@/utils/auth";
import { safeWarn } from "@/utils/logger";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [city] = useState("Москва");
  const [favCount, setFavCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [allProducts, setAllProducts] = useState([]);

  const location = useLocation();
  const authToken = getAuthToken();

  const loadCount = async (url, setter) => {
    try {
      // Получаем актуальный токен каждый раз при запросе
      const currentToken = getAuthToken();
      const res = await fetch(url, {
        headers:
          currentToken && currentToken !== "guest" ? { Authorization: `Bearer ${currentToken}` } : {},
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      let count = 0;
      if (Array.isArray(data)) {
        count = data.length;
      } else if (Array.isArray(data.items)) {
        count = data.items.length;
      } else if (Array.isArray(data.cartItems)) {
        count = data.cartItems.length;
      } else if (Array.isArray(data.content)) {
        count = data.content.length;
      } else if (typeof data.totalCount === "number") {
        count = data.totalCount;
      } else if (typeof data.totalItems === "number") {
        count = data.totalItems;
      }

      setter(Number.isFinite(count) ? count : 0);
    } catch (e) {
      safeWarn(`[header] load count failed for ${url}:`, e);
      setter(0);
    }
  };

  const refreshBadges = () => {
    // приоритет: сначала избранные, потом корзина
    loadCount("/api/favorites", setFavCount);
    loadCount("/api/cart", setCartCount);
  };


  // Загрузка продуктов для поиска из sessionStorage или API
  useEffect(() => {
    const loadProducts = () => {
      try {
        const stored = sessionStorage.getItem("catalog:all");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAllProducts(Array.isArray(parsed) ? parsed : []);
        } else {
          setAllProducts([]);
        }
      } catch (e) {
        safeWarn("Failed to load products from sessionStorage:", e);
        setAllProducts([]);
      }
    };

    // Загрузка продуктов из API, если их нет в sessionStorage
    const loadProductsFromAPI = async () => {
      try {
        // Загружаем все товары без фильтров
        const url = `/api/products/cards/search-by-url?filtersUrl=${encodeURIComponent("catalog?")}`;
        
        const res = await fetch(url);
        if (!res.ok) {
          safeWarn("Failed to load all products for search:", res.status);
          return;
        }

        const response = await res.json();
        
        // API может возвращать объект с полем content (Spring Data Page) или просто массив
        const data = Array.isArray(response) ? response : (response?.content || []);
        
        if (!Array.isArray(data)) {
          return;
        }

        // Фильтруем неактивные товары
        const activeItems = data.filter(item => {
          // Если в ответе есть isActive, используем его
          if (item?.isActive !== undefined) {
            return item.isActive !== false;
          }
          if (item?.productIsActive !== undefined) {
            return item.productIsActive !== false;
          }
          // Если нет информации, оставляем (для обратной совместимости)
          return true;
        });

        // Формируем полные данные для поиска с картинками, ценами и весом
        const searchData = activeItems.map((item) => {
          // Извлекаем productId из imageUrl, если он есть
          let productId = item?.productId;
          if (!productId && item?.imageUrl && item.imageUrl.startsWith("/api/products/")) {
            const match = item.imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
            if (match) {
              productId = parseInt(match[1]);
            }
          }
          
          return {
            id: item?.id,
            variantId: item?.id,
            productId: productId,
            displayName: item?.displayName || "Товар",
            title: item?.displayName || "Товар",
            price: item?.price ?? null,
            weight: item?.weight ?? null,
            weightLabel: item?.weightLabel || (item?.weight ? (typeof item.weight === "number" ? `${item.weight} кг` : item.weight) : null),
            imageUrl: item?.imageUrl || "/korm1.svg",
            image: item?.imageUrl || "/korm1.svg",
          };
        });

        // Сохраняем в sessionStorage
        sessionStorage.setItem("catalog:all", JSON.stringify(searchData));
        
        // Обновляем состояние
        setAllProducts(searchData);
      } catch (e) {
        safeWarn("Error loading all products for search:", e);
      }
    };

    // Проверяем, есть ли данные в sessionStorage
    const stored = sessionStorage.getItem("catalog:all");
    if (stored) {
      // Загружаем из sessionStorage
      loadProducts();
    } else {
      // Загружаем из API
      loadProductsFromAPI();
    }

    // Слушаем изменения в sessionStorage
    const handleStorageChange = (e) => {
      if (e.key === "catalog:all" || !e.key) {
        loadProducts();
      }
    };

    // Слушаем кастомное событие обновления каталога
    const handleCatalogUpdate = () => {
      loadProducts();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("catalog:update", handleCatalogUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("catalog:update", handleCatalogUpdate);
    };
  }, []);

  useEffect(() => {
    // auth-флаг
    setIsAuth(authToken !== "guest");

    // первичная загрузка
    refreshBadges();

    const onStorage = () => {
      setIsAuth(getAuthToken() !== "guest");
      refreshBadges();
    };
    const onFavs = () => refreshBadges();
    const onCart = () => refreshBadges();
    const onTokenUpdate = () => {
      // При обновлении токена перезагружаем бейджи с новым токеном
      setIsAuth(getAuthToken() !== "guest");
      refreshBadges();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("favorites:update", onFavs);
    window.addEventListener("cart:update", onCart);
    window.addEventListener("auth:token-updated", onTokenUpdate);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("favorites:update", onFavs);
      window.removeEventListener("cart:update", onCart);
      window.removeEventListener("auth:token-updated", onTokenUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, location.pathname]);

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-[#6F2A2B] text-white">
        <div className="container mx-auto px-4 py-2 text-[13px]">
          {/* ПК */}
          <div className="items-center justify-between hidden lg:flex">
            <div>{city}</div>
            <div className="flex items-center">
              <div>Звоните нам с 9:00 до 21:00 Мск</div>
              <div className="ml-[71px]">+7(980)157-60-27</div>
              <img className="ml-[5px]" src="/socialmedia-icons/ws.svg" alt="ws" />
              <img className="ml-[5px]" src="/socialmedia-icons/tg.svg" alt="tg" />
              <img className="ml-[5px]" src="/socialmedia-icons/call.svg" alt="call" />
            </div>
            <div className="flex gap-4">
              {isAuth ? (
                <Link to="/profile" className="hover:opacity-80">Профиль</Link>
              ) : (
                <>
                  <Link to="/login" className="hover:opacity-80">Войти</Link>
                  <Link to="/register" className="hover:opacity-80">Регистрация</Link>
                </>
              )}
            </div>
          </div>

          {/* Мобайл/планшет */}
          <div className="relative flex flex-col gap-2 lg:hidden">
            <div className="flex items-center justify-between">
              <div>{city}</div>
              <div className="flex gap-3">
                {isAuth ? (
                  <Link to="/profile" className="hover:opacity-80">Профиль</Link>
                ) : (
                  <>
                    <Link to="/login" className="hover:opacity-80">Войти</Link>
                    <Link to="/register" className="hover:opacity-80">Регистрация</Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[13px] border-t border-white/20 pt-2">
              <div>Звоните нам с 9:00 до 21:00 мск</div>
              <div className="mt-1 sm:mt-0">+7(980)157-60-27</div>
            </div>
          </div>
        </div>
      </div>

            {/* Main navigation — Desktop */}
      <div className="hidden bg-white shadow-md lg:block">
        <div className="container py-4 mx-auto">
          <div className="flex items-center justify-between">
            {/* Лого */}
            <Link to="/" className="flex items-center flex-shrink-0 gap-2">
              <div className="flex flex-col items-center leading-none">
                <div
                  className="text-[#6F2A2B] text-[44px] tracking-tight"
                  style={{ fontFamily: '"Aoboshi One", serif' }}
                >
                  Land
                  <img className="inline h-8 align-baseline w-9" src="/favicon.svg" alt="logo" />
                  r
                </div>
                <div className="text-[#6F2A2B] text-[10px] font-normal mt-[2px]">
                  Корма Holistic для кошек и собак
                </div>
              </div>
            </Link>

            {/* Нав */}
            <nav className="flex items-center gap-8 text-[#6F2A2B] mx-8 flex-shrink-0">
              <Link to="/" className="text-sm hover:opacity-70 whitespace-nowrap">Главная</Link>
              <div className="relative group">
                <Link to="/catalog" className="flex items-center gap-1 text-sm hover:opacity-70 whitespace-nowrap">
                  Каталог
                  <img src="/arrow2.svg" className="w-2 h-1" alt="arrow" />
                </Link>
              </div>
              <Link to="/deliverypayment" className="text-sm hover:opacity-70 whitespace-nowrap">Доставка и оплата</Link>
              <Link to="/cooperation" className="text-sm hover:opacity-70 whitespace-nowrap">Сотрудничество</Link>
              <Link to="/breeders" className="text-sm hover:opacity-70 whitespace-nowrap">Заводчикам</Link>
            </nav>

            {/* Поиск и иконки */}
            <div className="flex items-center flex-shrink-0 gap-6">
              <GlobalSearch dataset={allProducts} className="w-96" />

              {/* Избранное */}
              <Link to="/favorites" className="relative">
                <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  {favCount}
                </div>
              </Link>

              {/* Корзина */}
              <Link to="/cart" className="relative">
                <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  {cartCount}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet */}
      <div className="bg-white shadow-md lg:hidden">
        <div className="container px-4 py-3 mx-auto">
          <div className="flex items-center justify-between">
            <div className="leading-none">
              <Link to="/" className="flex items-center gap-2">
                <div
                  className="text-[#6F2A2B] text-3xl tracking-tight"
                  style={{ fontFamily: '"Aoboshi One", serif' }}
                >
                  Land
                  <img src="/favicon.svg" className="inline h-6 align-baseline w-7" alt="logo" />
                  r
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Избранное */}
              <Link to="/favorites" className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-[11px]">
                  {favCount}
                </div>
              </Link>

              {/* Корзина */}
              <Link to="/cart" className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-[11px]">
                  {cartCount}
                </div>
              </Link>

              <button
                aria-label="Меню"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="ml-1 inline-flex flex-col justify-center gap-1.5 w-10 h-10 rounded-full border border-[#A9A9A9]"
              >
                <span className="mx-auto block w-5 h-0.5 bg-[#1E1E1E]" />
                <span className="mx-auto block w-5 h-0.5 bg-[#1E1E1E]" />
                <span className="mx-auto block w-5 h-0.5 bg-[#1E1E1E]" />
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="pt-3 pb-4 space-y-4">
              <GlobalSearch 
                dataset={allProducts}
                className="w-full"
                placeholder="Искать здесь..."
                onSelect={() => setMobileOpen(false)}
              />

              <nav className="flex flex-col gap-2 text-[#6F2A2B]">
                <Link to="/" className="px-2 py-2 rounded hover:bg-gray-50">Главная</Link>
                <Link to="/catalog" className="px-2 py-2 rounded hover:bg-gray-50">Каталог</Link>
                <Link to="/deliverypayment" className="px-2 py-2 rounded hover:bg-gray-50">Доставка и оплата</Link>
                <Link to="/cooperation" className="px-2 py-2 rounded hover:bg-gray-50">Сотрудничество</Link>
                <Link to="/breeders" className="px-2 py-2 rounded hover:bg-gray-50">Заводчикам</Link>
                {isAuth ? (
                  <Link to="/profile" className="px-2 py-2 rounded hover:bg-gray-50">Профиль</Link>
                ) : (
                  <>
                    <Link to="/login" className="px-2 py-2 rounded hover:bg-gray-50">Войти</Link>
                    <Link to="/register" className="px-2 py-2 rounded hover:bg-gray-50">Регистрация</Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
