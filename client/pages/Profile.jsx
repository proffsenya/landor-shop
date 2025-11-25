import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { getAuthToken } from "@/utils/auth";
import { formatName, formatPhone } from "@/utils/formatting";
import { validateName, validateEmail, validatePhone, validatePassword, validateConfirmPassword } from "@/utils/validation";
import { checkAdminAccess } from "@/utils/adminAuth";
import { Shield } from "lucide-react";

// Моки
const mockUser = {
  firstName: "Иван",
  lastName: "",
  middleName: "",
  email: "",
  phone: "",
  avatar: null,
};

const mockOrders = [
  { id: "134534", date: "01.09.2025" },
  { id: "134535", date: "02.09.2025" },
  { id: "134536", date: "03.09.2025" },
  { id: "134537", date: "04.09.2025" },
  { id: "134538", date: "05.09.2025" },
  { id: "134539", date: "06.09.2025" },
  { id: "134540", date: "07.09.2025" },
  { id: "134541", date: "08.09.2025" },
  { id: "134542", date: "09.09.2025" },
  { id: "134543", date: "10.09.2025" },
];

// Ряд с инпутом и маленькой кнопкой справа (адаптив)
function RowWithButton({
  placeholder,
  value,
  onChange,
  onBlur,
  isEditing,
  onToggle,
  type = "text",
  error = "",
  example = "",
}) {
  return (
    <PageFade>
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={!isEditing}
          className={`h-10 rounded-lg border ${
            error ? "border-red-500" : "border-[#E8E8E8]"
          } bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1 ${
            isEditing ? "ring-1 ring-[#6F2A2B]/20" : ""
          }`}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onToggle}
          className="text-[13px] sm:w-auto w-full"
        >
          {isEditing ? "Сохранить" : "Изменить"}
        </Button>
      </div>
      {example && !isEditing && (
        <p className="text-xs text-gray-500">{example}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
    </PageFade>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(mockUser);
  const [orders] = useState(mockOrders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [editing, setEditing] = useState({
    lastName: false,
    firstName: false,
    middleName: false,
    email: false,
    phone: false,
    password: false,
  });

  // Загрузка данных профиля
  useEffect(() => {
    const fetchProfile = async () => {
      const authToken = getAuthToken();
      if (!authToken || authToken === "guest") {
        setError("Необходима авторизация");
        showToast("Для просмотра профиля необходимо авторизоваться", 3000);
        setLoading(false);
        // Перенаправляем на страницу логина через 2 секунды
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        setUser({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          middleName: data.middleName || "",
          email: data.email || "",
          phone: data.phone || "",
          avatar: null,
        });
        // Проверяем права доступа (если они есть в ответе, иначе из localStorage)
        if (data.isStaff !== undefined) {
          setIsStaff(data.isStaff);
          localStorage.setItem("isStaff", String(data.isStaff));
        } else {
          setIsStaff(localStorage.getItem("isStaff") === "true");
        }
        if (data.isSuperUser !== undefined) {
          setIsSuperUser(data.isSuperUser);
          localStorage.setItem("isSuperUser", String(data.isSuperUser));
        } else {
          setIsSuperUser(localStorage.getItem("isSuperUser") === "true");
        }
      } catch (e) {
        console.error("Error fetching profile:", e);
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Изменение пароля
  const changePassword = async () => {
    const authToken = getAuthToken();
    if (!authToken || authToken === "guest") {
      showToast("Необходима авторизация", 3000);
      return false;
    }

    // Валидация всех полей пароля
    const currentPasswordError = validatePassword(passwordData.currentPassword);
    const newPasswordError = validatePassword(passwordData.newPassword);
    const confirmPasswordError = validateConfirmPassword(
      passwordData.confirmPassword,
      passwordData.newPassword
    );

    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setErrors((prev) => ({
        ...prev,
        password: currentPasswordError || newPasswordError || confirmPasswordError || "",
      }));
      return false;
    }

    try {
      const requestBody = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      };

      console.log("Sending password change request:", {
        url: "/api/users/profile/changepassword",
        method: "PUT",
        body: requestBody,
      });

      const res = await fetch("/api/users/profile/changepassword", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Password change response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Password change error response:", {
          status: res.status,
          statusText: res.statusText,
          body: errorText,
        });
        let errorMessage = `HTTP ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Проверяем, есть ли ответ от сервера
      const responseData = await res.json().catch(() => null);
      if (responseData) {
        console.log("Password change success response:", responseData);
      }

      // Очищаем поля пароля после успешного изменения
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors((prev) => ({ ...prev, password: "" }));
      showToast("Пароль успешно изменен");
      return true;
    } catch (e) {
      console.error("Error changing password:", e);
      setErrors((prev) => ({
        ...prev,
        password: e.message || "Не удалось изменить пароль. Проверьте текущий пароль.",
      }));
      return false;
    }
  };

  // Обновление профиля
  const updateProfile = async (field, value) => {
    const authToken = getAuthToken();
    if (!authToken || authToken === "guest") {
      showToast("Необходима авторизация", 3000);
      return false;
    }

    // Валидация перед отправкой
    let fieldError = "";
    if (field === "firstName") {
      fieldError = validateName(value, "Имя");
    } else if (field === "lastName") {
      fieldError = validateName(value, "Фамилия");
    } else if (field === "middleName") {
      if (value.trim()) {
        fieldError = validateName(value, "Отчество");
      }
    } else if (field === "email") {
      fieldError = validateEmail(value);
    } else if (field === "phone") {
      fieldError = validatePhone(value);
    }

    if (fieldError) {
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
      return false;
    }

    try {
      const requestBody = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        middleName: user.middleName || "",
      };

      // Обновляем измененное поле
      if (field === "email") requestBody.email = value.trim();
      if (field === "firstName") requestBody.firstName = value.trim();
      if (field === "lastName") requestBody.lastName = value.trim();
      if (field === "phone") {
        // Убираем форматирование для отправки
        const cleaned = value.replace(/[\s\-()\+]/g, "");
        requestBody.phone = cleaned.startsWith("8") ? "7" + cleaned.slice(1) : cleaned;
      }
      if (field === "middleName") requestBody.middleName = value.trim();

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setUser({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        middleName: data.middleName || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: null,
      });

      // Если изменился email, обязательно обновляем токен и email в localStorage
      if (field === "email") {
        let tokenUpdated = false;
        let newToken = null;

        // Проверяем наличие нового токена в теле ответа
        if (data.token || data.authToken) {
          newToken = data.token || data.authToken;
          localStorage.setItem("authToken", newToken);
          // Также обновляем token, если он используется
          if (data.token) {
            localStorage.setItem("token", newToken);
          }
          tokenUpdated = true;
          console.log("Token updated in localStorage from response body (email changed)");
        }

        // Проверяем заголовки ответа на наличие нового токена
        if (!tokenUpdated) {
          const authHeader = res.headers.get("Authorization");
          const xAuthToken = res.headers.get("X-Auth-Token");
          if (authHeader) {
            newToken = authHeader.replace("Bearer ", "");
            localStorage.setItem("authToken", newToken);
            localStorage.setItem("token", newToken);
            tokenUpdated = true;
            console.log("Token updated in localStorage from Authorization header (email changed)");
          } else if (xAuthToken) {
            newToken = xAuthToken;
            localStorage.setItem("authToken", newToken);
            localStorage.setItem("token", newToken);
            tokenUpdated = true;
            console.log("Token updated in localStorage from X-Auth-Token header (email changed)");
          }
        }

        // Если токен не был обновлен сервером, но email изменился,
        // возможно нужно перезагрузить страницу или использовать текущий токен
        // (в зависимости от логики сервера)
        if (!tokenUpdated) {
          console.warn("Token not updated by server after email change. Current token may be invalid.");
          // Можно попробовать перезагрузить страницу для получения нового токена
          // или показать предупреждение пользователю
        }

        // Обновляем email в localStorage
        if (data.email) {
          localStorage.setItem("authEmail", data.email);
          localStorage.setItem("email", data.email);
          console.log("Email updated in localStorage:", data.email);
        }

        // Отправляем событие об обновлении токена, чтобы другие компоненты перезагрузились
        window.dispatchEvent(new Event("auth:token-updated"));
        
        // Также отправляем событие storage для синхронизации между вкладками
        // Используем setTimeout, чтобы убедиться, что localStorage обновлен
        setTimeout(() => {
          window.dispatchEvent(new StorageEvent("storage", {
            key: "authToken",
            newValue: localStorage.getItem("authToken"),
            oldValue: authToken,
          }));
        }, 100);
      } else {
        // Для других полей также проверяем токен (на случай, если сервер его обновляет)
        if (data.token || data.authToken) {
          const newToken = data.token || data.authToken;
          localStorage.setItem("authToken", newToken);
          if (data.token) {
            localStorage.setItem("token", newToken);
          }
        }

        const authHeader = res.headers.get("Authorization");
        const xAuthToken = res.headers.get("X-Auth-Token");
        if (authHeader) {
          const tokenFromHeader = authHeader.replace("Bearer ", "");
          localStorage.setItem("authToken", tokenFromHeader);
          localStorage.setItem("token", tokenFromHeader);
        } else if (xAuthToken) {
          localStorage.setItem("authToken", xAuthToken);
          localStorage.setItem("token", xAuthToken);
        }
      }

      // Очищаем ошибку при успешном обновлении
      setErrors((prev) => ({ ...prev, [field]: "" }));

      return true;
    } catch (e) {
      console.error("Error updating profile:", e);
      showToast("Не удалось обновить профиль. Попробуйте позже.");
      return false;
    }
  };

  const toggle = async (key) => {
    if (editing[key]) {
      // Сохраняем изменения
      if (key === "password") {
        // Для пароля используем отдельную функцию
        const success = await changePassword();
        if (success) {
          setEditing((s) => ({ ...s, [key]: false }));
          setErrors((prev) => ({ ...prev, [key]: "" }));
        }
      } else {
        const value = user[key];
        const success = await updateProfile(key, value);
        if (success) {
          setEditing((s) => ({ ...s, [key]: false }));
          setErrors((prev) => ({ ...prev, [key]: "" }));
        }
      }
    } else {
      // Включаем режим редактирования
      setEditing((s) => ({ ...s, [key]: true }));
      setErrors((prev) => ({ ...prev, [key]: "" }));
      // Очищаем данные пароля при открытии редактирования
      if (key === "password") {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    }
  };

  const handleLogout = () => {
    // Очищаем localStorage
    localStorage.clear();
    // Очищаем sessionStorage
    sessionStorage.clear();
    // Перенаправляем на главную страницу
    navigate("/");
    // Перезагружаем страницу для полной очистки состояния
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-[64px] py-6 sm:py-8">
        <BreadcrumbNav items={[
          { label: "Главная", to: "/" },
          { label: "Профиль" }
        ]} />
        <PageFade>
        {loading && (
          <div className="py-12 text-center text-gray-500">Загрузка профиля…</div>
        )}
        {!loading && error && (
          <div className="py-12 text-center text-red-600">{error}</div>
        )}
        {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Профиль — уменьшенный */}
          <PageFade>
          <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
            <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1E1E1E] text-center">
              Профиль
            </h2>

            <div className="flex flex-col items-center mt-4 sm:mt-5">
              <img 
                src="/avatar.png" 
                alt="Аватар" 
                className="w-[96px] h-[96px] sm:w-[140px] sm:h-[140px] rounded-full object-cover border-2 border-[#E8E8E8]"
              />
              <div className="mt-3 text-[16px] sm:text-[18px] font-semibold text-[#1E1E1E]">
                {user.firstName || "Иван"}
              </div>
            </div>

            <div className="mt-5 space-y-3 sm:mt-6">
              <RowWithButton
                placeholder="Фамилия"
                value={user.lastName}
                isEditing={editing.lastName}
                onChange={(v) => {
                  const formatted = formatName(v);
                  setUser((s) => ({ ...s, lastName: formatted }));
                  if (errors.lastName) {
                    setErrors((prev) => ({ ...prev, lastName: "" }));
                  }
                }}
                onBlur={() => {
                  const error = validateName(user.lastName, "Фамилия");
                  setErrors((prev) => ({ ...prev, lastName: error }));
                }}
                onToggle={() => toggle("lastName")}
                error={errors.lastName}
                example="Пример: Иванов"
              />
              <RowWithButton
                placeholder="Имя"
                value={user.firstName}
                isEditing={editing.firstName}
                onChange={(v) => {
                  const formatted = formatName(v);
                  setUser((s) => ({ ...s, firstName: formatted }));
                  if (errors.firstName) {
                    setErrors((prev) => ({ ...prev, firstName: "" }));
                  }
                }}
                onBlur={() => {
                  const error = validateName(user.firstName, "Имя");
                  setErrors((prev) => ({ ...prev, firstName: error }));
                }}
                onToggle={() => toggle("firstName")}
                error={errors.firstName}
                example="Пример: Иван"
              />
              <RowWithButton
                placeholder="Отчество"
                value={user.middleName}
                isEditing={editing.middleName}
                onChange={(v) => {
                  const formatted = formatName(v);
                  setUser((s) => ({ ...s, middleName: formatted }));
                  if (errors.middleName) {
                    setErrors((prev) => ({ ...prev, middleName: "" }));
                  }
                }}
                onBlur={() => {
                  if (user.middleName.trim()) {
                    const error = validateName(user.middleName, "Отчество");
                    setErrors((prev) => ({ ...prev, middleName: error }));
                  } else {
                    setErrors((prev) => ({ ...prev, middleName: "" }));
                  }
                }}
                onToggle={() => toggle("middleName")}
                error={errors.middleName}
                example="Пример: Иванович (необязательно)"
              />
              <RowWithButton
                placeholder="Почта"
                value={user.email}
                isEditing={editing.email}
                onChange={(v) => {
                  setUser((s) => ({ ...s, email: v }));
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                onBlur={() => {
                  const error = validateEmail(user.email);
                  setErrors((prev) => ({ ...prev, email: error }));
                }}
                onToggle={() => toggle("email")}
                type="email"
                error={errors.email}
                example="Пример: ivan@mail.ru"
              />
              <RowWithButton
                placeholder="Номер телефона"
                value={user.phone}
                isEditing={editing.phone}
                onChange={(v) => {
                  const formatted = formatPhone(v);
                  setUser((s) => ({ ...s, phone: formatted }));
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                onBlur={() => {
                  const error = validatePhone(user.phone);
                  setErrors((prev) => ({ ...prev, phone: error }));
                }}
                onToggle={() => toggle("phone")}
                error={errors.phone}
                example="Пример: +7 (999) 123-45-67"
              />

              {/* Пароль */}
              <div className="flex flex-col gap-2">
                {!editing.password ? (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="password"
                      value="••••••••"
                      placeholder="Пароль"
                      disabled
                      className="h-10 rounded-lg border border-[#E8E8E8] bg-gray-50 px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => toggle("password")}
                      className="text-[13px] sm:w-auto w-full"
                    >
                      Изменить
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex-1 space-y-2">
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) => {
                            setPasswordData((prev) => ({
                              ...prev,
                              currentPassword: e.target.value,
                            }));
                            if (errors.password) {
                              setErrors((prev) => ({ ...prev, password: "" }));
                            }
                          }}
                          placeholder="Текущий пароль"
                          className={`h-10 w-full rounded-lg border ${
                            errors.password ? "border-red-500" : "border-[#E8E8E8]"
                          } bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none ring-1 ring-[#6F2A2B]/20`}
                        />
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) => {
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }));
                            if (errors.password) {
                              setErrors((prev) => ({ ...prev, password: "" }));
                            }
                          }}
                          placeholder="Новый пароль"
                          className={`h-10 w-full rounded-lg border ${
                            errors.password ? "border-red-500" : "border-[#E8E8E8]"
                          } bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none ring-1 ring-[#6F2A2B]/20`}
                        />
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => {
                            setPasswordData((prev) => ({
                              ...prev,
                              confirmPassword: e.target.value,
                            }));
                            if (errors.password) {
                              setErrors((prev) => ({ ...prev, password: "" }));
                            }
                          }}
                          placeholder="Подтвердите новый пароль"
                          className={`h-10 w-full rounded-lg border ${
                            errors.password ? "border-red-500" : "border-[#E8E8E8]"
                          } bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none ring-1 ring-[#6F2A2B]/20`}
                        />
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => toggle("password")}
                          className="text-[13px] sm:w-auto w-full"
                        >
                          Отмена
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => toggle("password")}
                          className="text-[13px] sm:w-auto w-full bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                        >
                          Сохранить
                        </Button>
                      </div>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      Пароль должен содержать минимум 6 символов
                    </p>
                  </div>
                )}
              </div>

              {/* Кнопка выхода и админки */}
              <div className="mt-6 pt-4 border-t border-[#E8E8E8] space-y-3">
                {(isStaff || isSuperUser) && (
                  <Button
                    type="button"
                    onClick={() => {
                      const { hasAccess } = checkAdminAccess();
                      navigate(hasAccess ? "/admin" : "/admin/login");
                    }}
                    className="w-full h-[40px] rounded-lg bg-gray-800 text-white text-[14px] hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <Shield className="w-4 h-4" />
                    Перейти в админку
                  </Button>
                )}
                <Button
                  type="button"
                  onClick={handleLogout}
                  className="w-full h-[40px] rounded-lg bg-red-600 text-white text-[14px] hover:bg-red-700"
                >
                  Выйти из аккаунта
                </Button>
              </div>
            </div>
          </div>
          </PageFade>

          {/* Правая колонка — история заказов */}
          <div className="flex flex-col gap-6">
            {/* История заказов */}
            <PageFade>
            <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
              <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1E1E1E]">
                История заказов
              </h2>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="text-[#1E1E1E] border-b border-[#E8E8E8]">
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]">Номер</th>
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]">Дата</th>
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => (
                      <tr key={idx} className="border-b border-[#F3F3F3]">
                        <td className="py-2 text-[13px] sm:text-[14px]">Заказ №{o.id}</td>
                        <td className="py-2 text-[13px] sm:text-[14px] text-[#6F6F6F]">{o.date}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            className="text-[#6F2A2B] text-[13px] sm:text-[14px] hover:opacity-80"
                          >
                            Открыть
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
            </PageFade>
          </div>
        </div>
        )}
        </PageFade>
      </div>
      <Footer />
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
    </div>
  );
}
