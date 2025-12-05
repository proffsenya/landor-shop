import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, UserCheck, Trash2, Plus, X } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess || !superUser) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
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
        console.log("[AdminUsers] Loaded users:", usersList.length);
        setUsers(usersList);
      } else {
        const errorText = await res.text();
        console.error("Failed to load users:", res.status, errorText);
        setUsers([]);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaff = async (userEmail, currentStatus) => {
    try {
      const adminToken = getAdminToken();
      // Используем email для идентификации пользователя
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userEmail)}/staff`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isStaff: !currentStatus }),
      });

      if (res.ok) {
        loadUsers();
      } else {
        const errorText = await res.text();
        alert(`Ошибка при обновлении статуса: ${errorText || res.statusText}`);
      }
    } catch (e) {
      console.error("Error updating user status:", e);
      alert("Ошибка при обновлении статуса");
    }
  };

  const handleDeleteUser = async (userEmail) => {
    if (!userEmail) {
      alert("Не удалось определить email пользователя");
      return;
    }

    if (!confirm(`Вы уверены, что хотите удалить пользователя ${userEmail}? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      const adminToken = getAdminToken();
      // Используем email для идентификации пользователя
      const res = await fetch(`/api/users/${encodeURIComponent(userEmail)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        loadUsers();
        alert("Пользователь успешно удален");
      } else {
        const errorText = await res.text();
        let errorMessage = `Ошибка ${res.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        alert(`Ошибка при удалении пользователя: ${errorMessage}`);
      }
    } catch (e) {
      console.error("Error deleting user:", e);
      alert("Ошибка при удалении пользователя");
    }
  };

  const handleCreateUser = async (formData) => {
    try {
      // Получаем оба токена для проверки
      const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      const isSuperUserLocal = typeof window !== "undefined" ? localStorage.getItem("isSuperUser") === "true" : false;
      
      console.log("[AdminUsers] Token check:", {
        hasAuthToken: !!authToken,
        hasAdminToken: !!adminToken,
        isSuperUser: isSuperUserLocal,
        authTokenValue: authToken ? `${authToken.substring(0, 20)}...` : null,
        adminTokenValue: adminToken ? `${adminToken.substring(0, 20)}...` : null,
      });

      // Используем adminToken если есть, иначе authToken
      const tokenToUse = adminToken || (authToken && authToken !== "guest" ? authToken : null);
      
      if (!tokenToUse) {
        alert("Ошибка: токен авторизации не найден. Пожалуйста, войдите заново.");
        navigate("/admin/login");
        return;
      }

      // Проверяем, что пользователь действительно superuser
      const { isSuperUser: superUser } = checkAdminAccess();
      if (!superUser) {
        alert("Ошибка: недостаточно прав для создания пользователя. Требуется роль Super User.");
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

      console.log("[AdminUsers] Creating user with payload:", { ...payload, passwordHash: "***" });

      console.log("[AdminUsers] Sending request to /api/users/admin/create with token:", tokenToUse ? `${tokenToUse.substring(0, 20)}...` : "null");

      const res = await fetch("/api/users/admin/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("[AdminUsers] Response status:", res.status, res.statusText);

      if (res.ok) {
        loadUsers();
        setShowCreateForm(false);
        alert("Пользователь успешно создан");
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
        
        console.error("[AdminUsers] Error creating user:", res.status, errorText);
        alert(`Ошибка при создании пользователя: ${errorMessage}`);
      }
    } catch (e) {
      console.error("Error creating user:", e);
      alert(`Ошибка при создании пользователя: ${e.message || "Неизвестная ошибка"}`);
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

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">ФИО</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Телефон</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Дата регистрации</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Super User</th>
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
                      <tr key={user.email || index}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                            <span className="truncate block max-w-[150px] sm:max-w-none" title={user.email || "-"}>
                              {user.email || "-"}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}${user.middleName ? ` ${user.middleName}` : ""}`
                            : user.firstName || user.lastName || "-"}
                        </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">{user.phone || "-"}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
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
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isSuperUser ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isSuperUser ? "Да" : "Нет"}
                          </span>
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2">
                          {!user.isSuperUser && (
                            <button
                              onClick={() => toggleStaff(user.email, user.isStaff)}
                                  className={`px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                                user.isStaff
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {user.isStaff ? (
                                <>
                                  <UserCheck className="w-3 h-3 inline mr-1" />
                                      <span className="hidden sm:inline">Убрать Staff</span>
                                      <span className="sm:hidden">Убрать</span>
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3 inline mr-1" />
                                      <span className="hidden sm:inline">Назначить Staff</span>
                                      <span className="sm:hidden">Staff</span>
                                </>
                              )}
                            </button>
                          )}
                              {!user.isSuperUser && (
                                <button
                                  onClick={() => handleDeleteUser(user.email)}
                                  className="px-2 sm:px-3 py-1 rounded text-xs font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200 flex items-center justify-center gap-1"
                                  title="Удалить пользователя"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span className="hidden sm:inline">Удалить</span>
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
          </div>
        </main>
      </div>
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      alert("Заполните все обязательные поля: Email, Имя, Фамилия, Пароль");
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Введите корректный email адрес");
      return;
    }

    // Валидация пароля (минимум 6 символов)
    if (formData.password.length < 6) {
      alert("Пароль должен содержать минимум 6 символов");
      return;
    }

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (e) {
      console.error("Error in form submit:", e);
    } finally {
      setLoading(false);
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пароль <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Минимум 6 символов"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Иван"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Иванов"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отчество
            </label>
            <Input
              type="text"
              value={formData.middleName}
              onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              placeholder="Иванович"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+7 (999) 123-45-67"
            />
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

