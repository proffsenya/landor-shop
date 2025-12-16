import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [errors, setErrors] = useState({
    email: "",
    password: ""
  });

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!value) {
          error = "Почта обязательна";
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = "Укажите корректный e-mail (example@mail.ru)";
        }
        break;

      case "password":
        if (!value) {
          error = "Пароль обязателен";
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const emailValid = validateField("email", email);
    const passwordValid = validateField("password", passwordHash);
    return emailValid && passwordValid;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // Валидация формы
    if (!validateForm()) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPass = passwordHash.trim();

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
      
      // Сохраняем права доступа только для staff и superuser
      // Для обычных пользователей эти поля не сохраняем
      if (data.isStaff || data.isSuperUser) {
        // Для staff: isStaff: "true", isSuperUser: "false"
        // Для superuser: isStaff: "true", isSuperUser: "true"
        localStorage.setItem("isStaff", "true");
        localStorage.setItem("isSuperUser", data.isSuperUser ? "true" : "false");
      } else {
        // Для обычных пользователей удаляем эти поля, если они были
        localStorage.removeItem("isStaff");
        localStorage.removeItem("isSuperUser");
      }
      
      // Сохраняем права доступа (если они есть в ответе)
      // if (data.isStaff !== undefined) {
      //   localStorage.setItem("isStaff", String(data.isStaff));
      // }
      // if (data.isSuperUser !== undefined) {
      //   localStorage.setItem("isSuperUser", String(data.isSuperUser));
      // }

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
                    Почта *
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        validateField("email", e.target.value);
                      }
                    }}
                    onBlur={handleBlur}
                    name="email"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.email ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.email && (
                    <div className="mt-1 text-xs text-red-500">{errors.email}</div>
                  )}
                </div>

                {/* Пароль */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    placeholder="**********"
                    value={passwordHash}
                    onChange={(e) => {
                      setPasswordHash(e.target.value);
                      if (errors.password) {
                        validateField("password", e.target.value);
                      }
                    }}
                    onBlur={handleBlur}
                    name="password"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.password ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.password && (
                    <div className="mt-1 text-xs text-red-500">{errors.password}</div>
                  )}
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
                  <Link
                    to="/register"
                    className="text-[#6F2A2B] hover:opacity-70 transition-opacity"
                  >
                    Регистрация
                  </Link>
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