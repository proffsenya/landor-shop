import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { checkAdminAccess } from "@/utils/adminAuth";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем права доступа
    const { isStaff: staff, isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsStaff(staff);
    setIsSuperUser(superUser);
    setLoading(false);
  }, [navigate]);

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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Панель управления</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Товары</h3>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Заказы</h3>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Пользователи</h3>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Категории</h3>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Быстрые действия</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => navigate("/admin/products")}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left"
                >
                  <h3 className="font-semibold mb-1">Добавить товар</h3>
                  <p className="text-sm opacity-75">Создать новый товар</p>
                </button>
                <button
                  onClick={() => navigate("/admin/categories")}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left"
                >
                  <h3 className="font-semibold mb-1">Управление категориями</h3>
                  <p className="text-sm opacity-75">Редактировать категории</p>
                </button>
                {isSuperUser && (
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left"
                  >
                    <h3 className="font-semibold mb-1">Управление пользователями</h3>
                    <p className="text-sm opacity-75">Назначить staff</p>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

