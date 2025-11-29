import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadCategories();
  }, [navigate]);

  const loadCategories = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/categories", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error loading categories:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить категорию?")) return;

    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        loadCategories();
        // Отправляем событие для обновления каталога
        window.dispatchEvent(new Event("catalog:categories-updated"));
      } else {
        alert("Ошибка при удалении");
      }
    } catch (e) {
      console.error("Error deleting category:", e);
      alert("Ошибка при удалении");
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
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Категории</h1>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setShowForm(true);
                }}
                className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить категорию
              </Button>
            </div>

            {showForm && (
              <CategoryForm
                category={editingCategory}
                categories={categories}
                onClose={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                }}
                onSave={() => {
                  setShowForm(false);
                  setEditingCategory(null);
                  loadCategories();
                }}
              />
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Slug</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Родитель</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Активна</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                        Нет категорий
                      </td>
                    </tr>
                  ) : (
                    categories.map((category) => (
                      <tr key={category.id}>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.id}</td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">{category.name}</td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">{category.slug || "-"}</td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell">
                          {category.parentName || "Корневая"}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                            {category.isActive ? "Да" : "Нет"}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => {
                              setEditingCategory(category);
                              setShowForm(true);
                            }}
                              className="text-[#6F2A2B] hover:text-[#5a2223]"
                              title="Редактировать"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            className="text-red-600 hover:text-red-800"
                              title="Удалить"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

function CategoryForm({ category, categories, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    slug: category?.slug || "",
    description: category?.description || "",
    parentId: category?.parentId ? String(category.parentId) : "",
    isActive: category?.isActive !== undefined ? category.isActive : true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      const adminToken = getAdminToken();
      const url = category
        ? `/api/admin/categories/${category.id}`
        : "/api/admin/categories";
      const method = category ? "PUT" : "POST";

      const payload = {
        ...formData,
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSave();
        // Отправляем событие для обновления каталога
        window.dispatchEvent(new Event("catalog:categories-updated"));
      } else {
        alert("Ошибка при сохранении");
      }
    } catch (e) {
      console.error("Error saving category:", e);
      alert("Ошибка при сохранении");
    }
  };

  // Фильтруем категории, исключая текущую (при редактировании)
  const availableParents = categories.filter((cat) => cat.id !== category?.id);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">
        {category ? "Редактировать категорию" : "Добавить категорию"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Название *
          </label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug *
          </label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
            placeholder="category-slug"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
            rows="3"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Родительская категория
          </label>
          <Select
            value={formData.parentId}
            onValueChange={(value) => setFormData({ ...formData, parentId: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Нет (корневая категория)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Нет (корневая категория)</SelectItem>
              {availableParents.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-[#6F2A2B] border-gray-300 rounded focus:ring-[#6F2A2B]"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
            Активна
          </label>
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]">
            Сохранить
          </Button>
          <Button type="button" onClick={onClose} variant="outline">
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}

