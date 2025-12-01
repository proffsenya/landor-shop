import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  FileText,
  X,
  Sliders
} from "lucide-react";

export default function AdminSidebar({ isSuperUser, isOpen, onClose }) {
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("isStaff");
    localStorage.removeItem("isSuperUser");
    window.location.href = "/admin/login";
  };

  // Закрываем меню при клике на ссылку на мобильных
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay для мобильных */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white min-h-screen
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 lg:p-6 flex items-center justify-between">
          <h2 className="text-lg lg:text-xl font-bold">Админ-панель</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      <nav className="px-2 lg:px-4 space-y-2 pb-4">
        <NavLink
          to="/admin"
          end
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Дашборд</span>
        </NavLink>
        <NavLink
          to="/admin/products"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <Package className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Товары</span>
        </NavLink>
        <NavLink
          to="/admin/orders"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Заказы</span>
        </NavLink>
        <NavLink
          to="/admin/filters"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <Sliders className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Фильтры и категории</span>
        </NavLink>
        <NavLink
          to="/admin/forms"
          onClick={handleNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
              isActive
                ? "bg-[#6F2A2B] text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`
          }
        >
          <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Заявки</span>
        </NavLink>
        {isSuperUser && (
          <NavLink
            to="/admin/users"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-colors text-sm lg:text-base ${
                isActive
                  ? "bg-[#6F2A2B] text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`
            }
          >
            <Users className="w-4 h-4 lg:w-5 lg:h-5" />
            <span>Пользователи</span>
          </NavLink>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors text-sm lg:text-base"
        >
          <LogOut className="w-4 h-4 lg:w-5 lg:h-5" />
          <span>Выйти</span>
        </button>
      </nav>
    </aside>
    </>
  );
}

