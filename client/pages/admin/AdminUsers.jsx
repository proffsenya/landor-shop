import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

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
        setUsers(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to load users:", res.status);
      }
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleStaff = async (userId, currentStatus) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/admin/users/${userId}/staff`, {
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
        alert("Ошибка при обновлении статуса");
      }
    } catch (e) {
      console.error("Error updating user status:", e);
      alert("Ошибка при обновлении статуса");
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
      <AdminHeader isSuperUser={isSuperUser} />
      <div className="flex">
        <AdminSidebar isSuperUser={isSuperUser} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
              <p className="text-gray-600 mt-2">Управление правами доступа пользователей</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата регистрации</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Super User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                        Нет пользователей
                      </td>
                    </tr>
                  ) : (
                    users.map((user, index) => (
                      <tr key={user.email || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{user.email || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}${user.middleName ? ` ${user.middleName}` : ""}`
                            : user.firstName || user.lastName || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{user.phone || "-"}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isStaff ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isStaff ? "Да" : "Нет"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isSuperUser ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.isSuperUser ? "Да" : "Нет"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {!user.isSuperUser && (
                            <button
                              onClick={() => toggleStaff(user.email, user.isStaff)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                user.isStaff
                                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {user.isStaff ? (
                                <>
                                  <UserCheck className="w-3 h-3 inline mr-1" />
                                  Убрать Staff
                                </>
                              ) : (
                                <>
                                  <Shield className="w-3 h-3 inline mr-1" />
                                  Назначить Staff
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

