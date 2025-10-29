import { useState } from "react";
import { Heart, ShoppingCart, Search } from "lucide-react";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      </div>

      <div className="flex gap-4">
        <a href="/login" className="hover:opacity-80">Войти</a>
        <a href="/register" className="hover:opacity-80">Регистрация</a>
      </div>
    </div>

    {/* Мобильный / планшет */}
    <div className="relative flex flex-col gap-2 lg:hidden">
      {/* Верхняя строка */}
      <div className="flex items-center justify-between">
        <div>Москва</div>
        <div className="flex gap-3">
          <a href="/login" className="hover:opacity-80">Войти</a>
          <a href="/register" className="hover:opacity-80">Регистрация</a>
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
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center leading-none">
              <div
                className="text-[#6F2A2B] text-[44px] tracking-tight"
                style={{ fontFamily: '"Aoboshi One", serif' }}
              >
                Land
                <svg
                  className="inline h-8 pb-1 align-baseline w-9"
                  viewBox="0 0 36 34"
                  fill="none"
                >
                  <path
                    d="M17.415 0.0103362C14.6741 0.103613 11.9435 0.821969 9.42088 2.14034C4.16187 4.88886 0.632684 10.1068 0.051342 15.9934C-0.0512497 17.0323 0.0072708 19.31 0.161508 20.2785C0.429023 21.9582 0.937999 23.5363 1.72133 25.1153C2.16921 26.0181 2.82023 27.1318 2.9032 27.1369C2.99799 27.1428 4.20453 25.0059 5.05163 23.3318C5.99493 21.4676 6.36664 20.5813 6.68831 19.4284C6.95609 18.4687 6.8909 18.5197 7.39936 18.8706C8.44967 19.5953 9.88569 20.1411 10.7421 20.1411C11.5576 20.1411 12.397 19.8007 12.8922 19.2692C13.2418 18.8939 13.5499 18.2568 13.6839 17.6311C14.0094 16.1109 13.5446 13.1316 12.4914 9.98726L12.1581 8.9925L12.1164 11.9083C12.0924 13.5915 12.0397 15.0561 11.9917 15.373C11.5885 18.0364 10.4902 18.9237 8.54867 18.1545C7.14201 17.5973 5.91335 16.4831 5.45135 15.3459C5.22901 14.7986 5.2318 13.5661 5.45732 12.7363C5.90638 11.0838 6.72539 9.72304 8.07693 8.38419C9.73182 6.74483 10.6332 6.38339 13.4911 6.21275C15.0136 6.12185 16.7506 6.20809 17.5671 6.41528C18.9999 6.77892 19.9135 7.48516 20.5808 8.74487C20.8635 9.27865 21.0289 9.50838 21.239 9.65954C21.7881 10.0545 21.9528 10.0948 24.6748 10.4998C25.8381 10.6729 26.8918 10.8471 27.0164 10.8868C27.364 10.9978 27.4757 11.2755 27.4264 11.9054C27.3007 13.5097 26.2546 15.1803 24.8512 16.0179C24.2983 16.3479 23.2439 16.6838 22.3518 16.8142C20.3831 17.1019 20.2675 17.1258 19.8288 17.3378C18.9854 17.7453 18.2667 18.6822 18.0204 19.6952C17.9045 20.1715 17.9215 21.5622 18.052 22.3024C18.1119 22.642 18.2913 23.4446 18.4508 24.0861C18.727 25.1967 18.7408 25.3034 18.7433 26.3159C18.7455 27.2209 18.7226 27.4589 18.5894 27.9135C18.2568 29.049 17.7159 29.8952 16.0303 31.9174C15.6169 32.4134 15.0832 33.0849 14.8443 33.4096C14.6167 33.7191 14.4457 33.9749 14.4502 33.9982L14.4516 34H14.452C14.6045 34 17.5052 31.6159 18.4559 30.7092C20.3239 28.9276 20.8961 27.6294 21.1688 24.5546C21.222 23.9543 21.3175 23.2638 21.3811 23.02C21.6423 22.0186 22.3042 21.1275 23.2789 20.4647C23.5684 20.2679 23.8682 20.0048 23.9453 19.88C24.7361 18.5986 26.1808 17.3703 26.967 16.9052C27.3108 16.7867 27.3797 16.9315 27.3779 17.7704C27.3765 18.396 27.345 18.7255 27.2061 19.752L27.1604 20.0265L27.792 20.2222C28.5035 20.4427 29.2776 20.9045 29.6819 21.3495C30.0014 21.7012 30.1983 22.0779 30.3991 22.7208C30.5937 23.3439 30.8211 23.643 31.3069 23.9142C31.5161 24.031 31.7349 24.1986 31.7931 24.2865C32.0281 24.6413 31.9704 25.3827 31.6603 25.9927C31.4171 26.471 30.8686 26.922 29.954 27.3958C28.6862 28.0526 28.4195 28.4147 28.4195 29.4776C28.4195 30.0654 28.7351 31.3973 28.9496 31.7144C28.9588 31.728 29.1987 31.5514 29.4826 31.3219C31.4872 29.7013 33.1065 27.6892 34.2116 25.4464C35.0825 23.6789 35.5511 22.1903 35.8451 20.2566C36.0369 18.9947 36.0527 16.9457 35.8806 15.6698C35.3273 11.5673 33.4802 7.9617 30.4869 5.1411C28.1739 2.96149 25.4767 1.50079 22.317 0.716668C20.7077 0.317311 19.0596 0.148218 17.415 0.204184Z"
                    fill="#6F2A2B"
                  />
                </svg>
                r
              </div>
              <div className="text-[#6F2A2B] text-[10px] font-normal mt-[2px]">
                Корма Holistic для кошек и собак
              </div>
            </div>
          </div>

          {/* Навигация */}
          <nav className="flex items-center gap-6 text-[#6F2A2B]">
            <a href="/" className="text-sm hover:opacity-70">Главная</a>
            <div className="relative group">
              <a href="/catalog" className="flex items-center gap-1 text-sm hover:opacity-70">
                Каталог
                <svg className="w-2 h-1" viewBox="0 0 5 3" fill="none">
                  <path d="M2.40729 2.97728C2.38361 2.96441 1.83657 2.37251 1.19165 1.66194C-0.079885 0.260968 -0.0152694 0.341003 0.00921553 0.197347C0.0217908 0.123566 0.112436 0.0237945 0.179468 0.00995311C0.309603 -0.0169184 0.245501 -0.0790329 1.41816 1.21025L2.5 2.39967L3.58184 1.21025C4.7545 -0.0790329 4.6904 -0.0169184 4.82053 0.00995311C4.88756 0.0237945 4.97821 0.123566 4.99078 0.197347C5.01527 0.341004 5.07991 0.260945 3.80811 1.6622C3.16306 2.37292 2.61506 2.96498 2.59033 2.97789C2.53348 3.00759 2.46265 3.00735 2.40729 2.97728Z" fill="#1E1E1E"/>
                </svg>
              </a>
            </div>
            <a href="/delivery" className="text-sm hover:opacity-70">Доставка и оплата</a>
            <a href="/cooperation" className="text-sm hover:opacity-70">Сотрудничество</a>
            <a href="/breeders" className="text-sm hover:opacity-70">Заводчикам</a>
          </nav>

          {/* Поиск и иконки */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Искать здесь..."
                className="w-96 h-11 pl-4 pr-20 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50"
              />
              <button className="absolute  right-0 top-0 bg-[#6F2A2B] text-white px-6 py-3 rounded-r-full hover:bg-[#5a2223]">
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist */}
            <button className="relative">
              <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                0
              </div>
            </button>

            {/* Cart */}
            <button className="relative">
              <div className="w-12 h-12 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                0
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet (< lg) */}
      <div className="bg-white shadow-md lg:hidden">
        <div className="container px-4 py-3 mx-auto">
          {/* Верхняя строка: логотип + иконки + бургер */}
          <div className="flex items-center justify-between">
            {/* Логотип компактный */}
            <div className="flex items-center gap-2">
              <div className="leading-none">
                <div
                  className="text-[#6F2A2B] text-3xl tracking-tight"
                  style={{ fontFamily: '"Aoboshi One", serif' }}
                >
                  Land
                  <svg className="inline h-6 align-baseline w-7" viewBox="0 0 36 34" fill="none">
                    <path
                      d="M17.415 0.0103362C14.6741 0.103613 11.9435 0.821969 9.42088 2.14034C4.16187 4.88886 0.632684 10.1068 0.051342 15.9934C-0.0512497 17.0323 0.0072708 19.31 0.161508 20.2785C0.429023 21.9582 0.937999 23.5363 1.72133 25.1153C2.16921 26.0181 2.82023 27.1318 2.9032 27.1369C2.99799 27.1428 4.20453 25.0059 5.05163 23.3318C5.99493 21.4676 6.36664 20.5813 6.68831 19.4284C6.95609 18.4687 6.8909 18.5197 7.39936 18.8706C8.44967 19.5953 9.88569 20.1411 10.7421 20.1411C11.5576 20.1411 12.397 19.8007 12.8922 19.2692C13.2418 18.8939 13.5499 18.2568 13.6839 17.6311C14.0094 16.1109 13.5446 13.1316 12.4914 9.98726L12.1581 8.9925L12.1164 11.9083C12.0924 13.5915 12.0397 15.0561 11.9917 15.373C11.5885 18.0364 10.4902 18.9237 8.54867 18.1545C7.14201 17.5973 5.91335 16.4831 5.45135 15.3459C5.22901 14.7986 5.2318 13.5661 5.45732 12.7363C5.90638 11.0838 6.72539 9.72304 8.07693 8.38419C9.73182 6.74483 10.6332 6.38339 13.4911 6.21275C15.0136 6.12185 16.7506 6.20809 17.5671 6.41528C18.9999 6.77892 19.9135 7.48516 20.5808 8.74487C20.8635 9.27865 21.0289 9.50838 21.239 9.65954C21.7881 10.0545 21.9528 10.0948 24.6748 10.4998C25.8381 10.6729 26.8918 10.8471 27.0164 10.8868C27.364 10.9978 27.4757 11.2755 27.4264 11.9054C27.3007 13.5097 26.2546 15.1803 24.8512 16.0179C24.2983 16.3479 23.2439 16.6838 22.3518 16.8142C20.3831 17.1019 20.2675 17.1258 19.8288 17.3378C18.9854 17.7453 18.2667 18.6822 18.0204 19.6952C17.9045 20.1715 17.9215 21.5622 18.052 22.3024C18.1119 22.642 18.2913 23.4446 18.4508 24.0861C18.727 25.1967 18.7408 25.3034 18.7433 26.3159C18.7455 27.2209 18.7226 27.4589 18.5894 27.9135C18.2568 29.049 17.7159 29.8952 16.0303 31.9174C15.6169 32.4134 15.0832 33.0849 14.8443 33.4096C14.6167 33.7191 14.4457 33.9749 14.4502 33.9982L14.4516 34H14.452C14.6045 34 17.5052 31.6159 18.4559 30.7092C20.3239 28.9276 20.8961 27.6294 21.1688 24.5546C21.222 23.9543 21.3175 23.2638 21.3811 23.02C21.6423 22.0186 22.3042 21.1275 23.2789 20.4647C23.5684 20.2679 23.8682 20.0048 23.9453 19.88C24.7361 18.5986 26.1808 17.3703 26.967 16.9052C27.3108 16.7867 27.3797 16.9315 27.3779 17.7704C27.3765 18.396 27.345 18.7255 27.2061 19.752L27.1604 20.0265L27.792 20.2222C28.5035 20.4427 29.2776 20.9045 29.6819 21.3495C30.0014 21.7012 30.1983 22.0779 30.3991 22.7208C30.5937 23.3439 30.8211 23.643 31.3069 23.9142C31.5161 24.031 31.7349 24.1986 31.7931 24.2865C32.0281 24.6413 31.9704 25.3827 31.6603 25.9927C31.4171 26.471 30.8686 26.922 29.954 27.3958C28.6862 28.0526 28.4195 28.4147 28.4195 29.4776C28.4195 30.0654 28.7351 31.3973 28.9496 31.7144C28.9588 31.728 29.1987 31.5514 29.4826 31.3219C31.4872 29.7013 33.1065 27.6892 34.2116 25.4464C35.0825 23.6789 35.5511 22.1903 35.8451 20.2566C36.0369 18.9947 36.0527 16.9457 35.8806 15.6698C35.3273 11.5673 33.4802 7.9617 30.4869 5.1411C28.1739 2.96149 25.4767 1.50079 22.317 0.716668C20.7077 0.317311 19.0596 0.148218 17.415 0.204184Z"
                      fill="#6F2A2B"
                    />
                  </svg>
                  r
                </div>
                <div className="text-[#6F2A2B] text-[10px] mt-0.5">
                  Корма Holistic для кошек и собак
                </div>
              </div>
            </div>

            {/* Иконки + бургер */}
            <div className="flex items-center gap-3">
              {/* wishlist */}
              <button className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  0
                </div>
              </button>

              {/* cart */}
              <button className="relative">
                <div className="w-10 h-10 bg-[#6F2A2B] rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#F7A92C] rounded-full flex items-center justify-center text-white text-xs">
                  0
                </div>
              </button>

              {/* burger */}
              <button
                aria-label="Меню"
                onClick={() => setMobileOpen(v => !v)}
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

              {/* Навигация mobile */}
              <nav className="flex flex-col gap-2 text-[#6F2A2B]">
                <a href="/" className="px-2 py-2 rounded hover:bg-gray-50">Главная</a>
                <a href="/catalog" className="px-2 py-2 rounded hover:bg-gray-50">Каталог</a>
                <a href="/delivery" className="px-2 py-2 rounded hover:bg-gray-50">Доставка и оплата</a>
                <a href="/cooperation" className="px-2 py-2 rounded hover:bg-gray-50">Сотрудничество</a>
                <a href="/breeders" className="px-2 py-2 rounded hover:bg-gray-50">Заводчикам</a>
              </nav>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
