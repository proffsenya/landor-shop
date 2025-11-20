import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
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

  // validation state
  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    password2: ""
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

      case "firstName":
        if (!value) {
          error = "Имя обязательно";
        } else if (value.length < 2) {
          error = "Имя должно быть не короче 2 символов";
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) {
          error = "Имя может содержать только буквы, пробелы и дефисы";
        }
        break;

      case "lastName":
        if (!value) {
          error = "Фамилия обязательна";
        } else if (value.length < 2) {
          error = "Фамилия должна быть не короче 2 символов";
        } else if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value)) {
          error = "Фамилия может содержать только буквы, пробелы и дефисы";
        }
        break;

      case "phone":
        if (value && !/^(\+7|8)?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(value)) {
          error = "Укажите корректный номер телефона (+79999999999)";
        }
        break;

      case "password":
        if (!value) {
          error = "Пароль обязателен";
        } else if (value.length < 8) {
          error = "Пароль должен быть не короче 8 символов";
        } else if (!/(?=.*[a-z])/.test(value)) {
          error = "Пароль должен содержать хотя бы одну строчную букву";
        } else if (!/(?=.*[A-Z])/.test(value)) {
          error = "Пароль должен содержать хотя бы одну заглавную букву";
        } else if (!/(?=.*\d)/.test(value)) {
          error = "Пароль должен содержать хотя бы одну цифру";
        } else if (!/(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(value)) {
          error = "Пароль должен содержать хотя бы один специальный символ";
        }
        break;

      case "password2":
        if (!value) {
          error = "Повторите пароль";
        } else if (value !== password) {
          error = "Пароли не совпадают";
        }
        break;

      default:
        break;
    }

    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = [
      { name: "email", value: email },
      { name: "firstName", value: firstName },
      { name: "lastName", value: lastName },
      { name: "phone", value: phone },
      { name: "password", value: password },
      { name: "password2", value: password2 }
    ];

    let isValid = true;
    fields.forEach(field => {
      if (!validateField(field.name, field.value)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const formatPhone = (value) => {
    // Удаляем все нецифровые символы кроме +
    const numbers = value.replace(/[^\d+]/g, '');
    
    if (numbers.startsWith('+7')) {
      return numbers;
    } else if (numbers.startsWith('8')) {
      return '+7' + numbers.slice(1);
    } else if (numbers.startsWith('7')) {
      return '+' + numbers;
    } else if (numbers) {
      return '+7' + numbers;
    }
    return numbers;
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhone(value);
    setPhone(formatted);
    validateField("phone", formatted);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone || undefined,
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <main className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] py-20 bg-white relative overflow-hidden">
          {/* Breadcrumb */}
          <div className="w-full max-w-[500px] mb-4 relative z-10">
            <BreadcrumbNav items={[
              { label: "Главная", to: "/" },
              { label: "Регистрация" }
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
                <h1 className="text-3xl text-[#6F2A2B] font-bold mb-8">
                  Регистрация
                </h1>

              {errorMsg && (
                <div className="px-4 py-3 mb-4 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="px-4 py-3 mb-4 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50">
                  {successMsg}
                </div>
              )}

              <form className="space-y-6 text-left" onSubmit={onSubmit}>
                {/* Имя */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Имя *
                  </label>
                  <input
                    type="text"
                    placeholder="Иван"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={handleBlur}
                    name="firstName"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.firstName ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.firstName && (
                    <div className="mt-1 text-xs text-red-500">{errors.firstName}</div>
                  )}
                </div>

                {/* Фамилия */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Фамилия *
                  </label>
                  <input
                    type="text"
                    placeholder="Иванов"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={handleBlur}
                    name="lastName"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.lastName ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.lastName && (
                    <div className="mt-1 text-xs text-red-500">{errors.lastName}</div>
                  )}
                </div>

                {/* Почта */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Почта *
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Телефон */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Номер телефона
                  </label>
                  <input
                    type="tel"
                    placeholder="+79999999999"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handleBlur}
                    name="phone"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.phone ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.phone && (
                    <div className="mt-1 text-xs text-red-500">{errors.phone}</div>
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

                {/* Повтор пароля */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Повторите пароль *
                  </label>
                  <input
                    type="password"
                    placeholder="**********"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    onBlur={handleBlur}
                    name="password2"
                    className={`w-full px-0 py-3 border-0 border-b-2 bg-transparent focus:outline-none text-gray-900 ${
                      errors.password2 ? "border-red-500" : "border-[#6F2A2B] focus:border-[#5a2223]"
                    }`}
                  />
                  {errors.password2 && (
                    <div className="mt-1 text-xs text-red-500">{errors.password2}</div>
                  )}
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