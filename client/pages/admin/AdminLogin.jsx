import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/utils/auth";
import { validateEmail } from "@/utils/validation";
import { checkAdminAccess } from "@/utils/adminAuth";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  // Проверяем, есть ли уже авторизация с правами админа
  useEffect(() => {
    const { hasAccess } = checkAdminAccess();
    if (hasAccess) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Валидация
    const emailError = validateEmail(email);
    if (emailError || !password) {
      setErrors({
        email: emailError || "",
        password: !password ? "Пароль обязателен" : "",
      });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          passwordHash: password.trim(),
        }),
      });

      if (!res.ok) {
        let msg = "Ошибка входа. Проверьте данные.";
        try {
          const data = await res.json();
          msg = data.message || data.detail || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      
      // Если пользователь уже залогинен на сайте, обновляем только права
      const existingAuthToken = getAuthToken();
      if (existingAuthToken && existingAuthToken !== "guest") {
        // Обновляем права доступа для существующего токена
        localStorage.setItem("isStaff", String(data.isStaff || false));
        localStorage.setItem("isSuperUser", String(data.isSuperUser || false));
        // Используем существующий authToken
      } else {
        // Сохраняем отдельный токен для админки
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminEmail", data.email);
        localStorage.setItem("isStaff", String(data.isStaff || false));
        localStorage.setItem("isSuperUser", String(data.isSuperUser || false));
      }

      // Редирект в админку
      navigate("/admin");
    } catch (e) {
      setError(e.message || "Не удалось выполнить вход.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Админ-панель</h1>
          <p className="text-gray-600">Вход для администраторов</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              onBlur={() => {
                const emailError = validateEmail(email);
                setErrors((prev) => ({ ...prev, email: emailError }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль *
            </label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6F2A2B] text-white py-3 px-6 rounded-lg hover:bg-[#5a2223] transition-colors font-medium text-lg disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Входим..." : "Войти в админку"}
          </button>
        </form>
      </div>
    </div>
  );
}

