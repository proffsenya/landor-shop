import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageFade } from "@/utils/PageAnimations";

export default function Register() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  // ui state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    if (!email || !firstName || !lastName || !password || !password2) {
      setErrorMsg("Заполните все обязательные поля.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrorMsg("Укажите корректный e-mail.");
      return false;
    }
    if (password.length < 4) {
      setErrorMsg("Пароль должен быть не короче 4 символов.");
      return false;
    }
    if (password !== password2) {
      setErrorMsg("Пароли не совпадают.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          passwordHash: password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          data?.detail ||
          data?.message ||
          (Array.isArray(data?.errors) ? data.errors.join(", ") : "") ||
          "Не удалось выполнить регистрацию.";
        setErrorMsg(msg);
        setLoading(false);
        return;
      }

      if (data?.token) localStorage.setItem("token", data.token);
      if (data?.email) localStorage.setItem("email", data.email);
      if (phone) localStorage.setItem("phone", phone);

      setSuccessMsg("Регистрация прошла успешно!");
      setTimeout(() => navigate("/"), 800);
    } catch {
      setErrorMsg("Сетевая ошибка. Повторите попытку.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageFade>
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

            {errorMsg && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMsg}
              </div>
            )}

            <form className="space-y-6 text-left" onSubmit={onSubmit}>
              {/* Имя */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Имя
                </label>
                <input
                  type="text"
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Фамилия */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Фамилия
                </label>
                <input
                  type="text"
                  placeholder="Иванов"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Почта */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Почта
                </label>
                <input
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Телефон */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  placeholder="+7(999)999-99-99"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="w-full px-0 py-3 border-0 border-b-2 border-[#6F2A2B] bg-transparent focus:outline-none focus:border-[#5a2223] text-gray-900"
                />
              </div>

              {/* Кнопка регистрации */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6F2A2B] text-white py-4 px-6 rounded-xl hover:bg-[#5a2223] transition-colors font-medium text-lg disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Создаём аккаунт..." : "Зарегистрироваться"}
              </button>

              {/* Ссылка на вход */}
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-[#6F2A2B] hover:opacity-70 transition-opacity"
                >
                  Войти
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
