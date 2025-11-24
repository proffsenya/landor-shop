import { useState, useEffect } from "react";
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
import { Plus, Edit, Trash2, X, Upload } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [loadMethod, setLoadMethod] = useState("cards"); // "cards" или "details"

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
  }, [navigate, loadMethod]);

  const loadAllData = async () => {
    try {
      const adminToken = getAdminToken();
      
      // Загружаем товары в зависимости от выбранного метода
      let productsRes;
      if (loadMethod === "cards") {
        productsRes = await fetch("/api/products/cards", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      } else {
        // Если нужен метод details, загружаем список через cards, а потом детали для каждого
        productsRes = await fetch("/api/products/cards", {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
      
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
        fetch("/api/admin/categories", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/brands", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/breeds", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/countries", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/typeoffood", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/flavors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/colors", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/scents", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/admin/producttypes", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        const productsList = Array.isArray(data) ? data : [];
        
        // Если выбран метод "details", загружаем детали для каждого товара
        if (loadMethod === "details" && productsList.length > 0) {
          const detailsPromises = productsList.map((product) =>
            fetch(`/api/products/${product.id}/details`, {
              headers: { Authorization: `Bearer ${adminToken}` },
            })
              .then((res) => (res.ok ? res.json() : product))
              .catch(() => product)
          );
          const detailsData = await Promise.all(detailsPromises);
          setProducts(detailsData);
        } else {
          setProducts(productsList);
        }
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
      console.error("Error loading data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm("Удалить товар?")) return;

    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        loadAllData();
      } else {
        alert("Ошибка при удалении");
      }
    } catch (e) {
      console.error("Error deleting product:", e);
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
      <AdminHeader isSuperUser={isSuperUser} />
      <div className="flex">
        <AdminSidebar isSuperUser={isSuperUser} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Товары</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Метод загрузки:</label>
                  <Select value={loadMethod} onValueChange={setLoadMethod}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cards">Cards</SelectItem>
                      <SelectItem value="details">Details</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowForm(true);
                  }}
                  className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить товар
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

            {showImageUpload && (
              <ImageUploadForm
                productId={selectedProductId}
                onClose={() => {
                  setShowImageUpload(false);
                  setSelectedProductId(null);
                }}
                onSave={() => {
                  setShowImageUpload(false);
                  setSelectedProductId(null);
                  loadAllData();
                }}
              />
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        Нет товаров
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{product.name || product.productName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{product.slug || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedProductId(product.id);
                                setShowImageUpload(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Загрузить изображения"
                            >
                              <Upload className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                // Если товар загружен через cards, загружаем детали для редактирования
                                if (loadMethod === "cards" && product.id) {
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
                                    console.error("Error loading product details:", e);
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
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-800"
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
        </main>
      </div>
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
      variants: product.variants || [],
      quantityInStock: product.quantityInStock || 0,
      isActive: product.isActive !== undefined ? product.isActive : true,
      isFeatured: product.isFeatured !== undefined ? product.isFeatured : false,
      rating: product.rating || 0,
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      alert("Заполните название и slug");
      return;
    }

    try {
      setSaving(true);
      const adminToken = getAdminToken();

      const payload = {
        ...formData,
        brandId: formData.brandId ? Number(formData.brandId) : 0,
        productTypeId: formData.productTypeId ? Number(formData.productTypeId) : 0,
        breedIds: formData.breedIds.map(Number),
        categoryIds: formData.categoryIds.map(Number),
        countryIds: formData.countryIds.map(Number),
        typeoffoodIds: formData.typeoffoodIds.map(Number),
        flavorIds: formData.flavorIds.map(Number),
        variants: formData.variants.map((v) => ({
          ...v,
          id: v.id || 0,
          productId: v.productId || 0,
          price: Number(v.price) || 0,
          oldPrice: Number(v.oldPrice) || 0,
          stock: Number(v.stock) || 0,
          weight: Number(v.weight) || 0,
          colorIds: Array.isArray(v.colorIds) 
            ? v.colorIds.map((c) => (typeof c === "object" ? c.id : Number(c)))
            : [],
          scentIds: Array.isArray(v.scentIds)
            ? v.scentIds.map((s) => (typeof s === "object" ? s.id : Number(s)))
            : [],
        })),
      };

      const url = product ? `/api/products/${product.id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        onSave();
        // Если это создание, можно сразу открыть загрузку изображений
        if (!product && savedProduct.id) {
          // Можно добавить логику для автоматического открытия загрузки изображений
        }
      } else {
        const errorText = await res.text();
        console.error("Error saving product:", res.status, errorText);
        alert("Ошибка при сохранении");
      }
    } catch (e) {
      console.error("Error saving product:", e);
      alert("Ошибка при сохранении");
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
          price: 0,
          stock: 0,
          weight: 0,
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
    <div className="bg-white rounded-lg shadow p-6 mb-6 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">
        {product ? "Редактировать товар" : "Добавить товар"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              onChange={(e) =>
                setFormData({
                  ...formData,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Описание
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Примечание по кормлению
            </label>
            <textarea
              value={formData.feedingNote}
              onChange={(e) =>
                setFormData({ ...formData, feedingNote: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
              rows="2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Гарантированные показатели
            </label>
            <textarea
              value={formData.guaranteedIndicators}
              onChange={(e) =>
                setFormData({ ...formData, guaranteedIndicators: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
              rows="2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
          </div>
        </div>

        {/* Множественный выбор */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MultiSelectField
            label="Категории"
            options={categories}
            selected={formData.categoryIds}
            onChange={(value) => toggleMultiSelect("categoryIds", value)}
          />
          <MultiSelectField
            label="Породы"
            options={breeds}
            selected={formData.breedIds}
            onChange={(value) => toggleMultiSelect("breedIds", value)}
          />
          <MultiSelectField
            label="Страны"
            options={countries}
            selected={formData.countryIds}
            onChange={(value) => toggleMultiSelect("countryIds", value)}
          />
          <MultiSelectField
            label="Тип корма"
            options={typeoffood}
            selected={formData.typeoffoodIds}
            onChange={(value) => toggleMultiSelect("typeoffoodIds", value)}
          />
          <MultiSelectField
            label="Вкусы"
            options={flavors}
            selected={formData.flavorIds}
            onChange={(value) => toggleMultiSelect("flavorIds", value)}
          />
        </div>

        {/* Варианты */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Варианты товара
            </label>
            <Button type="button" onClick={addVariant} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Добавить вариант
            </Button>
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество на складе
              </label>
              <Input
                type="number"
                value={formData.quantityInStock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityInStock: Number(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Рейтинг
              </label>
              <Input
                type="number"
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-[#6F2A2B] border-gray-300 rounded focus:ring-[#6F2A2B]"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Активен
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={formData.isFeatured}
                onChange={(e) =>
                  setFormData({ ...formData, isFeatured: e.target.checked })
                }
                className="w-4 h-4 text-[#6F2A2B] border-gray-300 rounded focus:ring-[#6F2A2B]"
              />
              <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                Рекомендуемый
              </label>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            disabled={saving}
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline">
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
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="border border-gray-300 rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
        {options.length === 0 ? (
          <p className="text-sm text-gray-500">Нет доступных опций</p>
        ) : (
          options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-2 p-1 hover:bg-gray-50 cursor-pointer"
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
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium">Вариант {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SKU
          </label>
          <Input
            value={variant.sku || ""}
            onChange={(e) => onChange(index, "sku", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена
          </label>
          <Input
            type="number"
            value={variant.price || 0}
            onChange={(e) => onChange(index, "price", Number(e.target.value))}
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Старая цена
            </label>
            <Input
              type="number"
              value={variant.oldPrice || 0}
              onChange={(e) =>
                onChange(index, "oldPrice", Number(e.target.value))
              }
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Остаток
          </label>
          <Input
            type="number"
            value={variant.stock || 0}
            onChange={(e) => onChange(index, "stock", Number(e.target.value))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Вес
          </label>
          <Input
            type="number"
            value={variant.weight || 0}
            onChange={(e) => onChange(index, "weight", Number(e.target.value))}
          />
        </div>
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отображаемое название
            </label>
            <Input
              value={variant.displayName || ""}
              onChange={(e) => onChange(index, "displayName", e.target.value)}
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      </div>
    </div>
  );
}

function ImageUploadForm({ productId, onClose, onSave }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Выберите файлы для загрузки");
      return;
    }

    try {
      setUploading(true);
      const adminToken = getAdminToken();
      const formData = new FormData();

      // Добавляем все файлы в массив
      files.forEach((file) => {
        formData.append("file", file);
      });

      const res = await fetch(`/api/products/${productId}/images`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
        body: formData,
      });

      if (res.ok) {
        onSave();
      } else {
        const errorText = await res.text();
        console.error("Error uploading images:", res.status, errorText);
        alert("Ошибка при загрузке изображений");
      }
    } catch (e) {
      console.error("Error uploading images:", e);
      alert("Ошибка при загрузке изображений");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Загрузить изображения</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Выберите изображения
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
          />
          {files.length > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              Выбрано файлов: {files.length}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            type="submit"
            className="bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            disabled={uploading}
          >
            {uploading ? "Загрузка..." : "Загрузить"}
          </Button>
          <Button type="button" onClick={onClose} variant="outline">
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
