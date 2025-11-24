import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { PageFade } from "@/utils/PageAnimations";

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken");
};

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
  isEditing,
  onToggle,
  type = "text",
}) {
  return (
    <PageFade>
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isEditing}
        className={`h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1 ${
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
    </PageFade>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(mockUser);
  const [orders] = useState(mockOrders);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passwordHash, setPasswordHash] = useState("");

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
      if (!authToken) {
        setError("Необходима авторизация");
        setLoading(false);
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
      } catch (e) {
        console.error("Error fetching profile:", e);
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Обновление профиля
  const updateProfile = async (field, value) => {
    const authToken = getAuthToken();
    if (!authToken) {
      alert("Необходима авторизация");
      return false;
    }

    try {
      const requestBody = {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        middleName: user.middleName || "",
        passwordHash: passwordHash || "",
      };

      // Обновляем измененное поле
      if (field === "email") requestBody.email = value;
      if (field === "firstName") requestBody.firstName = value;
      if (field === "lastName") requestBody.lastName = value;
      if (field === "phone") requestBody.phone = value;
      if (field === "middleName") requestBody.middleName = value;
      if (field === "password") {
        if (!value || value.trim() === "") {
          // Если пароль пустой, не отправляем его
          delete requestBody.passwordHash;
        } else {
          requestBody.passwordHash = value;
        }
      }

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

      // Проверяем наличие нового токена в теле ответа
      if (data.token || data.authToken) {
        const newToken = data.token || data.authToken;
        localStorage.setItem("authToken", newToken);
        // Также обновляем token, если он используется
        if (data.token) {
          localStorage.setItem("token", newToken);
        }
        console.log("Token updated in localStorage from response body");
      }

      // Проверяем заголовки ответа на наличие нового токена
      const authHeader = res.headers.get("Authorization");
      const xAuthToken = res.headers.get("X-Auth-Token");
      if (authHeader) {
        const tokenFromHeader = authHeader.replace("Bearer ", "");
        localStorage.setItem("authToken", tokenFromHeader);
        localStorage.setItem("token", tokenFromHeader);
        console.log("Token updated in localStorage from Authorization header");
      } else if (xAuthToken) {
        localStorage.setItem("authToken", xAuthToken);
        localStorage.setItem("token", xAuthToken);
        console.log("Token updated in localStorage from X-Auth-Token header");
      }

      // Обновляем email в localStorage, если он там хранится
      if (field === "email" && data.email) {
        localStorage.setItem("authEmail", data.email);
        localStorage.setItem("email", data.email);
      }

      if (field === "password") {
        setPasswordHash("");
      }

      return true;
    } catch (e) {
      console.error("Error updating profile:", e);
      alert("Не удалось обновить профиль. Попробуйте позже.");
      return false;
    }
  };

  const toggle = async (key) => {
    if (editing[key]) {
      // Сохраняем изменения
      let value = "";
      if (key === "password") {
        value = passwordHash;
      } else {
        value = user[key];
      }

      const success = await updateProfile(key, value);
      if (success) {
        setEditing((s) => ({ ...s, [key]: false }));
      }
    } else {
      // Включаем режим редактирования
      setEditing((s) => ({ ...s, [key]: true }));
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
              <div className="w-[96px] h-[96px] sm:w-[140px] sm:h-[140px] rounded-full bg-[#E5E5E5]" />
              <div className="mt-3 text-[16px] sm:text-[18px] font-semibold text-[#1E1E1E]">
                {user.firstName || "Иван"}
              </div>
            </div>

            <div className="mt-5 space-y-3 sm:mt-6">
              <RowWithButton
                placeholder="Фамилия"
                value={user.lastName}
                isEditing={editing.lastName}
                onChange={(v) => setUser((s) => ({ ...s, lastName: v }))}
                onToggle={() => toggle("lastName")}
              />
              <RowWithButton
                placeholder="Имя"
                value={user.firstName}
                isEditing={editing.firstName}
                onChange={(v) => setUser((s) => ({ ...s, firstName: v }))}
                onToggle={() => toggle("firstName")}
              />
              <RowWithButton
                placeholder="Отчество"
                value={user.middleName}
                isEditing={editing.middleName}
                onChange={(v) => setUser((s) => ({ ...s, middleName: v }))}
                onToggle={() => toggle("middleName")}
              />
              <RowWithButton
                placeholder="Почта"
                value={user.email}
                isEditing={editing.email}
                onChange={(v) => setUser((s) => ({ ...s, email: v }))}
                onToggle={() => toggle("email")}
                type="email"
              />
              <RowWithButton
                placeholder="Номер телефона"
                value={user.phone}
                isEditing={editing.phone}
                onChange={(v) => setUser((s) => ({ ...s, phone: v }))}
                onToggle={() => toggle("phone")}
              />

              {/* Пароль */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="password"
                  value={editing.password ? passwordHash : "••••••••"}
                  onChange={(e) => setPasswordHash(e.target.value)}
                  placeholder="Пароль"
                  disabled={!editing.password}
                  className={`h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1 ${
                    editing.password ? "ring-1 ring-[#6F2A2B]/20" : ""
                  }`}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => toggle("password")}
                  className="text-[13px] sm:w-auto w-full"
                >
                  {editing.password ? "Сохранить" : "Изменить"}
                </Button>
              </div>

              {/* Кнопка выхода */}
              <div className="mt-6 pt-4 border-t border-[#E8E8E8]">
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
    </div>
  );
}
