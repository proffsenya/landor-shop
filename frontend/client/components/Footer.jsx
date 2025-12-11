import { Link } from "react-router-dom";
export default function Footer() {
  return (
    <footer className="bg-[#6F2A2B] text-white py-6 sm:py-8 lg:py-12 w-full">
      <div className="flex justify-center w-full">
        <div className="max-w-[1600px] px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="grid grid-cols-1 gap-14 sm:gap-16 md:grid-cols-2 lg:grid-cols-4 lg:gap-20">
          {/* Logo and contact info */}
          <div className="text-left lg:col-span-1">
            <div className="mb-4 sm:mb-6">
              <div
                className="text-2xl tracking-wide sm:text-3xl"
                style={{ fontFamily: '"Aoboshi One", serif' }}
              >
                Land
                <img src="/socialmedia-icons/logo-footer.svg" alt="logo" className="inline w-6 h-6 sm:w-8 sm:h-8 mx-1 align-[-2px]" />
                r
              </div>
            </div>

            <div className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
              <div className="flex items-center justify-start gap-1">
                <img src="/socialmedia-icons/clock.svg" className="w-3 h-3" viewBox="0 0 14 15" fill="white" />
                <p>9:00 - 21:00</p>
              </div>
              <div className="flex items-center justify-start gap-1">
                <img src="/socialmedia-icons/tg.svg" className="w-3 h-3" viewBox="0 0 14 15" fill="white" />
                <img src="/socialmedia-icons/ws.svg" className="w-3 h-3" viewBox="0 0 14 15" fill="white" />
                <img src="/socialmedia-icons/call.svg" className="w-3 h-3" viewBox="0 0 14 15" fill="white" />
                <p>+7(903)167-18-50</p>
              </div>
              <div className="flex items-center justify-start gap-1">
                <img src="/socialmedia-icons/mail.svg" className="w-3 h-3" viewBox="0 0 14 15" fill="white" />
                <p>landorshop@yandex.ru</p>
              </div>
            </div>
          </div>

          {/* Магазин */}
          <div className="text-left">
            <h3 className="mb-2 text-md sm:mb-4 sm:text-lg">Магазин</h3>
            <ul className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
              <li><Link to="/licenses" className="hover:opacity-70">Лицензии</Link></li>
              <li><a href="#" className="hover:opacity-70">Политика конфиденциальности</a></li>
            </ul>
          </div>

          {/* Компания */}
          <div className="text-left">
            <h3 className="mb-2 text-md sm:mb-4 sm:text-lg">Компания</h3>
            <ul className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
              <li><Link to="/about" className="hover:opacity-70">О компании</Link></li>
              <li><Link to="/cooperation" className="hover:opacity-70">Сотрудничество</Link></li>
              <li><Link to="/breeders" className="hover:opacity-70">Заводчикам</Link></li>
            </ul>
          </div>

          {/* Помощь */}
          <div className="text-left">
            <h3 className="mb-2 text-md sm:mb-4 sm:text-lg">Помощь</h3>
            <ul className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
              <li><Link to="/howtoorder" className="hover:opacity-70">Как сделать заказ</Link></li>
              <li><Link to = "/deliverypayment" className="hover:opacity-70">Доставка и оплата</Link></li>
              <li><Link to= "/exchangereturn" className="hover:opacity-70">Обмен и возврат товара</Link></li>
            </ul>
          </div>

          {/* Каталог */}
          {/* <div className="text-center md:text-left">
            <h3 className="mb-2 text-md sm:mb-4 sm:text-lg">Каталог</h3>
            <ul className="space-y-1 text-xs sm:space-y-2 sm:text-sm">
              <li><a href="#" className="hover:opacity-70">Страница 1</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 2</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 3</a></li>
              <li><a href="#" className="hover:opacity-70">Страница 4..</a></li>
            </ul>
          </div> */}
        </div>
        </div>
      </div>
    </footer>
  );
}
