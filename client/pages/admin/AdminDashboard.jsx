import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { initNotifications } from "@/utils/notifications";
import { Package, ShoppingCart, Users, FolderTree, Plus, Edit, Eye, FileText, Sliders } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    products: 0,
    variants: 0,
    orders: 0,
    users: 0,
    categories: 0,
  });

  useEffect(() => {
    // Проверяем права доступа
    const { isStaff: staff, isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsStaff(staff);
    setIsSuperUser(superUser);
    loadStats(superUser);

    // Инициализируем систему уведомлений
    const adminToken = getAdminToken();
    if (adminToken && (staff || superUser)) {
      initNotifications(adminToken, staff, superUser).then((cleanup) => {
        // Сохраняем функцию очистки для cleanup при размонтировании
        return cleanup;
      }).catch((e) => {
        console.error("Error initializing notifications:", e);
      });
    }
  }, [navigate]);

  const loadStats = async (isSuperUserFlag = false) => {
    try {
      const adminToken = getAdminToken();
      
      // Загружаем статистику параллельно
      const [productsRes, ordersRes, categoriesRes, usersRes] = await Promise.all([
        fetch("/api/products/cards", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/categories", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        isSuperUserFlag ? fetch("/api/users", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }) : Promise.resolve({ ok: false }),
      ]);

      if (productsRes.ok) {
        const products = await productsRes.json();
        const productsList = Array.isArray(products) ? products : [];
        const productsCount = productsList.length;
        // Подсчитываем общее количество вариантов во всех продуктах
        const variantsCount = productsList.reduce((total, product) => {
          const variants = Array.isArray(product.variants) ? product.variants : [];
          return total + variants.length;
        }, 0);
        setStats(prev => ({ 
          ...prev, 
          products: productsCount,
          variants: variantsCount
        }));
      }

      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        setStats(prev => ({ ...prev, orders: Array.isArray(orders) ? orders.length : 0 }));
      }

      if (categoriesRes.ok) {
        const categories = await categoriesRes.json();
        setStats(prev => ({ ...prev, categories: Array.isArray(categories) ? categories.length : 0 }));
      }

      if (usersRes.ok && isSuperUserFlag) {
        const users = await usersRes.json();
        setStats(prev => ({ ...prev, users: Array.isArray(users) ? users.length : 0 }));
      }
    } catch (e) {
      console.error("Error loading stats:", e);
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Панель управления</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Продукты</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.products}</p>
                  </div>
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F2A2B] opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Варианты</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.variants}</p>
                  </div>
                  <Package className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F2A2B] opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Заказы</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.orders}</p>
                  </div>
                  <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F2A2B] opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Пользователи</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{isSuperUser ? stats.users : "-"}</p>
                  </div>
                  <Users className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F2A2B] opacity-50" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                <h3 className="text-xs sm:text-sm font-medium text-gray-500 mb-2">Категории</h3>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.categories}</p>
                  </div>
                  <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 text-[#6F2A2B] opacity-50" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Быстрые действия</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => navigate("/admin/products")}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                    <h3 className="text-sm sm:text-base font-semibold">Добавить товар</h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Создать новый товар в каталоге</p>
                </button>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                    <h3 className="text-sm sm:text-base font-semibold">Просмотр заказов</h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Управление заказами клиентов</p>
                </button>
                <button
                  onClick={() => navigate("/admin/filters")}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sliders className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                    <h3 className="text-sm sm:text-base font-semibold">Фильтры и категории</h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Управление фильтрами и категориями</p>
                </button>
                <button
                  onClick={() => navigate("/admin/products")}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Edit className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                    <h3 className="text-sm sm:text-base font-semibold">Редактировать товары</h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Изменить существующие товары</p>
                </button>
                <button
                  onClick={() => navigate("/admin/forms")}
                  className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                    <h3 className="text-sm sm:text-base font-semibold">Заявки</h3>
                  </div>
                  <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Просмотр заявок от клиентов</p>
                </button>
                {isSuperUser && (
                  <button
                    onClick={() => navigate("/admin/users")}
                    className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-[#6F2A2B] hover:bg-[#6F2A2B] hover:text-white transition-colors text-left group"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 group-hover:text-white text-[#6F2A2B]" />
                      <h3 className="text-sm sm:text-base font-semibold">Управление пользователями</h3>
                    </div>
                    <p className="text-xs sm:text-sm opacity-75 group-hover:text-white/90">Назначить права доступа</p>
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

