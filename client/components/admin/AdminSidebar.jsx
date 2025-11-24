import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Settings,
  FolderTree,
  LogOut,
  FileText
} from "lucide-react";

export default function AdminSidebar({ isSuperUser }) {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isSuperUser");
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h2 className="text-xl font-bold">Админ-панель</h2>
      </div>
      <nav className="px-4 space-y-2">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Дашборд</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <Package className="w-5 h-5" />
          <span>Товары</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Заказы</span>
        </NavLink>
        <NavLink
          to="/admin/categories"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <FolderTree className="w-5 h-5" />
          <span>Категории</span>
        </NavLink>
        <NavLink
          to="/admin/forms"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <FileText className="w-5 h-5" />
          <span>Заявки</span>
        </NavLink>
        {isSuperUser && (
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#6F2A2B] text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Пользователи</span>
          </NavLink>
        )}
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span>Настройки</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Выйти</span>
        </button>
      </nav>
    </aside>
  );
}

