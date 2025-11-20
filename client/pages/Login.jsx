import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    const trimmedEmail = email.trim();
    const trimmedPass = passwordHash.trim();

    if (!trimmedEmail || !trimmedPass) {
      setErr("Заполните почту и пароль.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          passwordHash: trimmedPass,
        }),
      });

      if (!res.ok) {
        // Попробуем вытащить сообщение об ошибке, если бэк прислал
        let msg = "Ошибка входа. Проверьте данные и попробуйте снова.";
        try {
          const data = await res.json();
          if (data && (data.message || data.detail)) {
            msg = data.message || data.detail;
          }
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      // Ожидаемый ответ:
      // { token: "string", email: "string", isStaff: true/false, isSuperUser: true/false }

      // Сохраняем токен и базовую инфу о пользователе
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authEmail", data.email);
      localStorage.setItem("isStaff", String(data.isStaff));
      localStorage.setItem("isSuperUser", String(data.isSuperUser));

      // Редирект на главную (или на профиль/каталог — как тебе нужно)
      navigate("/");
    } catch (e) {
      setErr(e.message || "Не удалось выполнить вход.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        {/* Основной контент с фоном лап - растягиваем на всю доступную высоту */}
        <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-20 bg-white relative overflow-hidden">
          {/* Breadcrumb */}
          <div className="w-full max-w-[500px] mb-4 relative z-10">
            <BreadcrumbNav items={[
              { label: "Главная", to: "/" },
              { label: "Войти" }
            ]} />
          </div>

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
                <h1 className="text-3xl text-[#6F2A2B] font-bold mb-8">Войти</h1>

              <form className="space-y-6 text-left" onSubmit={onSubmit}>
                {/* Почта */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Почта/Номер телефона
                  </label>
                  <input
                    type="text"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    value={passwordHash}
                    onChange={(e) => setPasswordHash(e.target.value)}
                    className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                  />
                </div>

                {/* Ошибка */}
                {err && (
                  <div className="-mt-2 text-sm text-red-600">{err}</div>
                )}

                {/* Кнопка входа */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#6F2A2B] text-white py-4 px-6 rounded-xl hover:bg-[#5a2223] transition-colors font-medium text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Входим…" : "Войти"}
                </button>

                {/* Ссылка на регистрацию */}
                <div className="text-center">
                  <a
                    href="/register"
                    className="text-[#6F2A2B] hover:opacity-70 transition-opacity"
                  >
                    Регистрация
                  </a>
                </div>
              </form>
              </div>
          </div>
        </main>
      </PageFade>
      <Footer />
    </div>
  );
}