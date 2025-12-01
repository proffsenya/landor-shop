import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
import { getAdminToken } from "@/utils/adminAuth";

// Маппинг slug'ов категорий на изображения и цвета
const categoryConfig = {
  cat: {
    image: "/categories/cat1.svg",
    bgColor: "#FFF4D8",
  },
  minicat: {
    image: "/categories/minicat.svg",
    bgColor: "#E7F4D8",
  },
  dog: {
    image: "/categories/dog1.svg",
    bgColor: "#FCE4FA",
  },
  minidog: {
    image: "/categories/minidog1.svg",
    bgColor: "#EFE2E0",
  },
  filler: {
    image: "/categories/napolnitel.svg",
    bgColor: "#E4EEF7",
  },
};

// Значения по умолчанию для категорий без конфигурации
const defaultConfig = {
  image: "/categories/cat1.svg",
  bgColor: "#FFF4D8",
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const token = getAdminToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await fetch("/api/categories", { headers });
      
      if (res.ok) {
        const data = await res.json();
        console.log("[Categories] Loaded categories from API:", data);
        
        // Фильтруем только активные категории (если поле есть) и берем все категории для отображения
        const processedCategories = Array.isArray(data)
          ? data
              .filter((cat) => {
                // Если поле isActive отсутствует, считаем категорию активной
                return cat.isActive === undefined || cat.isActive !== false;
              })
              .map((cat) => {
                const config = categoryConfig[cat.slug] || defaultConfig;
                return {
                  id: cat.id,
                  name: cat.name,
                  slug: cat.slug,
                  image: config.image,
                  bgColor: config.bgColor,
                };
              })
          : [];
        
        console.log("[Categories] Processed categories:", processedCategories);
        setCategories(processedCategories);
      } else {
        console.error("Failed to load categories:", res.status);
        setCategories([]);
      }
    } catch (e) {
      console.error("Error loading categories:", e);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Слушаем события обновления категорий из админки
  useEffect(() => {
    const handleCategoriesUpdated = () => {
      console.log("[Categories] Categories updated event received, reloading...");
      loadCategories();
    };

    window.addEventListener("catalog:categories-updated", handleCategoriesUpdated);

    return () => {
      window.removeEventListener("catalog:categories-updated", handleCategoriesUpdated);
    };
  }, [loadCategories]);

  return (
    <section className="py-12 bg-white sm:py-14">
      <div className="container px-4 mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col items-center justify-between gap-3 mb-8 text-center sm:flex-row sm:mb-12 sm:text-left">
          <h2 className="text-xl sm:text-2xl text-[#6F2A2B]">
            Популярные категории
          </h2>
          <a
            href="/catalog"
            className="text-sm sm:text-base text-[#6F2A2B] hover:opacity-70"
          >
            Все категории
          </a>
        </div>

        {/* Сетка */}
        

        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F2A2B]"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Нет категорий для отображения
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6 justify-items-center">
            {categories.map((category) => (
              <StaggerItem key={category.id}>
                <HoverLift>
                  <Link
                    to={`/catalog?category=${category.slug}`}
                    className="relative w-[160px] sm:w-[200px] lg:w-[220px] flex flex-col items-center cursor-pointer"
                  >
                    {/* Фото */}
                    <div
                      className="z-10 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="object-cover w-full h-full rounded-full"
                      />
                    </div>

                    {/* Нижний блок */}
                    <div
                      className="w-full sm:w-[200px] lg:w-[220px] h-[110px] sm:h-[130px] rounded-[16px] -mt-[28px] flex flex-col items-center justify-center text-center"
                      style={{ backgroundColor: category.bgColor }}
                    >
                      <h3 className="text-[15px] sm:text-[17px] font-medium text-[#6F2A2B] leading-tight">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                </HoverLift>
              </StaggerItem>
            ))}
          </div>
        )}
        
      </div>
    </section>
  );
}
