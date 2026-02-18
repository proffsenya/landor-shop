import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { handleApiError } from "@/utils/errorMessages";
import { safeError } from "@/utils/logger";
import { ToastMotion } from "@/utils/PageAnimations";
import { formatWeight } from "@/utils/formatting";

// Функция нормализации е/ё для поиска
const normalizeE = (str) => {
  return str.replace(/ё/g, 'е').replace(/Ё/g, 'Е');
};

// Функция поиска для админки (ищет по названию товара и возвращает целые товары)
const searchProducts = (query, products) => {
  if (!query || !query.trim() || !products || products.length === 0) {
    return products;
  }

  const cleanQuery = normalizeE(query.trim().toLowerCase())
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanQuery) {
    return products;
  }

  const queryWords = cleanQuery.split(' ').filter(word => word.length > 0);

  return products.filter(product => {
    // Ищем по названию товара
    const productName = normalizeE((product.name || product.productName || '').toLowerCase())
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ищем по ID товара
    const productId = String(product.id || '').toLowerCase();

    // Ищем по названиям вариантов
    const variantNames = (product.variants || []).map(variant => {
      return normalizeE((variant.displayName || '').toLowerCase())
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }).join(' ');

    // Объединяем все тексты для поиска
    const searchText = `${productName} ${productId} ${variantNames}`.toLowerCase();

    // Проверяем, содержатся ли все слова запроса
    return queryWords.every(word => searchText.includes(word));
  });
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });
  
  // Поиск
  const [searchQuery, setSearchQuery] = useState("");
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Списки для выпадающих списков
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [countries, setCountries] = useState([]);
  const [typeoffood, setTypeoffood] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [colors, setColors] = useState([]);
  const [scents, setScents] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadAllData();
  }, [navigate]);

  const loadAllData = async () => {
    try {
      const adminToken = getAdminToken();
      
      // Загружаем товары через cards
      const productsRes = await fetch("/api/products/cards", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      
      // Загружаем все списки параллельно
      const [
        categoriesRes,
        brandsRes,
        breedsRes,
        countriesRes,
        typeoffoodRes,
        flavorsRes,
        colorsRes,
        scentsRes,
        productTypesRes,
      ] = await Promise.all([
        fetch("/api/catalog/categories", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/brands", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/breeds", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/countries", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/typeOfFoods", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/flavors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/colors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/scents", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/catalog/productTypes", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        const productsList = Array.isArray(data) ? data : [];
        // Сортируем товары по ID по возрастанию (от 1 до последнего)
        const sortedProducts = productsList.sort((a, b) => {
          const idA = a.id || 0;
          const idB = b.id || 0;
          return idA - idB;
        });
        setProducts(sortedProducts);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(Array.isArray(data) ? data : []);
      }
      if (brandsRes.ok) {
        const data = await brandsRes.json();
        setBrands(Array.isArray(data) ? data : []);
      }
      if (breedsRes.ok) {
        const data = await breedsRes.json();
        setBreeds(Array.isArray(data) ? data : []);
      }
      if (countriesRes.ok) {
        const data = await countriesRes.json();
        setCountries(Array.isArray(data) ? data : []);
      }
      if (typeoffoodRes.ok) {
        const data = await typeoffoodRes.json();
        setTypeoffood(Array.isArray(data) ? data : []);
      }
      if (flavorsRes.ok) {
        const data = await flavorsRes.json();
        setFlavors(Array.isArray(data) ? data : []);
      }
      if (colorsRes.ok) {
        const data = await colorsRes.json();
        setColors(Array.isArray(data) ? data : []);
      }
      if (scentsRes.ok) {
        const data = await scentsRes.json();
        setScents(Array.isArray(data) ? data : []);
      }
      if (productTypesRes.ok) {
        const data = await productTypesRes.json();
        setProductTypes(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      safeError("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), 3000);
  };

  // Фильтрация товаров по поисковому запросу
  const filteredProducts = searchProducts(searchQuery, products);

  // Вычисляем отображаемые товары для текущей страницы
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const displayedProducts = filteredProducts.slice(startIndex, endIndex);

  // Сбрасываем страницу при изменении списка товаров или поискового запроса
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredProducts.length, currentPage, totalPages]);

  const handleDelete = async (productId) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        loadAllData();
        showToast("Товар успешно удален");
      } else {
        const errorMessage = await handleApiError(res, "удаление", "товар");
        showToast(errorMessage, "error");
      }
    } catch (e) {
      safeError("Error deleting product:", e);
      const errorMessage = await handleApiError(e, "удаление", "товар");
      showToast(errorMessage, "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
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
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between sm:mb-6">
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Товары</h1>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Поле поиска */}
                <div className="relative flex-1 sm:flex-initial sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Поиск товаров..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Сбрасываем на первую страницу при поиске
                    }}
                    className="pl-10 w-full"
                  />
                </div>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Добавить товар</span>
                  <span className="sm:hidden">Добавить</span>
                </Button>
              </div>
            </div>

            {showForm && (
              <ProductForm
                product={editingProduct}
                categories={categories}
                brands={brands}
                breeds={breeds}
                countries={countries}
                typeoffood={typeoffood}
                flavors={flavors}
                colors={colors}
                scents={scents}
                productTypes={productTypes}
                showToast={showToast}
                onClose={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                onSave={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                  loadAllData();
                }}
              />
            )}

            <div className="overflow-hidden bg-white rounded-lg shadow">
              {/* Десктопная таблица */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">ID</th>
                      <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Название</th>
                      <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 lg:table-cell">Варианты</th>
                      <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Цена</th>
                      <th className="hidden px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6 lg:table-cell">Вес</th>
                      <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Наличие</th>
                      <th className="px-3 py-3 text-xs font-medium text-left text-gray-500 uppercase sm:px-6">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.length === 0 ? (
                    <tr>
                        <td colSpan="7" className="px-3 py-4 text-center text-gray-500 sm:px-6">
                        {searchQuery.trim() ? "Товары не найдены" : "Нет товаров"}
                      </td>
                    </tr>
                  ) : (
                    displayedProducts.map((product, index) => {
                      // Вычисляем статистику по вариантам
                      const variants = product.variants || [];
                      const variantCount = variants.length;
                      
                      // Цены
                      const prices = variants.map(v => v.price || 0).filter(p => p > 0);
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                      const priceRange = minPrice === maxPrice 
                        ? `${minPrice.toFixed(2)} ₽` 
                        : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ₽`;
                      
                      // Веса (уникальные значения)
                      const weights = [...new Set(variants.map(v => v.weight || 0).filter(w => w > 0))];
                      const weightDisplay = weights.length > 0 
                        ? weights.length === 1 
                          ? formatWeight(weights[0])
                          : weights.map(w => formatWeight(w)).join(', ')
                        : "-";
                      
                      // Общее наличие
                      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                      
                      // Первое изображение для идентификации
                      const firstImage = variants.find(v => v.imageUrl)?.imageUrl;
                      
                      const isExpanded = expandedProductId === product.id;
                      
                      return (
                        <React.Fragment key={product.id}>
                          <tr 
                            onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                            className="transition-colors cursor-pointer hover:bg-gray-50"
                          >
                            <td className="px-3 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">{product.id}</td>
                            <td className="px-3 py-4 text-sm text-gray-900 sm:px-6">
                            <div className="flex items-center gap-2">
                              {firstImage && (
                                <img 
                                  src={firstImage} 
                                  alt={product.name || product.productName}
                                  className="object-cover w-10 h-10 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <span>{product.name || product.productName}</span>
                            </div>
                            </td>
                            <td className="hidden px-3 py-4 text-sm text-gray-500 sm:px-6 lg:table-cell">
                              {variantCount > 0 ? (
                                <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">
                                  {variantCount} {variantCount === 1 ? 'вариант' : variantCount < 5 ? 'варианта' : 'вариантов'}
                                </span>
                              ) : "-"}
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-900 sm:px-6 whitespace-nowrap">
                              {priceRange !== "0.00 ₽" ? priceRange : "-"}
                            </td>
                            <td className="hidden px-3 py-4 text-sm text-gray-500 sm:px-6 lg:table-cell">
                              {weightDisplay}
                            </td>
                            <td className="px-3 py-4 text-sm sm:px-6">
                              <span className={`px-2 py-1 rounded text-xs ${
                                totalStock > 0 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {totalStock} шт.
                              </span>
                            </td>
                            <td className="px-3 py-4 text-sm sm:px-6 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1 sm:gap-2">
                              <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                // Всегда загружаем детали для редактирования
                                if (product.id) {
                                  try {
                                    const adminToken = getAdminToken();
                                    const res = await fetch(`/api/products/${product.id}/details`, {
                                      headers: { Authorization: `Bearer ${adminToken}` },
                                    });
                                    if (res.ok) {
                                      const details = await res.json();
                                      setEditingProduct(details);
                                    } else {
                                      setEditingProduct(product);
                                    }
                                  } catch (e) {
                                    safeError("Error loading product details:", e);
                                    setEditingProduct(product);
                                  }
                                } else {
                                  setEditingProduct(product);
                                }
                                setShowForm(true);
                              }}
                              className="text-[#6F2A2B] hover:text-[#5a2223]"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(product.id);
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            </td>
                          </tr>
                          {isExpanded && variantCount > 0 && (
                            <tr>
                            <td colSpan="7" className="px-3 py-4 sm:px-6 bg-gray-50">
                              <div className="space-y-4">
                                <h3 className="mb-3 font-semibold text-gray-900">
                                  Варианты товара ({variantCount})
                                </h3>
                              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {variants.map((variant) => (
                                  <div 
                                    key={variant.id}
                                    className="p-4 transition-shadow bg-white border border-gray-200 rounded-lg hover:shadow-md"
                                  >
                                      <div className="flex items-start gap-3">
                                        {variant.imageUrl && (
                                          <img 
                                            src={variant.imageUrl} 
                                            alt={variant.displayName}
                                            className="flex-shrink-0 object-cover w-16 h-16 rounded"
                                            onError={(e) => {
                                              e.currentTarget.src = '/korm1.svg';
                                            }}
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="mb-2 text-sm font-medium text-gray-900 truncate">
                                            {variant.displayName}
                                          </p>
                                          <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                              <span>ID варианта:</span>
                                              <span className="font-medium">{variant.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Цена:</span>
                                              <span className="font-medium text-[#6F2A2B]">
                                                {variant.price ? `${variant.price.toFixed(2)} ₽` : "-"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Вес:</span>
                                              <span className="font-medium">
                                                {formatWeight(variant.weight)}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Наличие:</span>
                                              <span className={`font-medium ${
                                                (variant.stock || 0) > 0 
                                                  ? "text-green-600" 
                                                  : "text-red-600"
                                              }`}>
                                                {variant.stock || 0} шт.
                                              </span>
                                            </div>
                                          </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
              </div>

              {/* Мобильные карточки */}
              <div className="md:hidden">
                {filteredProducts.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    {searchQuery.trim() ? "Товары не найдены" : "Нет товаров"}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {displayedProducts.map((product) => {
                      const variants = product.variants || [];
                      const variantCount = variants.length;
                      const prices = variants.map(v => v.price || 0).filter(p => p > 0);
                      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
                      const priceRange = minPrice === maxPrice 
                        ? `${minPrice.toFixed(2)} ₽` 
                        : `${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)} ₽`;
                      const weights = [...new Set(variants.map(v => v.weight || 0).filter(w => w > 0))];
                      const weightDisplay = weights.length > 0 
                        ? weights.length === 1 
                          ? formatWeight(weights[0])
                          : weights.map(w => formatWeight(w)).join(', ')
                        : "-";
                      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                      const firstImage = variants.find(v => v.imageUrl)?.imageUrl;
                      const isExpanded = expandedProductId === product.id;

                      return (
                        <React.Fragment key={product.id}>
                          <div 
                            onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                            className="p-4 transition-colors cursor-pointer hover:bg-gray-50"
                          >
                            <div className="flex items-start gap-3">
                              {firstImage && (
                                <img 
                                  src={firstImage} 
                                  alt={product.name || product.productName}
                                  className="flex-shrink-0 object-cover w-16 h-16 rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {product.name || product.productName}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">ID: {product.id}</p>
                                  </div>
                                  <div className="flex items-center flex-shrink-0 gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        if (product.id) {
                                          try {
                                            const adminToken = getAdminToken();
                                            const res = await fetch(`/api/products/${product.id}/details`, {
                                              headers: { Authorization: `Bearer ${adminToken}` },
                                            });
                                            if (res.ok) {
                                              const details = await res.json();
                                              setEditingProduct(details);
                                            } else {
                                              setEditingProduct(product);
                                            }
                                          } catch (e) {
                                            safeError("Error loading product details:", e);
                                            setEditingProduct(product);
                                          }
                                        } else {
                                          setEditingProduct(product);
                                        }
                                        setShowForm(true);
                                      }}
                                      className="text-[#6F2A2B] hover:text-[#5a2223] p-1"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(product.id);
                                      }}
                                      className="p-1 text-red-600 hover:text-red-800"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                                <div className="space-y-1.5">
                                  {variantCount > 0 && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Варианты:</span>
                                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                                        {variantCount} {variantCount === 1 ? 'вариант' : variantCount < 5 ? 'варианта' : 'вариантов'}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Цена:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                      {priceRange !== "0.00 ₽" ? priceRange : "-"}
                                    </span>
                                  </div>
                                  {weightDisplay !== "-" && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Вес:</span>
                                      <span className="text-sm text-gray-700">{weightDisplay}</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500">Наличие:</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                      totalStock > 0 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                      {totalStock} шт.
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {isExpanded && variantCount > 0 && (
                            <div className="px-4 pb-4 bg-gray-50">
                              <div className="pt-2 space-y-3">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  Варианты товара ({variantCount})
                                </h3>
                                <div className="space-y-3">
                                  {variants.map((variant) => (
                                    <div 
                                      key={variant.id}
                                      className="p-3 bg-white border border-gray-200 rounded-lg"
                                    >
                                      <div className="flex items-start gap-3">
                                        {variant.imageUrl && (
                                          <img 
                                            src={variant.imageUrl} 
                                            alt={variant.displayName}
                                            className="flex-shrink-0 object-cover w-12 h-12 rounded"
                                            onError={(e) => {
                                              e.currentTarget.src = '/korm1.svg';
                                            }}
                                          />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 mb-1.5 truncate">
                                            {variant.displayName}
                                          </p>
                                          <div className="space-y-1 text-xs text-gray-600">
                                            <div className="flex justify-between">
                                              <span>ID:</span>
                                              <span className="font-medium">{variant.id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Цена:</span>
                                              <span className="font-medium text-[#6F2A2B]">
                                                {variant.price ? `${variant.price.toFixed(2)} ₽` : "-"}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Вес:</span>
                                              <span className="font-medium">
                                                {formatWeight(variant.weight)}
                                              </span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span>Наличие:</span>
                                              <span className={`font-medium ${
                                                (variant.stock || 0) > 0 
                                                  ? "text-green-600" 
                                                  : "text-red-600"
                                              }`}>
                                                {variant.stock || 0} шт.
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Пагинация */}
              {filteredProducts.length > pageSize && (
                <div className="flex items-center justify-between px-4 py-3 mt-6 bg-white border-t border-gray-200 sm:px-6">
                  <div className="flex justify-between flex-1 sm:hidden">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Назад
                    </Button>
                    <div className="text-sm text-gray-700">
                      Страница {currentPage} из {totalPages}
                    </div>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      Вперед
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Показано <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span> из <span className="font-medium">{filteredProducts.length}</span> товаров
                        {searchQuery.trim() && (
                          <span className="ml-2 text-gray-500">
                            (из {products.length} всего)
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Предыдущая
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              className={currentPage === pageNum ? "bg-[#6F2A2B] text-white hover:bg-[#5a2223]" : ""}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        variant="outline"
                        size="sm"
                      >
                        Следующая
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <ToastMotion show={toast.show} type={toast.type}>
        {toast.message}
      </ToastMotion>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  brands,
  breeds,
  countries,
  typeoffood,
  flavors,
  colors,
  scents,
  productTypes,
  showToast,
  onClose,
  onSave,
}) {
  // Преобразуем данные продукта в формат формы (поддержка обоих форматов: cards и details)
  const getInitialFormData = () => {
    if (!product) {
      return {
        name: "",
        description: "",
        feedingNote: "",
        guaranteedIndicators: "",
        slug: "",
        breedIds: [],
        categoryIds: [],
        countryIds: [],
        typeoffoodIds: [],
        flavorIds: [],
        brandId: "",
        productTypeId: "",
        variants: [],
        quantityInStock: 0,
        isActive: true,
        isFeatured: false,
        rating: 0,
      };
    }

    // Обрабатываем разные форматы данных (cards vs details)
    return {
      name: product.name || product.productName || "",
      description: product.description || "",
      feedingNote: product.feedingNote || "",
      guaranteedIndicators: product.guaranteedIndicators || "",
      slug: product.slug || "",
      breedIds: product.breedsDTOs
        ? product.breedsDTOs.map((b) => b.id)
        : product.breedIds || [],
      categoryIds: product.categoryDTOs
        ? product.categoryDTOs.map((c) => c.id)
        : product.categoryIds || [],
      countryIds: product.countryDTOs
        ? product.countryDTOs.map((c) => c.id)
        : product.countryIds || [],
      typeoffoodIds: product.typeOfFoodDTOs
        ? product.typeOfFoodDTOs.map((t) => t.id)
        : product.typeoffoodIds || [],
      flavorIds: product.flavorIds
        ? product.flavorIds.map((f) => (typeof f === "object" ? f.id : f))
        : [],
      brandId: product.brandId ? String(product.brandId) : "",
      productTypeId: product.productTypeId ? String(product.productTypeId) : "",
          variants: (product.variants || []).map(v => ({
            ...v,
            weight: v.weight || 0,
          })),
      quantityInStock: product.quantityInStock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      rating: product.rating || 0,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [imageFiles, setImageFiles] = useState([]); // Для хранения выбранных изображений при создании

  const [saving, setSaving] = useState(false);

  // --- Зависимые фильтры от выбранной категории ---
  const selectedCategoryIds = Array.isArray(formData.categoryIds)
    ? formData.categoryIds.map((id) => Number(id))
    : [];

  const allowedBreeds =
    selectedCategoryIds.length > 0
      ? (Array.isArray(breeds) ? breeds : []).filter((b) => {
          const breedCategoryId = b?.categoryId != null ? Number(b.categoryId) : null;
          return breedCategoryId != null && selectedCategoryIds.includes(breedCategoryId);
        })
      : breeds;

  // Если категории выбраны — автоматически убираем из выбранных "фильтров" те, которые не относятся к этим категориям
  useEffect(() => {
    if (selectedCategoryIds.length === 0) return;

    const allowedBreedIds = new Set(
      (Array.isArray(allowedBreeds) ? allowedBreeds : [])
        .map((b) => b?.id)
        .filter((id) => id != null)
        .map((id) => Number(id))
    );

    const currentBreedIds = Array.isArray(formData.breedIds) ? formData.breedIds : [];
    const nextBreedIds = currentBreedIds.filter((id) => allowedBreedIds.has(Number(id)));

    if (nextBreedIds.length !== currentBreedIds.length) {
      setFormData((prev) => ({ ...prev, breedIds: nextBreedIds }));
    }
  }, [selectedCategoryIds.join(","), (Array.isArray(allowedBreeds) ? allowedBreeds.length : 0)]);

  // Сброс imageFiles при открытии формы создания
  useEffect(() => {
    if (!product) {
      setImageFiles([]);
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      showToast("Заполните название и slug", "error");
      return;
    }

    try {
      setSaving(true);
      const adminToken = getAdminToken();

      // Функция для преобразования ID в объект с полными данными
      const getColorObject = (colorId) => {
        if (!colorId) return null;
        
        // Если уже объект с нужной структурой
        if (typeof colorId === "object" && colorId.id !== undefined) {
          return {
            id: colorId.id || 0,
            name: colorId.name || "",
            slug: colorId.slug || "",
          };
        }
        
        // Ищем в списке colors
        const colorIdNum = typeof colorId === "number" ? colorId : Number(colorId);
        const color = colors.find(c => {
          const cId = typeof c === "object" ? c.id : c;
          return cId === colorIdNum || cId === colorId;
        });
        
        if (color && typeof color === "object") {
          return {
            id: color.id || 0,
            name: color.name || "",
            slug: color.slug || "",
          };
        }
        return null;
      };

      const getScentObject = (scentId) => {
        if (!scentId) return null;
        
        // Если уже объект с нужной структурой
        if (typeof scentId === "object" && scentId.id !== undefined) {
          return {
            id: scentId.id || 0,
            name: scentId.name || "",
            slug: scentId.slug || "",
          };
        }
        
        // Ищем в списке scents
        const scentIdNum = typeof scentId === "number" ? scentId : Number(scentId);
        const scent = scents.find(s => {
          const sId = typeof s === "object" ? s.id : s;
          return sId === scentIdNum || sId === scentId;
        });
        
        if (scent && typeof scent === "object") {
          return {
            id: scent.id || 0,
            name: scent.name || "",
            slug: scent.slug || "",
          };
        }
        return null;
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      let res;

      if (method === "POST") {
        // Для POST используем multipart/form-data
        const formDataToSend = new FormData();

        // Создаем productDTO без полей, которых нет в POST запросе
        const productDTO = {
          name: formData.name || "",
          description: formData.description || "",
          guaranteedIndicators: formData.guaranteedIndicators || "",
          feedingNote: formData.feedingNote || "",
          slug: formData.slug || "",
          breedIds: Array.isArray(formData.breedIds)
            ? formData.breedIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          categoryIds: Array.isArray(formData.categoryIds)
            ? formData.categoryIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          countryIds: Array.isArray(formData.countryIds)
            ? formData.countryIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          typeoffoodIds: Array.isArray(formData.typeoffoodIds)
            ? formData.typeoffoodIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          flavorIds: Array.isArray(formData.flavorIds)
            ? formData.flavorIds.map(id => {
                return typeof id === "object" && id.id !== undefined ? Number(id.id) : Number(id);
              }).filter(id => id > 0)
            : [],
          variants: formData.variants.map((v) => {
            // Для POST в variants не нужны colorIds и scentIds как объекты, только ID
            return {
              sku: v.sku || "",
          price: Number(v.price) || 0,
          stock: Number(v.stock) || 0,
          weight: Number(v.weight) || 0,
          colorIds: Array.isArray(v.colorIds) 
                ? v.colorIds.map((c) => {
                    if (typeof c === "object" && c.id !== undefined) {
                      return Number(c.id);
                    } else {
                      const colorObj = getColorObject(c);
                      return colorObj ? Number(colorObj.id) : 0;
                    }
                  }).filter(id => id > 0)
            : [],
          scentIds: Array.isArray(v.scentIds)
                ? v.scentIds.map((s) => {
                    if (typeof s === "object" && s.id !== undefined) {
                      return Number(s.id);
                    } else {
                      const scentObj = getScentObject(s);
                      return scentObj ? Number(scentObj.id) : 0;
                    }
                  }).filter(id => id > 0)
            : [],
            };
          }),
          brandId: formData.brandId ? Number(formData.brandId) : 0,
          productTypeId: formData.productTypeId ? Number(formData.productTypeId) : 0,
      };

        // Добавляем productDTO как JSON строку с Content-Type: application/json
        const productDTOBlob = new Blob([JSON.stringify(productDTO)], { type: "application/json" });
        formDataToSend.append("productDTO", productDTOBlob, "productDTO.json");

        // Добавляем изображения
        imageFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });


        res = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${adminToken}`,
            // Не устанавливаем Content-Type вручную, браузер установит его автоматически с boundary
          },
          body: formDataToSend,
        });
      } else {
        // Для PUT используем JSON (как было)
        const payload = {
          name: formData.name || "",
          description: formData.description || "",
          guaranteedIndicators: formData.guaranteedIndicators || "",
          feedingNote: formData.feedingNote || "",
          slug: formData.slug || "",
          quantityInStock: Number(formData.quantityInStock) || 0,
          isActive: formData.isActive !== undefined ? formData.isActive : true,
          isFeatured: formData.isFeatured !== undefined ? formData.isFeatured : false,
          rating: (formData.rating !== undefined && formData.rating !== null && formData.rating !== "" && !isNaN(Number(formData.rating)) && Number(formData.rating) !== 0) ? Number(formData.rating) : null,
          breedIds: Array.isArray(formData.breedIds)
            ? formData.breedIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          categoryIds: Array.isArray(formData.categoryIds)
            ? formData.categoryIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          countryIds: Array.isArray(formData.countryIds)
            ? formData.countryIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          typeoffoodIds: Array.isArray(formData.typeoffoodIds)
            ? formData.typeoffoodIds.map(id => Number(id)).filter(id => id > 0)
            : [],
          flavorIds: Array.isArray(formData.flavorIds)
            ? formData.flavorIds.map(id => {
                return typeof id === "object" && id.id !== undefined ? Number(id.id) : Number(id);
              }).filter(id => id > 0)
            : [],
          variants: formData.variants.map((v) => {
            const colorObjects = Array.isArray(v.colorIds) 
              ? v.colorIds
                  .map((c) => {
                    if (typeof c === "object" && c.id !== undefined) {
                      return {
                        id: c.id || 0,
                        name: c.name || "",
                        slug: c.slug || "",
                      };
                    } else {
                      return getColorObject(c);
                    }
                  })
                  .filter(Boolean)
              : [];

            const scentObjects = Array.isArray(v.scentIds)
              ? v.scentIds
                  .map((s) => {
                    if (typeof s === "object" && s.id !== undefined) {
                      return {
                        id: s.id || 0,
                        name: s.name || "",
                        slug: s.slug || "",
                      };
                    } else {
                      return getScentObject(s);
                    }
                  })
                  .filter(Boolean)
              : [];

            return {
              id: v.id || 0,
              productId: v.productId || (product ? product.id : 0),
              sku: v.sku || "",
              price: Number(v.price) || 0,
              oldPrice: (v.oldPrice !== undefined && v.oldPrice !== null && v.oldPrice !== "" && !isNaN(Number(v.oldPrice)) && Number(v.oldPrice) !== 0) ? Number(v.oldPrice) : null,
              stock: Number(v.stock) || 0,
              weight: Number(v.weight) || 0,
              colorIds: colorObjects,
              scentIds: scentObjects,
              displayName: v.displayName || "",
            };
          }),
          brandId: formData.brandId ? Number(formData.brandId) : 0,
          productTypeId: formData.productTypeId ? Number(formData.productTypeId) : 0,
        };


        res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });
      }

      if (res.ok) {
        const savedProduct = await res.json();
        showToast(product ? "Товар успешно обновлен" : "Товар успешно создан");
        onSave();
        // Если это создание, можно сразу открыть загрузку изображений
        if (!product && savedProduct.id) {
          // Можно добавить логику для автоматического открытия загрузки изображений
        }
      } else {
        safeError("Error saving product:", res.status);
        safeError("Payload that was sent:", payload);
        const errorMessage = await handleApiError(res, "сохранение", "товар");
        showToast(`Ошибка при сохранении: ${errorMessage}`, "error");
      }
    } catch (e) {
      safeError("Error saving product:", e);
      const errorMessage = await handleApiError(e, "сохранение", "товар");
      showToast(`Ошибка при сохранении: ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: "",
          price: "",
          stock: "",
          weight: "",
          colorIds: [],
          scentIds: [],
        },
      ],
    });
  };

  const removeVariant = (index) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const toggleMultiSelect = (field, value) => {
    const current = formData[field] || [];
    const index = current.indexOf(value);
    if (index > -1) {
      setFormData({ ...formData, [field]: current.filter((v) => v !== value) });
    } else {
      setFormData({ ...formData, [field]: [...current, value] });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 max-h-[90vh] overflow-y-auto">
      <h2 className="mb-4 text-lg font-semibold sm:text-xl">
        {product ? "Редактировать товар" : "Добавить товар"}
      </h2>
      
      {/* Инструкции по заполнению */}
      <div className="p-4 mb-6 border-l-4 border-blue-500 rounded-r bg-blue-50">
        <h3 className="flex items-center gap-2 mb-2 text-sm font-semibold text-blue-900">
          <span>📋</span> Инструкция по заполнению данных для базы данных
        </h3>
        <div className="space-y-2 text-xs text-blue-800 sm:text-sm">
          <p><strong>Важно:</strong> Все данные сохраняются в базу данных. Заполняйте поля внимательно!</p>
          <ul className="ml-2 space-y-1 list-disc list-inside">
            <li><strong>Название *</strong> - Полное название товара на русском языке. Максимум: <strong>100 символов</strong>. Пример: "Корм для собак премиум класса"</li>
            <li><strong>Slug *</strong> - Уникальный идентификатор для URL (только латиница, цифры и дефисы). Максимум: <strong>100 символов</strong>. Автоматически формируется из названия. Пример: "korm-dlya-sobak-premium"</li>
            <li><strong>Описание</strong> - Подробное описание товара. Максимум: <strong>2000 символов</strong>.</li>
            <li><strong>Примечание по кормлению</strong> - Инструкции по кормлению, дозировке. Максимум: <strong>1000 символов</strong>.</li>
            <li><strong>Гарантированные показатели</strong> - Гарантированный анализ состава. Максимум: <strong>1000 символов</strong>.</li>
            <li><strong>Бренд</strong> - Выберите бренд из списка. Если бренда нет, сначала создайте его в разделе "Фильтры".</li>
            <li><strong>Тип продукта</strong> - Категория продукта (корм, аксессуар и т.д.). Выберите из списка.</li>
            <li><strong>Категории/Фильтры/Страны/Тип корма/Вкусы</strong> - Можно выбрать несколько значений. Эти данные используются для фильтрации на сайте.</li>
            <li><strong>Варианты товара</strong> - Обязательно добавьте хотя бы один вариант! Вариант = конкретная упаковка товара (размер, вес, цвет и т.д.)</li>
            <li><strong>Изображения</strong> - Загружайте только при создании нового товара. Форматы: JPEG/JPG/PNG. Рекомендуемый размер: не менее 800x800px.</li>
          </ul>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Название *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: Корм для собак премиум класса"
              maxLength={100}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Полное название товара, которое будет отображаться на сайте
              <span className="ml-2 text-gray-400">({(formData.name || "").length}/100 символов)</span>
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Slug * (URL-адрес)
            </label>
            <Input
              value={formData.slug}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              placeholder="korm-dlya-sobak-premium"
              maxLength={100}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Уникальный идентификатор для URL. Только латиница, цифры и дефисы. Используется в адресе страницы товара.
              <span className="ml-2 text-gray-400">({(formData.slug || "").length}/100 символов)</span>
            </p>
          </div>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
            rows="3"
            maxLength={2000}
            placeholder="Подробное описание товара, его характеристики, состав, преимущества..."
          />
          <p className="mt-1 text-xs text-gray-500">
            Подробное описание товара. Будет отображаться на странице товара. Можно использовать HTML для форматирования.
            <span className={`ml-2 ${(formData.description || "").length > 1900 ? "text-red-600 font-semibold" : "text-gray-400"}`}>
              ({(formData.description || "").length}/2000 символов)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Примечание по кормлению
            </label>
            <textarea
              value={formData.feedingNote}
              onChange={(e) =>
                setFormData({ ...formData, feedingNote: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
              rows="2"
              maxLength={1000}
              placeholder="Например: Рекомендуемая суточная норма для взрослой собаки 20-30 кг: 300-400 г"
            />
            <p className="mt-1 text-xs text-gray-500">
              Инструкции по кормлению, дозировке, рекомендации по применению
              <span className={`ml-2 ${(formData.feedingNote || "").length > 900 ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                ({(formData.feedingNote || "").length}/1000 символов)
              </span>
            </p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Гарантированные показатели
            </label>
            <textarea
              value={formData.guaranteedIndicators}
              onChange={(e) =>
                setFormData({ ...formData, guaranteedIndicators: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
              rows="2"
              maxLength={1000}
              placeholder="Например: Белок: 28%, Жир: 15%, Клетчатка: 4%, Влажность: 10%"
            />
            <p className="mt-1 text-xs text-gray-500">
              Гарантированный анализ состава (белки, жиры, углеводы, клетчатка и т.д.)
              <span className={`ml-2 ${(formData.guaranteedIndicators || "").length > 900 ? "text-red-600 font-semibold" : "text-gray-400"}`}>
                ({(formData.guaranteedIndicators || "").length}/1000 символов)
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Бренд
            </label>
            <Select
              value={formData.brandId}
              onValueChange={(value) =>
                setFormData({ ...formData, brandId: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите бренд" />
              </SelectTrigger>
              <SelectContent>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={String(brand.id)}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">Выберите производителя товара. Если бренда нет в списке, создайте его в разделе "Фильтры" → "Бренды"</p>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Тип продукта
            </label>
            <Select
              value={formData.productTypeId}
              onValueChange={(value) =>
                setFormData({ ...formData, productTypeId: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите тип" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-gray-500">Категория продукта (корм, аксессуар, игрушка и т.д.). Если типа нет, создайте его в разделе "Фильтры"</p>
          </div>
        </div>

        {/* Множественный выбор */}
        <div className="p-3 mb-4 border border-yellow-200 rounded bg-yellow-50">
          <p className="mb-2 text-xs text-yellow-800"><strong>💡 Важно:</strong> Выберите все подходящие значения. Эти данные используются для фильтрации товаров на сайте!</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <MultiSelectField
              label="Категории"
              options={categories}
              selected={formData.categoryIds}
              onChange={(value) => toggleMultiSelect("categoryIds", value)}
            />
            <p className="mt-1 text-xs text-gray-500">Выберите категории товара (можно несколько). Пример: "Корм для собак", "Сухой корм"</p>
          </div>
          <div>
            <MultiSelectField
              label="Фильтры"
              options={allowedBreeds}
              selected={formData.breedIds}
              onChange={(value) => toggleMultiSelect("breedIds", value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Выбор фильтров (бывш. "породы") зависит от выбранных категорий. Сначала выберите категорию (например, "Кошки"), затем отметьте подходящие фильтры.
            </p>
          </div>
          <div>
            <MultiSelectField
              label="Страны"
              options={countries}
              selected={formData.countryIds}
              onChange={(value) => toggleMultiSelect("countryIds", value)}
            />
            <p className="mt-1 text-xs text-gray-500">Страна производства товара</p>
          </div>
          <div>
            <MultiSelectField
              label="Тип корма"
              options={typeoffood}
              selected={formData.typeoffoodIds}
              onChange={(value) => toggleMultiSelect("typeoffoodIds", value)}
            />
            <p className="mt-1 text-xs text-gray-500">Тип корма: сухой, влажный, консервы и т.д.</p>
          </div>
          <div>
            <MultiSelectField
              label="Вкусы"
              options={flavors}
              selected={formData.flavorIds}
              onChange={(value) => toggleMultiSelect("flavorIds", value)}
            />
            <p className="mt-1 text-xs text-gray-500">Вкусовые варианты товара (курица, говядина, рыба и т.д.)</p>
          </div>
        </div>

        {/* Варианты */}
        <div>
          <div className="p-3 mb-3 border border-red-200 rounded bg-red-50">
            <p className="text-xs text-red-800"><strong>⚠️ ОБЯЗАТЕЛЬНО:</strong> Товар должен иметь хотя бы один вариант! Вариант = конкретная упаковка товара (размер, вес, цвет).</p>
          </div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Варианты товара
            </label>
            <Button type="button" onClick={addVariant} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Добавить вариант
            </Button>
          </div>
          <p className="mb-3 text-xs text-gray-500">Вариант - это конкретная упаковка товара с определенным весом, ценой и наличием. Например: "Корм для собак, 2 кг, 1500 руб" - это один вариант. "Корм для собак, 5 кг, 3000 руб" - другой вариант.</p>
          {formData.variants.map((variant, index) => (
            <VariantForm
              key={index}
              variant={variant}
              index={index}
              colors={colors}
              scents={scents}
              onChange={updateVariant}
              onRemove={removeVariant}
              isEdit={!!product}
            />
          ))}
        </div>

        {/* Дополнительные поля для редактирования */}
        {product && (
          <div>
            {/* Скрытые поля: quantityInStock, rating, isActive, isFeatured - остаются в данных для API, но не отображаются визуально */}
          </div>
        )}

        {/* Поле для выбора изображений (только при создании) */}
        {!product && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Изображения товара
            </label>
            <div className="p-3 mb-2 border border-green-200 rounded bg-green-50">
              <p className="text-xs text-green-800"><strong>📸 Требования к изображениям:</strong></p>
              <ul className="mt-1 space-y-1 text-xs text-green-700 list-disc list-inside">
                <li>Форматы: JPEG/JPG/PNG</li>
                <li>Рекомендуемый размер: минимум 800x800 пикселей</li>
                <li>Количество изображений = количество вариантов товара. Фотографии должны быть по такому же порядку как и вариант.</li>
              </ul>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setImageFiles(selectedFiles);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
            />
            {imageFiles.length > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Выбрано файлов: {imageFiles.length}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">Изображения загружаются только при создании нового товара.</p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
          <Button
            type="submit"
            className="bg-[#6F2A2B] text-white hover:bg-[#5a2223] w-full sm:w-auto"
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}

function MultiSelectField({ label, options, selected, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="border border-gray-300 rounded-md p-2 sm:p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
        {options.length === 0 ? (
          <p className="text-sm text-gray-500">Нет доступных опций</p>
        ) : (
          options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 p-1 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selected.includes(option.id)}
                onChange={() => onChange(option.id)}
                className="w-4 h-4 text-[#6F2A2B] border-gray-300 rounded focus:ring-[#6F2A2B]"
              />
              <span className="text-sm">{option.name}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
}

function VariantForm({ variant, index, colors, scents, onChange, onRemove, isEdit }) {
  return (
    <div className="p-3 mb-4 border border-gray-300 rounded-lg sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium sm:text-base">Вариант {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1 text-red-600 hover:text-red-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            SKU (Артикул)
          </label>
          <Input
            value={variant.sku || ""}
            onChange={(e) => onChange(index, "sku", e.target.value)}
            placeholder="Например: COR-001-2KG"
          />
          <p className="mt-1 text-xs text-gray-500">Уникальный артикул товара. Используется для учета на складе. Формат: буквы и цифры</p>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Цена (₽)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={variant.price === "" || variant.price === undefined || variant.price === null ? "" : variant.price}
            onChange={(e) => {
              const value = e.target.value;
              onChange(index, "price", value === "" ? "" : Number(value));
            }}
            placeholder="1500.00"
          />
          <p className="mt-1 text-xs text-gray-500">Цена в рублях. Можно указать копейки (например: 1499.99).</p>
        </div>
        {/* Скрытое поле: oldPrice - остается в данных для API, но не отображается визуально */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Остаток (шт.)
          </label>
          <Input
            type="number"
            min="0"
            value={variant.stock === "" || variant.stock === undefined || variant.stock === null ? "" : variant.stock}
            onChange={(e) => {
              const value = e.target.value;
              onChange(index, "stock", value === "" ? "" : Number(value));
            }}
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">Количество товара на складе. Только целые числа (0, 1, 2, 10, 100...).</p>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Вес (кг)
          </label>
          <Input
            type="number"
            min="0"
            step="0.001"
            value={variant.weight === "" || variant.weight === undefined || variant.weight === null ? "" : variant.weight}
            onChange={(e) => {
              const value = e.target.value;
              onChange(index, "weight", value === "" ? "" : Number(value));
            }}
            placeholder="2.0"
          />
          <p className="mt-1 text-xs text-gray-500">Вес упаковки в килограммах. Пример: 2 (для 2 кг), 0.5 (для 500 г), 1.5 (для 1.5 кг). Можно использовать десятичные дроби.</p>
        </div>
        {isEdit && (
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Отображаемое название
            </label>
            <Input
              value={variant.displayName || ""}
              onChange={(e) => onChange(index, "displayName", e.target.value)}
              placeholder="Например: Корм для собак, 2 кг"
            />
            <p className="mt-1 text-xs text-gray-500">Название варианта, которое будет показано покупателю. Если не указано, будет сгенерировано автоматически.</p>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 mt-4 sm:grid-cols-2">
        <div>
          <MultiSelectField
            label="Цвета"
            options={colors}
            selected={Array.isArray(variant.colorIds) ? variant.colorIds.map((c) => (typeof c === "object" ? c.id : c)) : []}
            onChange={(value) => {
              const current = variant.colorIds || [];
              const newIds = current.includes(value)
                ? current.filter((c) => (typeof c === "object" ? c.id : c) !== value)
                : [...current, value];
              onChange(index, "colorIds", newIds);
            }}
          />
          <p className="mt-1 text-xs text-gray-500">Цвет упаковки или товара (если применимо). Можно выбрать несколько цветов.</p>
        </div>
        <div>
          <MultiSelectField
            label="Запахи"
            options={scents}
            selected={Array.isArray(variant.scentIds) ? variant.scentIds.map((s) => (typeof s === "object" ? s.id : s)) : []}
            onChange={(value) => {
              const current = variant.scentIds || [];
              const newIds = current.includes(value)
                ? current.filter((s) => (typeof s === "object" ? s.id : s) !== value)
                : [...current, value];
              onChange(index, "scentIds", newIds);
            }}
          />
          <p className="mt-1 text-xs text-gray-500">Аромат товара (если применимо). Можно выбрать несколько запахов.</p>
        </div>
      </div>
    </div>
  );
}

