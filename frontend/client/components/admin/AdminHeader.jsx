import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";

export default function AdminHeader({ isSuperUser, onMenuClick }) {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("authEmail") || "";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 py-3 lg:py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
            aria-label="Открыть меню"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Админ-панель</h1>
          {isSuperUser && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded hidden sm:inline">
              Super Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="text-xs sm:text-sm text-gray-600 truncate max-w-[120px] sm:max-w-none">{adminEmail}</span>
          <button
            onClick={() => navigate("/")}
            className="text-xs sm:text-sm text-[#6F2A2B] hover:underline whitespace-nowrap"
          >
            На сайт
          </button>
        </div>
      </div>
    </header>
  );
}

