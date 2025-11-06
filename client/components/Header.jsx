import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Search } from "lucide-react";
import AccordionMotion from "@/utils/AccordionMotion";  // Импорт AccordionMotion

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuth(!!token);
    const onStorage = () => setIsAuth(!!localStorage.getItem("authToken"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <header className="w-full">
      {/* Top bar */}
      <div className="bg-[#6F2A2B] text-white">
        <div className="container mx-auto px-4 py-2 text-[13px]">
          {/* ПК-вариант */}
          <div className="items-center justify-between hidden lg:flex">
            <div>Москва</div>
            <div className="flex items-center">
              <div>Звоните нам с 9:00 до 22:00 мск</div>
              <div className="ml-[71px]">+7(999)999-99-99</div>
              <img className="ml-[5px]" src="/socialmedia-icons/ws.svg" alt="ws" />
              <img className="ml-[5px]" src="/socialmedia-icons/tg.svg" alt="tg" />
              <img className="ml-[5px]" src="/socialmedia-icons/call.svg" alt="call" />
            </div>
            <div className="flex gap-4">
              {isAuth ? (
                <Link to="/profile" className="hover:opacity-80">
                  Профиль
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hover:opacity-80">
                    Войти
                  </Link>
                  <Link to="/register" className="hover:opacity-80">
                    Регистрация
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Мобильный / планшет */}
          <div className="relative flex flex-col gap-2 lg:hidden">
            {/* Верхняя строка */}
            <div className="flex items-center justify-between">
              <div>Москва</div>
              <div className="flex gap-3">
                {isAuth ? (
                  <Link to="/profile" className="hover:opacity-80">
                    Профиль
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="hover:opacity-80">
                      Войти
                    </Link>
                    <Link to="/register" className="hover:opacity-80">
                      Регистрация
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Контактная зона снизу */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-[13px] border-t border-white/20 pt-2">
              <div>Звоните нам с 9:00 до 22:00 мск</div>
              <div className="mt-1 sm:mt-0">+7(999)999-99-99</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      {/* Desktop (lg+) — исходный вид */}
      <div className="hidden bg-white shadow-md lg:block">
        <div className="container flex items-center justify-between py-4 mx-auto">
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex flex-col items-center leading-none">
              <div
                className="text-[#6F2A2B] text-[44px] tracking-tight"
                style={{ fontFamily: '"Aoboshi One", serif' }}
              >
                Land
                <img
                  className="inline h-8 align-baseline w-9"
                  src="/logo.svg"
                  alt="logo"
                />
                r
              </div>
              <div className="text-[#6F2A2B] text-[10px] font-normal mt-[2px]">
                Корма Holistic для кошек и собак
              </div>
            </div>
          </Link>

          {/* Навигация */}
          <nav className="flex items-center gap-6 text-[#6F2A2B]">
            <Link to="/" className="text-sm hover:opacity-70">
              Главная
            </Link>

            <div className="relative group">
              <Link to="/catalog" className="flex items-center gap-1 text-sm hover:opacity-70">
                Каталог
                <img src="/arrow2.svg" className="w-2 h-1" alt="arrow" />
              </Link>
            </div>

            <Link to="/delivery" className="text-sm hover:opacity-70">
              Доставка и оплата
            </Link>
            <Link to="/cooperation" className="text-sm hover:opacity-70">
              Сотрудничество
            </Link>
            <Link to="/breeders" className="text-sm hover:opacity-70">
              Заводчикам
            </Link>
          </nav>

          {/* Поиск и иконки */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Искать здесь..."
                className="w-96 h-11 pl-4 pr-20 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50"
              />
              <button className="absolute right-0 top-0 bg-[#6F2A2B] text-white px-6 py-3 rounded-r-full hover:bg-[#5a2223]">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist */}
            <Link to="/favorites" className="relative">
              <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                0
              </div>
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                0
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet (< lg) */}
      <div className="bg-white shadow-md lg:hidden">
        <div className="container px-4 py-3 mx-auto">
          {/* Верхняя строка: логотип + иконки + бургер */}
          <div className="flex items-center justify-between">
            <div className="leading-none">
              <Link to="/" className="flex items-center gap-2">
                <div
                  className="text-[#6F2A2B] text-3xl tracking-tight"
                  style={{ fontFamily: '"Aoboshi One", serif' }}
                >
                  Land
                  <img src="/logo.svg" className="inline h-6 align-baseline w-7" alt="logo" />
                  r
                </div>
              </Link>
            </div>

            {/* Иконки + бургер */}
            <div className="flex items-center gap-3">
              <Link to="/favorites" className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  0
                </div>
              </Link>

              <Link to="/cart" className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  0
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

          {/* Выпадающее меню: поиск + навигация */}
          {mobileOpen && (
            <div className="pt-3 pb-4 space-y-4">
              <AccordionMotion isOpen={mobileOpen}>
                {/* Поиск mobile */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Искать здесь..."
                    className="w-full pl-4 pr-12 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50"
                  />
                  <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#6F2A2B] text-white px-4 py-2 rounded-full hover:bg-[#5a2223]">
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </AccordionMotion>

              {/* Навигация mobile */}
              <nav className="flex flex-col gap-2 text-[#6F2A2B]">
                <Link to="/" className="px-2 py-2 rounded hover:bg-gray-50">
                  Главная
                </Link>
                <Link to="/catalog" className="px-2 py-2 rounded hover:bg-gray-50">
                  Каталог
                </Link>
                <Link to="/delivery" className="px-2 py-2 rounded hover:bg-gray-50">
                  Доставка и оплата
                </Link>
                <Link to="/cooperation" className="px-2 py-2 rounded hover:bg-gray-50">
                  Сотрудничество
                </Link>
                <Link to="/breeders" className="px-2 py-2 rounded hover:bg-gray-50">
                  Заводчикам
                </Link>
                {isAuth ? (
                  <Link to="/profile" className="px-2 py-2 rounded hover:bg-gray-50">
                    Профиль
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="px-2 py-2 rounded hover:bg-gray-50">
                      Войти
                    </Link>
                    <Link to="/register" className="px-2 py-2 rounded hover:bg-gray-50">
                      Регистрация
                    </Link>
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
