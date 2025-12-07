import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, X } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { validateEmail, validateName, validatePassword, validatePhone } from "@/utils/validation";
import { formatName, formatPhone } from "@/utils/formatting";
import { safeError } from "@/utils/logger";
import { ToastMotion } from "@/utils/PageAnimations";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });

  useEffect(() => {
    const { isSuperUser: superUser, isStaff: staff, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    setIsStaff(staff);
    loadUsers();
  }, [navigate]);

  const loadUsers = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const usersList = Array.isArray(data) ? data : [];
        // Нормализуем поле isSuperUser (может приходить как isSuperuser, isSuperUser, is_super_user, superUser)
        const normalizedUsers = usersList.map(user => {
          // Определяем значение isSuperUser из разных возможных вариантов
          let isSuperUserValue = false;
          if (user.isSuperuser !== undefined) {
            isSuperUserValue = Boolean(user.isSuperuser);
          } else if (user.isSuperUser !== undefined) {
            isSuperUserValue = Boolean(user.isSuperUser);
          } else if (user.is_super_user !== undefined) {
            isSuperUserValue = Boolean(user.is_super_user);
          } else if (user.superUser !== undefined) {
            isSuperUserValue = Boolean(user.superUser);
          }
          
          return {
            ...user,
            isSuperUser: isSuperUserValue
          };
        });
        setUsers(normalizedUsers);
      } else {
        const errorText = await res.text();
        safeError("Failed to load users:", res.status, errorText);
        setUsers([]);
      }
    } catch (e) {
      safeError("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!userId) {
      showToast("Не удалось определить ID пользователя", "error");
      return;
    }

    try {
      const adminToken = getAdminToken();
      // Используем userId для идентификации пользователя
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        loadUsers();
        showToast("Пользователь успешно удален");
      } else {
        const errorText = await res.text();
        let errorMessage = `Ошибка ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        showToast(`Ошибка при удалении пользователя: ${errorMessage}`, "error");
      }
    } catch (e) {
      safeError("Error deleting user:", e);
      showToast("Ошибка при удалении пользователя", "error");
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      // Получаем оба токена для проверки
      const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const isSuperUserLocal = typeof window !== "undefined" ? localStorage.getItem("isSuperUser") === "true" : false;
      

      // Используем adminToken если есть, иначе authToken
      const tokenToUse = adminToken || (authToken && authToken !== "guest" ? authToken : null);
      
      if (!tokenToUse) {
        showToast("Ошибка: токен авторизации не найден. Пожалуйста, войдите заново.", "error");
        navigate("/admin/login");
        return;
      }

      // Проверяем, что пользователь действительно superuser
      const { isSuperUser: superUser } = checkAdminAccess();
      if (!superUser) {
        showToast("Ошибка: недостаточно прав для создания пользователя. Требуется роль Super User.", "error");
        return;
      }

      const payload = {
        email: formData.email.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        middleName: formData.middleName?.trim() || "",
        phone: formData.phone?.trim() || "",
        passwordHash: formData.password, // Отправляем пароль как passwordHash (бэкенд должен его хешировать)
        isStaff: true,
        isActive: true,
      };


      const res = await fetch("/api/users/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(payload),
      });


      if (res.ok) {
        loadUsers();
        setShowCreateForm(false);
        showToast("Пользователь успешно создан");
      } else {
        const errorText = await res.text();
        let errorMessage = `Ошибка ${res.status}`;
        
        if (res.status === 403) {
          errorMessage = "Доступ запрещен. Убедитесь, что вы вошли как Super User и имеете необходимые права.";
        } else if (res.status === 401) {
          errorMessage = "Ошибка авторизации. Пожалуйста, войдите заново.";
          navigate("/admin/login");
        } else {
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            if (errorText) {
              errorMessage = errorText;
            }
          }
        }
        
        safeError("[AdminUsers] Error creating user:", res.status, errorText);
        showToast(`Ошибка при создании пользователя: ${errorMessage}`, "error");
      }
    } catch (e) {
      safeError("Error creating user:", e);
      showToast(`Ошибка при создании пользователя: ${e.message || "Неизвестная ошибка"}`, "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader 
        isSuperUser={isSuperUser} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <AdminSidebar 
          isSuperUser={isSuperUser}
          isStaff={isStaff}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Пользователи</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-2">Управление правами доступа пользователей</p>
              </div>
              {isSuperUser && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать пользователя
                </Button>
              )}
            </div>

            {/* Форма создания пользователя */}
            {showCreateForm && isSuperUser && (
              <CreateUserForm
                onClose={() => setShowCreateForm(false)}
                onSubmit={handleCreateUser}
              />
            )}

            {/* Десктопная таблица */}
            <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Super User</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                        <td colSpan="8" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                        Нет пользователей
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.userId || user.email || index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                            <span className="truncate block max-w-[150px] sm:max-w-none" title={user.email || "-"}>
                              {user.email || "-"}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}${user.middleName ? ` ${user.middleName}` : ""}`
                            : user.firstName || user.lastName || "-"}
                        </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{user.phone || "-"}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                            : "-"}
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isStaff ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isStaff ? "Да" : "Нет"}
                          </span>
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isSuperUser ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isSuperUser ? "Да" : "Нет"}
                          </span>
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              {isSuperUser && !user.isSuperUser && (
                                <button
                                  onClick={() => handleDeleteUser(user.userId)}
                                  className="px-3 py-1 rounded text-xs font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center gap-1"
                                  title="Удалить пользователя"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Удалить</span>
                                </button>
                              )}
                            </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>

            {/* Мобильные/планшетные карточки */}
            <div className="lg:hidden space-y-4">
              {users.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  Нет пользователей
                </div>
              ) : (
                users.map((user, index) => (
                  <div key={user.userId || user.email || index} className="bg-white rounded-lg shadow p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}${user.middleName ? ` ${user.middleName}` : ""}`
                            : user.email || `Пользователь #${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 break-all">{user.email || "-"}</p>
                      </div>
                      {isSuperUser && !user.isSuperUser && (
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="p-2 rounded text-red-700 hover:bg-red-50 transition-colors"
                          title="Удалить пользователя"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      {user.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Телефон:</span>
                          <span className="text-sm text-gray-900">{user.phone}</span>
                        </div>
                      )}
                      
                      {user.createdAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Дата регистрации:</span>
                          <span className="text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Staff:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isStaff ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.isStaff ? "Да" : "Нет"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Super User:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.isSuperUser ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {user.isSuperUser ? "Да" : "Нет"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastMotion show={toast.show} type={toast.type}>
        {toast.message}
      </ToastMotion>
    </div>
  );
}

// Компонент формы создания пользователя
function CreateUserForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
    middleName: "",
    phone: "",
    password: "",
  });
  const [touched, setTouched] = useState({
    email: false,
    firstName: false,
    lastName: false,
    middleName: false,
    phone: false,
    password: false,
  });
  const [loading, setLoading] = useState(false);

  // Валидация опционального телефона (если указан, проверяем формат)
  const validateOptionalPhone = (value) => {
    if (!value || !value.trim()) {
      return ""; // Телефон необязателен
    }
    return validatePhone(value);
  };

  // Валидация всех полей
  const validateForm = () => {
    const newErrors = {
      email: validateEmail(formData.email),
      firstName: validateName(formData.firstName, "Имя"),
      lastName: validateName(formData.lastName, "Фамилия"),
      middleName: formData.middleName ? validateName(formData.middleName, "Отчество") : "",
      phone: validateOptionalPhone(formData.phone),
      password: validatePassword(formData.password),
    };
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.firstName && !newErrors.lastName && 
           !newErrors.middleName && !newErrors.phone && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Помечаем все поля как "тронутые" для показа ошибок
    setTouched({
      email: true,
      firstName: true,
      lastName: true,
      middleName: true,
      phone: true,
      password: true,
    });
    
    // Валидация всех полей
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
      // Сбрасываем форму после успешного создания
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        middleName: "",
        phone: "",
        password: "",
      });
      setErrors({
        email: "",
        firstName: "",
        lastName: "",
        middleName: "",
        phone: "",
        password: "",
      });
      setTouched({
        email: false,
        firstName: false,
        lastName: false,
        middleName: false,
        phone: false,
        password: false,
      });
    } catch (e) {
      safeError("Error in form submit:", e);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики изменения полей с валидацией
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handleFirstNameChange = (e) => {
    const value = formatName(e.target.value);
    setFormData({ ...formData, firstName: value });
    if (touched.firstName) {
      setErrors({ ...errors, firstName: validateName(value, "Имя") });
    }
  };

  const handleLastNameChange = (e) => {
    const value = formatName(e.target.value);
    setFormData({ ...formData, lastName: value });
    if (touched.lastName) {
      setErrors({ ...errors, lastName: validateName(value, "Фамилия") });
    }
  };

  const handleMiddleNameChange = (e) => {
    const value = formatName(e.target.value);
    setFormData({ ...formData, middleName: value });
    if (touched.middleName && value) {
      setErrors({ ...errors, middleName: validateName(value, "Отчество") });
    } else if (touched.middleName) {
      setErrors({ ...errors, middleName: "" });
    }
  };

  const handlePhoneChange = (e) => {
    const value = formatPhone(e.target.value);
    setFormData({ ...formData, phone: value });
    if (touched.phone) {
      setErrors({ ...errors, phone: validateOptionalPhone(value) });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Создать пользователя (Staff)</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => setTouched({ ...touched, email: true })}
              placeholder="user@example.com"
              className={touched.email && errors.email ? "border-red-500" : ""}
              required
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={handlePasswordChange}
              onBlur={() => setTouched({ ...touched, password: true })}
              placeholder="Минимум 6 символов"
              className={touched.password && errors.password ? "border-red-500" : ""}
              required
              minLength={6}
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={handleFirstNameChange}
              onBlur={() => setTouched({ ...touched, firstName: true })}
              placeholder="Иван"
              className={touched.firstName && errors.firstName ? "border-red-500" : ""}
              required
            />
            {touched.firstName && errors.firstName && (
              <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={handleLastNameChange}
              onBlur={() => setTouched({ ...touched, lastName: true })}
              placeholder="Иванов"
              className={touched.lastName && errors.lastName ? "border-red-500" : ""}
              required
            />
            {touched.lastName && errors.lastName && (
              <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отчество
            </label>
            <Input
              type="text"
              value={formData.middleName}
              onChange={handleMiddleNameChange}
              onBlur={() => setTouched({ ...touched, middleName: true })}
              placeholder="Иванович"
              className={touched.middleName && errors.middleName ? "border-red-500" : ""}
            />
            {touched.middleName && errors.middleName && (
              <p className="mt-1 text-xs text-red-500">{errors.middleName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              onBlur={() => setTouched({ ...touched, phone: true })}
              placeholder="+7 (999) 123-45-67"
              className={touched.phone && errors.phone ? "border-red-500" : ""}
            />
            {touched.phone && errors.phone && (
              <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            disabled={loading}
          >
            {loading ? "Создание..." : "Создать пользователя"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}

