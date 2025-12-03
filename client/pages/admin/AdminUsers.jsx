import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck, Trash2 } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Пользователи</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-2">Управление правами доступа пользователей</p>
            </div>

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

