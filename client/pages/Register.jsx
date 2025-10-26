import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Register() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Основной контент с фоном лап */}
      <main className="relative flex items-center justify-center py-20 overflow-hidden bg-white">
        {/* Левая картинка */}
        <img
          src="/bitmap1.svg"
          alt="Следы лап слева"
          className="absolute left-11 top-1/2 -translate-y-1/2 h-[90%] max-h-[900px] w-auto object-contain pointer-events-none select-none"
        />

        {/* Правая картинка */}
        <img
          src="/bitmap2.svg"
          alt="Следы лап справа"
          className="absolute right-11 top-1/2 -translate-y-1/2 h-[90%] max-h-[900px] w-auto object-contain pointer-events-none select-none"
        />

        {/* Контейнер по центру */}
        <div className="relative z-10 flex justify-center items-center w-full max-w-[500px]">
          <div className="bg-white rounded-[30px] shadow-[0_4px_15px_rgba(0,0,0,0.1)] p-12 w-full text-center border border-gray-100">
            <h1 className="text-3xl text-[#6F2A2B] font-bold mb-8">
              Регистрация
            </h1>

            <form className="space-y-6 text-left">
              {/* Почта */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Почта
                </label>
                <input
                  type="email"
                  placeholder="example@mail.ru"
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Номер телефона */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  placeholder="+7(999)999-99-99"
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Пароль */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Пароль
                </label>
                <input
                  type="password"
                  placeholder="**********"
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Повтор пароля */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Повторите пароль
                </label>
                <input
                  type="password"
                  placeholder="**********"
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                className="w-full bg-[#6F2A2B] text-white py-4 px-6 rounded-xl hover:bg-[#5a2223] transition-colors font-medium text-lg"
              >
                Зарегистрироваться
              </button>

              {/* Ссылка на вход */}
              <div className="text-center">
                <a
                  href="/login"
                  className="text-[#6F2A2B] hover:opacity-70 transition-opacity"
                >
                  Войти
                </a>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
