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
import { ToastMotion } from "@/utils/PageAnimations";
import { handleApiError } from "@/utils/errorMessages";
import { safeError } from "@/utils/logger";

// Конфигурация типов фильтров
const FILTER_TYPES = {
  brands: {
    label: "Бренды",
    endpoint: "/api/catalog/brands",
    adminEndpoint: "/api/catalog/brands",
    createEndpoint: "/api/catalog/brands", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
  },
  breeds: {
    label: "Породы",
    endpoint: "/api/catalog/breeds",
    adminEndpoint: "/api/catalog/breeds",
    createEndpoint: "/api/catalog/breeds", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "categoryId", label: "Категория", required: true, type: "select", selectType: "categories" },
    ],
  },
  categories: {
    label: "Категории",
    endpoint: "/api/catalog/categories",
    adminEndpoint: "/api/catalog/categories",
    createEndpoint: "/api/catalog/categories", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "description", label: "Описание", required: false, type: "textarea" },
      { key: "parentId", label: "Родительская категория", required: false, type: "select" },
      { key: "isActive", label: "Активна", required: false, type: "checkbox" },
    ],
  },
  colors: {
    label: "Цвета",
    endpoint: "/api/catalog/colors",
    adminEndpoint: "/api/catalog/colors",
    createEndpoint: "/api/catalog/colors", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
  },
  countries: {
    label: "Страны",
    endpoint: "/api/catalog/countries",
    adminEndpoint: "/api/catalog/countries",
    createEndpoint: "/api/catalog/countries", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
  },
  flavors: {
    label: "Вкусы",
    endpoint: "/api/catalog/flavors",
    adminEndpoint: "/api/catalog/flavors",
    createEndpoint: "/api/catalog/flavors", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "canonicalName", label: "Каноническое название", required: true },
    ],
  },
  productTypes: {
    label: "Типы продуктов",
    endpoint: "/api/catalog/productTypes",
    adminEndpoint: "/api/catalog/productTypes",
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
    createEndpoint: "/api/catalog/productTypes", // Для создания используем обычный эндпоинт
  },
  scents: {
    label: "Запахи",
    endpoint: "/api/catalog/scents",
    adminEndpoint: "/api/catalog/scents",
    createEndpoint: "/api/catalog/scents", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
  },
  typeOfFoods: {
    label: "Типы корма",
    endpoint: "/api/catalog/typeOfFoods",
    adminEndpoint: "/api/catalog/typeOfFoods",
    createEndpoint: "/api/catalog/typeOfFoods", // Для POST используем обычный эндпоинт
    fields: [
      { key: "name", label: "Название", required: true },
      { key: "slug", label: "Slug", required: true },
    ],
  },
};

export default function AdminFilters() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFilterType, setSelectedFilterType] = useState("");
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });
  const [itemsLoading, setItemsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    setLoading(false);
  }, [navigate]);

  // Загрузка элементов выбранного фильтра
  const loadItems = async (filterType) => {
    if (!filterType || !FILTER_TYPES[filterType]) return;

    try {
      setItemsLoading(true);
      const adminToken = getAdminToken();
      const config = FILTER_TYPES[filterType];
      const res = await fetch(config.endpoint, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        safeError("Failed to load items:", res.status);
        setItems([]);
      }
    } catch (e) {
      safeError("Error loading items:", e);
      setItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  // Загрузка отдельного элемента
  const loadItem = async (filterType, itemId) => {
    if (!filterType || !FILTER_TYPES[filterType] || !itemId) return null;

    try {
      const adminToken = getAdminToken();
      const config = FILTER_TYPES[filterType];
      const res = await fetch(`${config.endpoint}/${itemId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      safeError("Error loading item:", e);
      return null;
    }
  };

  // Обработка изменения типа фильтра
  const handleFilterTypeChange = (value) => {
    setSelectedFilterType(value);
    setShowForm(false);
    setEditingItem(null);
    if (value) {
      loadItems(value);
    } else {
      setItems([]);
    }
  };

  // Функция для показа toast уведомлений
  const showToast = (message, type = "success", duration = 3000) => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), duration);
  };

  // Удаление элемента
  const handleDelete = async (itemId) => {
    try {
      const adminToken = getAdminToken();
      const config = FILTER_TYPES[selectedFilterType];
      const res = await fetch(`${config.endpoint}/${itemId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        loadItems(selectedFilterType);
        // Отправляем событие для обновления каталога
        window.dispatchEvent(new Event("catalog:filters-updated"));
        showToast("Элемент успешно удален");
      } else {
        // Используем утилиту для преобразования ошибки в понятное сообщение
        const errorMessage = await handleApiError(res, "удаление", config.label.toLowerCase());
        showToast(errorMessage, 5000);
      }
    } catch (e) {
      safeError("Error deleting item:", e);
      showToast("Ошибка при удалении. Попробуйте позже.", 3000);
    }
  };

  // Открытие формы редактирования
  const handleEdit = async (item) => {
    // Загружаем полные данные элемента
    const fullItem = await loadItem(selectedFilterType, item.id);
    if (fullItem) {
      setEditingItem(fullItem);
      setShowForm(true);
    } else {
      // Если не удалось загрузить, используем данные из списка
      setEditingItem(item);
      setShowForm(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
      </div>
    );
  }

  const config = selectedFilterType ? FILTER_TYPES[selectedFilterType] : null;

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
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl sm:mb-6">Фильтры</h1>

            {/* Выбор типа фильтра */}
            <div className="p-4 mb-6 bg-white rounded-lg shadow sm:p-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Выберите тип фильтра
              </label>
              <Select value={selectedFilterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Выберите тип фильтра" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FILTER_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Форма создания/редактирования */}
            {showForm && config && (
              <FilterForm
                filterType={selectedFilterType}
                config={config}
                item={editingItem}
                items={items}
                showToast={showToast}
                onClose={() => {
                  setShowForm(false);
                  setEditingItem(null);
                }}
                onSave={() => {
                  setShowForm(false);
                  setEditingItem(null);
                  loadItems(selectedFilterType);
                }}
              />
            )}

            {/* Таблица элементов */}
            {selectedFilterType && config && (
              <div className="overflow-hidden bg-white rounded-lg shadow">
                <div className="flex flex-col gap-4 p-4 border-b border-gray-200 sm:p-6 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">{config.label}</h2>
                  <Button
                    onClick={() => {
                      setEditingItem(null);
                      setShowForm(true);
                    }}
                    className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить
                  </Button>
                </div>

                {itemsLoading ? (
                  <div className="p-8 text-center text-gray-500">Загрузка...</div>
                ) : items.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">Нет элементов</div>
                ) : (
                  <>
                    {/* Десктопная таблица */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">ID</th>
                            <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Название</th>
                            {config.fields.some(f => f.key === "slug") && (
                            <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Slug</th>
                            )}
                            {config.fields.some(f => f.key === "canonicalName") && (
                              <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Каноническое название</th>
                            )}
                            {config.fields.some(f => f.key === "isActive") && (
                              <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Активна</th>
                            )}
                            <th className="px-3 py-3 text-xs font-medium text-center text-gray-500 uppercase sm:px-6">Действия</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {items.map((item) => (
                            <tr key={item.id} className="transition-colors hover:bg-gray-50">
                              <td className="px-3 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">{item.id}</td>
                              <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">{item.name || "-"}</td>
                              {config.fields.some(f => f.key === "slug") && (
                              <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">{item.slug || "-"}</td>
                              )}
                              {config.fields.some(f => f.key === "canonicalName") && (
                                <td className="px-3 py-4 text-sm text-gray-500 sm:px-6">{item.canonicalName || "-"}</td>
                              )}
                              {config.fields.some(f => f.key === "isActive") && (
                                <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                  }`}>
                                    {item.isActive ? "Да" : "Нет"}
                                  </span>
                                </td>
                              )}
                              <td className="px-3 py-4 text-sm sm:px-6 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2 sm:gap-4">
                                  <button
                                    onClick={() => handleEdit(item)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Редактировать"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Удалить"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Мобильные/планшетные карточки */}
                    <div className="lg:hidden space-y-4 p-4">
                      {items.map((item) => (
                        <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">{item.name || "-"}</h3>
                              <p className="text-xs text-gray-500 mt-1">ID: {item.id}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                title="Редактировать"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Удалить"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 pt-2 border-t border-gray-200">
                            {config.fields.some(f => f.key === "slug") && item.slug && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Slug:</span>
                                <span className="text-sm text-gray-900 break-all text-right ml-2">{item.slug}</span>
                              </div>
                            )}
                            {config.fields.some(f => f.key === "canonicalName") && item.canonicalName && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Каноническое название:</span>
                                <span className="text-sm text-gray-900 break-all text-right ml-2">{item.canonicalName}</span>
                              </div>
                            )}
                            {config.fields.some(f => f.key === "isActive") && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Активна:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  item.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                }`}>
                                  {item.isActive ? "Да" : "Нет"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <ToastMotion show={toast.show} type={toast.type}>
        {toast.message}
      </ToastMotion>
    </div>
  );
}

// Компонент формы для создания/редактирования
function FilterForm({ filterType, config, item, items, onClose, onSave, showToast }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Загрузка категорий для выбора categoryId при добавлении породы
  useEffect(() => {
    const categoryField = config.fields.find(f => f.key === "categoryId" && f.selectType === "categories");
    if (categoryField) {
      loadCategories();
    }
  }, [config, filterType]);

  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const adminToken = getAdminToken();
      const res = await fetch("/api/catalog/categories", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      safeError("Error loading categories:", e);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    // Инициализация формы данными элемента или пустыми значениями
    const initialData = {};
    config.fields.forEach((field) => {
      if (field.type === "checkbox") {
        initialData[field.key] = item?.[field.key] !== undefined ? item[field.key] : false;
      } else if (field.type === "select") {
        initialData[field.key] = item?.[field.key] ? String(item[field.key]) : "";
      } else {
        initialData[field.key] = item?.[field.key] || "";
      }
    });
    setFormData(initialData);
  }, [item, config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация обязательных полей
    const requiredFields = config.fields.filter(f => f.required);
    for (const field of requiredFields) {
      if (!formData[field.key] || formData[field.key].toString().trim() === "") {
        showToast(`Заполните поле "${field.label}"`, "error");
        return;
      }
    }

    try {
      setLoading(true);
      const adminToken = getAdminToken();
      
      // Для POST используем обычный endpoint (createEndpoint), для PUT/DELETE - admin endpoint
      const url = item
        ? `${config.adminEndpoint}/${item.id}`
        : (config.createEndpoint || config.endpoint || config.adminEndpoint);
      const method = item ? "PUT" : "POST";

      // Подготовка данных для отправки
      const payload = { ...formData };
      
      // Преобразование типов данных
      config.fields.forEach((field) => {
        if (field.type === "select") {
          if (payload[field.key] && payload[field.key].toString().trim() !== "") {
            payload[field.key] = Number(payload[field.key]);
          } else {
            // Если поле необязательное и пустое, удаляем его из payload
            // Для обязательных полей валидация уже должна была сработать
            if (!field.required) {
              delete payload[field.key];
            } else {
              // Это не должно произойти для обязательных полей, но на всякий случай
              payload[field.key] = null;
            }
          }
        } else if (field.type === "checkbox") {
          payload[field.key] = Boolean(payload[field.key]);
        }
      });
      
      // Для flavors оставляем только name и canonicalName
      if (filterType === "flavors") {
        const cleanPayload = {
          name: (payload.name || "").toString().trim(),
          canonicalName: (payload.canonicalName || "").toString().trim(),
        };
        // Удаляем все остальные поля (включая slug, если он был)
        Object.keys(payload).forEach((key) => {
          if (key !== "name" && key !== "canonicalName") {
            delete payload[key];
          }
        });
        // Обновляем значения
        payload.name = cleanPayload.name;
        payload.canonicalName = cleanPayload.canonicalName;
        
      }
      
      // Для scents оставляем только name и slug
      if (filterType === "scents") {
        const cleanPayload = {
          name: (payload.name || "").toString().trim(),
          slug: (payload.slug || "").toString().trim(),
        };
        // Удаляем все остальные поля
        Object.keys(payload).forEach((key) => {
          if (key !== "name" && key !== "slug") {
            delete payload[key];
          }
        });
        // Обновляем значения
        payload.name = cleanPayload.name;
        payload.slug = cleanPayload.slug;
        
      }
      
      // Для scents оставляем только name и slug
      if (filterType === "scents") {
        const cleanPayload = {
          name: (payload.name || "").toString().trim(),
          slug: (payload.slug || "").toString().trim(),
        };
        // Удаляем все остальные поля
        Object.keys(payload).forEach((key) => {
          if (key !== "name" && key !== "slug") {
            delete payload[key];
          }
        });
        // Обновляем значения
        payload.name = cleanPayload.name;
        payload.slug = cleanPayload.slug;
        
      }
      
      // Для countries оставляем только name и slug
      if (filterType === "countries") {
        const cleanPayload = {
          name: (payload.name || "").toString().trim(),
          slug: (payload.slug || "").toString().trim(),
        };
        // Удаляем все остальные поля
        Object.keys(payload).forEach((key) => {
          if (key !== "name" && key !== "slug") {
            delete payload[key];
          }
        });
        // Обновляем значения
        payload.name = cleanPayload.name;
        payload.slug = cleanPayload.slug;
        
      }
      
      // Для productTypes оставляем только name и slug
      if (filterType === "productTypes") {
        const cleanPayload = {
          name: (payload.name || "").toString().trim(),
          slug: (payload.slug || "").toString().trim(),
        };
        // Удаляем все остальные поля
        Object.keys(payload).forEach((key) => {
          if (key !== "name" && key !== "slug") {
            delete payload[key];
          }
        });
        // Обновляем значения
        payload.name = cleanPayload.name;
        payload.slug = cleanPayload.slug;
        
      }


      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(item ? "Элемент успешно обновлен" : "Элемент успешно создан");
        onSave();
        // Отправляем событие для обновления каталога
        window.dispatchEvent(new Event("catalog:filters-updated"));
      } else {
        // Используем утилиту для преобразования ошибки в понятное сообщение
        const errorMessage = await handleApiError(res, "сохранение", config.label.toLowerCase());
        showToast(`Ошибка при сохранении: ${errorMessage}`, "error");
      }
    } catch (e) {
      safeError("Error saving item:", e);
      showToast("Ошибка при сохранении", "error");
    } finally {
      setLoading(false);
    }
  };

  // Получение опций для select полей
  const getSelectOptions = (fieldKey, selectType) => {
    if (fieldKey === "parentId" && filterType === "categories") {
      return items.filter((cat) => cat.id !== item?.id);
    }
    if (fieldKey === "categoryId" && selectType === "categories") {
      return categories.filter((cat) => cat.isActive !== false);
    }
    return [];
  };

  return (
    <div className="p-6 mb-6 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold">
        {item ? `Редактировать ${config.label.toLowerCase()}` : `Добавить ${config.label.toLowerCase()}`}
      </h2>
      
      {/* Инструкции по заполнению фильтров */}
      <div className="p-4 mb-6 border-l-4 border-blue-500 rounded-r bg-blue-50">
        <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-900">
          <span>📋</span> Инструкция по заполнению данных для базы данных
        </h3>
        <div className="space-y-2 text-xs text-blue-800 sm:text-sm">
          <p><strong>Важно:</strong> Все данные сохраняются в базу данных и используются для фильтрации товаров на сайте!</p>
          <ul className="ml-2 space-y-1 list-disc list-inside">
            <li><strong>Название *</strong> - Название элемента на русском языке. Будет отображаться на сайте. Пример: "Royal Canin", "Корм для собак", "Курица"</li>
            <li><strong>Slug *</strong> - Уникальный идентификатор для URL (только латиница, цифры и дефисы). Автоматически формируется из названия. Пример: "royal-canin", "korm-dlya-sobak", "kuritsa"</li>
            {config.label === "Категории" && (
              <>
                <li><strong>Родительская категория</strong> - Если это подкатегория, выберите родительскую категорию. ⚠️НИЧЕГО НЕ ВЫБИРАТЬ!!!</li>
                <li><strong>Активна</strong> ?? - Если отмечено, категория видна на сайте. Если снято - скрыта, но остается в БД.</li>
              </>
            )}
            {config.label === "Породы" && (
              <li><strong>Категория *</strong> - Выберите категорию, к которой относится порода. Пример: "Собаки" или "Кошки"</li>
            )}
            {config.label === "Вкусы" && (
              <li><strong>Каноническое название *</strong> - Научное или стандартное название вкуса. Используется для внутренней идентификации в БД. Пример: "CHICKEN", "BEEF"</li>
            )}
          </ul>
          <p className="mt-2 text-xs font-semibold">⚠️ ВАЖНО ДЛЯ БД:</p>
          <ul className="ml-2 space-y-1 text-xs list-disc list-inside">
            <li>Slug должен быть уникальным! Нельзя создать два элемента с одинаковым slug.</li>
            <li>Slug используется в URL страниц, поэтому его нельзя изменить после создания.</li>
            <li>После создания элемента его можно использовать при добавлении товаров.</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {config.fields.map((field) => {
          if (field.type === "checkbox") {
            return (
              <div key={field.key}>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={field.key}
                    checked={formData[field.key] || false}
                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                    className="w-4 h-4 text-[#6F2A2B] border-gray-300 rounded focus:ring-[#6F2A2B]"
                  />
                  <label htmlFor={field.key} className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                </div>
                {field.key === "isActive" && (
                  <p className="mt-1 text-xs text-gray-500">Если отмечено, категория видна на сайте. Если снято - скрыта, но остается в БД.</p>
                )}
              </div>
            );
          }

          if (field.type === "textarea") {
            return (
              <div key={field.key}>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {field.label} {field.required && "*"}
                </label>
                <textarea
                  value={formData[field.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
                  rows="3"
                  placeholder="Подробное описание..."
                  required={field.required}
                />
                <p className="mt-1 text-xs text-gray-500">Подробное описание. Будет отображаться на странице категории. Можно использовать HTML для форматирования.</p>
              </div>
            );
          }

          if (field.type === "select") {
            const options = getSelectOptions(field.key, field.selectType);
            const showEmptyOption = !field.required && field.key !== "categoryId";
            const EMPTY_VALUE = "__none__";
            const currentValue = formData[field.key] && formData[field.key] !== "" ? formData[field.key] : undefined;
            return (
              <div key={field.key}>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {field.label} {field.required && "*"}
                </label>
                <Select
                  value={currentValue}
                  onValueChange={(value) => {
                    const newValue = value === EMPTY_VALUE ? "" : value;
                    setFormData({ ...formData, [field.key]: newValue });
                  }}
                  required={field.required}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Выберите ${field.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {showEmptyOption && <SelectItem value={EMPTY_VALUE}>Нет</SelectItem>}
                    {categoriesLoading ? (
                      <SelectItem value="__loading__" disabled>Загрузка...</SelectItem>
                    ) : (
                      options.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {field.key === "categoryId" && (
                  <p className="mt-1 text-xs text-gray-500">Выберите категорию, к которой относится порода.</p>
                )}
                {field.key === "parentId" && (
                  <p className="mt-1 text-xs text-gray-500">Если это подкатегория, выберите родительскую категорию. Оставьте пустым, если это основная категория.</p>
                )}
              </div>
            );
          }

          // Обычное текстовое поле
          return (
            <div key={field.key}>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                {field.label} {field.required && "*"}
              </label>
              <Input
                value={formData[field.key] || ""}
                onChange={(e) => {
                  let value = e.target.value;
                  // Автоматическое форматирование slug (только для полей slug, не для canonicalName)
                  if (field.key === "slug") {
                    value = value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                  }
                  setFormData({ ...formData, [field.key]: value });
                }}
                placeholder={
                  field.key === "slug" 
                    ? "example-slug" 
                    : field.key === "canonicalName" 
                    ? "CHICKEN, BEEF, FISH..." 
                    : field.key === "name"
                    ? "Например: Royal Canin"
                    : ""
                }
                required={field.required}
              />
              {field.key === "name" && (
                <p className="mt-1 text-xs text-gray-500">Название на русском языке. Будет отображаться на сайте пользователям.</p>
              )}
              {field.key === "slug" && (
                <p className="mt-1 text-xs text-gray-500">Уникальный идентификатор для URL. Только латиница, цифры и дефисы. Используется в адресе страницы.</p>
              )}
              {field.key === "canonicalName" && (
                <p className="mt-1 text-xs text-gray-500">Каноническое название (обычно на английском, заглавными буквами). Используется для внутренней идентификации в БД. Пример: "CHICKEN", "BEEF", "FISH"</p>
              )}
            </div>
          );
        })}
        <div className="flex gap-3">
          <Button 
            type="submit" 
            className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            disabled={loading}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" disabled={loading}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}

