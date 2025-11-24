import { useNavigate } from "react-router-dom";

export default function AdminHeader({ isSuperUser }) {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("adminEmail") || localStorage.getItem("authEmail") || "";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Админ-панель</h1>
          {isSuperUser && (
            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
              Super Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{adminEmail}</span>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-[#6F2A2B] hover:underline"
          >
            Вернуться на сайт
          </button>
        </div>
      </div>
    </header>
  );
}

