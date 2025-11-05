export default function Footer() {
  return (
    <footer className="bg-[#6F2A2B] text-white py-10 sm:py-12 lg:py-16">
      <div className="container px-3 mx-auto sm:px-4">
        <div className="grid grid-cols-1 gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and contact info */}
          <div className="lg:col-span-1">
            <div className="mb-6 text-center sm:mb-4 md:text-left">
              <div
                className="mb-3 text-3xl tracking-wide sm:mb-4 sm:text-4xl"
                style={{ fontFamily: '"Aoboshi One", serif' }}
              >
                Land
                <img src = "/socialmedia-icons/logo-footer.svg" alt = "logo" className="inline w-7 h-7 sm:w-9 sm:h-8 mx-1 align-[-2px]" viewBox="0 0 36 35" fill="white"/>
                r
              </div>
            </div>

            <div className="space-y-2 text-sm text-center sm:space-y-3 sm:text-base md:text-left">
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <img src = "/socialmedia-icons/clock.svg" className="w-3.5 h-3.5" viewBox="0 0 14 15" fill="white">
                </img>
                <p>9:00 - 21:00</p>
              </div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <img src = "/socialmedia-icons/call.svg" className="w-3.5 h-3.5" viewBox="0 0 14 15" fill="white">
                </img>
                <p>+7(999)999-99-99</p>
              </div>
              <div className="flex items-center justify-center gap-2 md:justify-start">
                <img src = "/socialmedia-icons/mail.svg" className="w-3.5 h-3.5" viewBox="0 0 14 15" fill="white">
                </img>
                <p>info@landor-shop.ru</p>
              </div>

              <div className="flex items-center justify-center gap-2 md:justify-start">
                <img src = "/socialmedia-icons/tg.svg" className="w-3.5 h-3.5" viewBox="0 0 14 15" fill="white">
                </img>
                <p>+7(999)999-99-99</p>
              </div>

              <div className="flex items-center justify-center gap-2 md:justify-start">
                <img src = "/socialmedia-icons/ws.svg" className="w-3.5 h-3.5" viewBox="0 0 14 15" fill="white"/>
                <p>+7(999)999-99-99</p>
              </div>
            </div>
          </div>

          {/* Магазин */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg sm:mb-6 sm:text-xl">Магазин</h3>
            <ul className="space-y-2 text-sm sm:space-y-3 sm:text-base">
              <li><a href="#" className="hover:opacity-70">Лицензия</a></li>
              <li><a href="#" className="hover:opacity-70">Политика конфиденциальности</a></li>
              <li><a href="#" className="hover:opacity-70">Сертификаты</a></li>
              <li><a href="#" className="hover:opacity-70">Обратная связь</a></li>
            </ul>
          </div>

          {/* Компания */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg sm:mb-6 sm:text-xl">Компания</h3>
            <ul className="space-y-2 text-sm sm:space-y-3 sm:text-base">
              <li><a href="#" className="hover:opacity-70">О компании</a></li>
              <li><a href="#" className="hover:opacity-70">Сотрудничество</a></li>
              <li><a href="#" className="hover:opacity-70">Питомники</a></li>
            </ul>
          </div>

          {/* Помощь */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg sm:mb-6 sm:text-xl">Помощь</h3>
            <ul className="space-y-2 text-sm sm:space-y-3 sm:text-base">
              <li><a href="#" className="hover:opacity-70">Как сделать заказ</a></li>
              <li><a href="#" className="hover:opacity-70">Доставка и оплата</a></li>
              <li><a href="#" className="hover:opacity-70">Обмен и возврат товара</a></li>
            </ul>
          </div>

          {/* Каталог */}
          <div className="text-center md:text-left">
            <h3 className="mb-4 text-lg sm:mb-6 sm:text-xl">Каталог</h3>
            <ul className="space-y-2 text-sm sm:space-y-3 sm:text-base">
              <li><a href="#" className="hover:opacity-70">Страница 1</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 2</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 3</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 4..</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
