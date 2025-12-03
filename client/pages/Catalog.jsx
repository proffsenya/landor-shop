// client/pages/Catalog.jsx
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import AccordionMotion from "@/utils/AccordionMotion";
import { motion } from "framer-motion";
import { ScrollFade, StaggerParent } from "@/utils/CatalogAnimations";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { getAdminToken } from "@/utils/adminAuth";

// -------- Вспомогательные блоки ----------
const FilterSection = memo(({ title, children, isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), []);

  return (
    <div className="pb-4 mb-4 border-b border-gray-200">
      <button
        onClick={toggleExpanded}
        className="flex items-center justify-between w-full mb-3 font-medium text-left text-gray-900 select-none"
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </motion.div>
      </button>

      <AccordionMotion isOpen={expanded}>
        <div className="mt-2">{children}</div>
      </AccordionMotion>
    </div>
  );
});
FilterSection.displayName = 'FilterSection';

// ---------- Хелперы названий ----------
const getProductName = (p) =>
  p?.name ??
  p?.title ??
  p?.productName ??
  p?.display_name ??
  p?.displayName ??
  "Товар";

const getVariantDisplayName = (_, v) =>
  v?.display_name ?? v?.displayName ?? v?.name ?? "Товар";

// ---------- Кэш для изображений ----------
const imageCache = new Map();

// ---------- Загрузка изображения через API ----------
async function fetchImageUrl(productId, imageId, token) {
  if (!productId || !imageId) return "/korm1.svg";
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(
        productId
      )}/images/${encodeURIComponent(imageId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) {
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const blob = await res.blob();
    const ct = res.headers.get("content-type") || blob.type || "";
    if (!ct.startsWith("image/")) {
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch (e) {
    const fb = "/korm1.svg";
    imageCache.set(cacheKey, fb);
    return fb;
  }
}

// ---------- Получение первой картинки ----------
const getFirstImage = (product) => {
  const images =
    (Array.isArray(product?.images) && product.images) ||
    (Array.isArray(product?.productImageDTOs) && product.productImageDTOs) ||
    [];

  const first =
    images.find((img) => {
      if (typeof img === "string" && img.trim().length > 0) return true;
      const url = img?.url || img?.path || img?.src;
      return typeof url === "string" && url.trim().length > 0;
    }) || null;

  if (!first) return null; // Возвращаем null, чтобы загрузить через API
  if (typeof first === "string") {
    const trimmed = first.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  const url = first.url || first.path || first.src;
  if (typeof url === "string" && url.trim().length > 0) {
    return url.trim();
  }
  return null;
};

// ---------- Преобразование продукта в карточки ----------
const expandProductToCards = (product) => {
  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.map((v) => {
      const price = Number(v?.price ?? 0);
      const variantId = v?.id ?? null;
      const imageUrl = v?.imageUrl || "/korm1.svg";
      const stock = Number(v?.stock ?? 0);
      const displayName = v?.displayName || product?.productName || "Товар";

      return {
        cardId: `p-${product.id}-v-${variantId}`,
        id: variantId,
        parentId: product?.id ?? null,
        title: displayName,
        image: imageUrl, // Это будет путь типа /api/products/1/images/1
        price: Number.isFinite(price) ? price : 0,
        stock: Number.isFinite(stock) ? stock : 0,
      };
    });
  }

  // Без variants -> одна карточка (не должно быть, но на всякий случай)
  const pid = product?.id ?? Math.random().toString(36).slice(2);
  const price = Number(product?.price ?? 0);
  const stock = Number(product?.stock ?? 0);

  return [
    {
      cardId: `p-${pid}`,
      id: pid,
      parentId: pid,
      title: product?.productName || "Товар",
      image: "/korm1.svg",
      price: Number.isFinite(price) ? price : 0,
      stock: Number.isFinite(stock) ? stock : 0,
    },
  ];
};

export default function Catalog() {
  // товары для карточек (после экспанда)
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [filtersRestored, setFiltersRestored] = useState(false);

  // Функция для показа уведомлений
  const showToast = (msg, ms = 1500) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  // мобильное состояние
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Загруженные данные фильтров из API
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    flavors: [],
    scents: [],
    countries: [],
    breeds: [],
    categories: [],
    typeOfFoods: [],
    productTypes: [],
    breedsByCategory: {
      cat: [],
      dog: [],
      minicat: [],
      minidog: [],
    },
    loading: true,
  });

  // фильтры (инициализируются динамически из API в loadFilters)
  const [categoryFilters, setCategoryFilters] = useState({});
  const [catFilters, setCatFilters] = useState({});
  const [dogFilters, setDogFilters] = useState({});
  const [minicatFilters, setMiniCatFilters] = useState({});
  const [minidogFilters, setMiniDogFilters] = useState({});
  const [countryFilters, setCountryFilters] = useState({});
  const [flavorFilters, setFlavorFilters] = useState({});
  const [brandFilters, setBrandFilters] = useState({});
  const [scentFilters, setScentFilters] = useState({});
  const [productTypeFilters, setProductTypeFilters] = useState({});

  // пагинация
  const ITEMS_PER_PAGE = 12;
  const [page, setPage] = useState(1);

  // ---------- Сохранение и восстановление фильтров ----------
  const saveFiltersToStorage = useCallback(() => {
    const filtersState = {
      searchQuery,
      priceFrom,
      priceTo,
      categoryFilters,
      catFilters,
      dogFilters,
      minicatFilters,
      minidogFilters,
      countryFilters,
      flavorFilters,
      brandFilters,
      scentFilters,
      page,
    };
    sessionStorage.setItem("catalog:filters", JSON.stringify(filtersState));
  }, [searchQuery, priceFrom, priceTo, categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters, page]);

  const restoreFiltersFromStorage = useCallback(() => {
    try {
      const saved = sessionStorage.getItem("catalog:filters");
      if (!saved) return false;

      const filtersState = JSON.parse(saved);
      
      if (filtersState.searchQuery !== undefined) setSearchQuery(filtersState.searchQuery);
      if (filtersState.priceFrom !== undefined) setPriceFrom(filtersState.priceFrom);
      if (filtersState.priceTo !== undefined) setPriceTo(filtersState.priceTo);
      if (filtersState.categoryFilters) setCategoryFilters(filtersState.categoryFilters);
      if (filtersState.catFilters) setCatFilters(filtersState.catFilters);
      if (filtersState.dogFilters) setDogFilters(filtersState.dogFilters);
      if (filtersState.minicatFilters) setMiniCatFilters(filtersState.minicatFilters);
      if (filtersState.minidogFilters) setMiniDogFilters(filtersState.minidogFilters);
      if (filtersState.countryFilters) setCountryFilters(filtersState.countryFilters);
      if (filtersState.flavorFilters) setFlavorFilters(filtersState.flavorFilters);
      if (filtersState.brandFilters) setBrandFilters(filtersState.brandFilters);
      if (filtersState.scentFilters) setScentFilters(filtersState.scentFilters);
      if (filtersState.productTypeFilters) setProductTypeFilters(filtersState.productTypeFilters);
      if (filtersState.page) setPage(filtersState.page);
      
      return true;
    } catch (e) {
      console.warn("Failed to restore filters from storage:", e);
      return false;
    }
  }, []);

  // ---------- Генерация query-строки для фильтров ----------
  const generateQueryParams = useCallback(() => {
    const queryParams = new URLSearchParams();

    // category: cat, dog, minicat, minidog (таблица categories)
    if (catFilters && Object.values(catFilters).some(v => v)) {
      queryParams.append("category_cat", "true");
    }
    if (dogFilters && Object.values(dogFilters).some(v => v)) {
      queryParams.append("category_dog", "true");
    }
    if (minicatFilters && Object.values(minicatFilters).some(v => v)) {
      queryParams.append("category_minicat", "true");
    }
    if (minidogFilters && Object.values(minidogFilters).some(v => v)) {
      queryParams.append("category_minidog", "true");
    }
    
    // breed: подфильтры для всех категорий (таблица breeds)
    Object.keys(catFilters).forEach((key) => {
      if (catFilters[key]) {
        // Если ключ содержит префикс категории (для новых категорий), убираем префикс
        const breedKey = key.includes('_') && !['cat', 'dog', 'minicat', 'minidog'].some(prefix => key.startsWith(prefix + '_'))
          ? key.split('_').slice(1).join('_') 
          : key;
        queryParams.append("breed_" + breedKey, "true");
      }
    });
    Object.keys(dogFilters).forEach((key) => {
      if (dogFilters[key]) queryParams.append("breed_" + key, "true");
    });
    Object.keys(minicatFilters).forEach((key) => {
      if (minicatFilters[key]) queryParams.append("breed_" + key, "true");
    });
    Object.keys(minidogFilters).forEach((key) => {
      if (minidogFilters[key]) queryParams.append("breed_" + key, "true");
    });
    
    // country (таблица countries)
    Object.keys(countryFilters).forEach((key) => {
      if (countryFilters[key]) queryParams.append("country_" + key, "true");
    });
    
    // typeoffood: dry, wet (таблица typeoffood)
    if (categoryFilters.dry) queryParams.append("typeoffood_dry", "true");
    if (categoryFilters.wet) queryParams.append("typeoffood_wet", "true");
    
    // taste/flavor: вкусы (таблица flavors) - используем taste_ как указано
    Object.keys(flavorFilters).forEach((key) => {
      if (flavorFilters[key]) queryParams.append("flavor_" + key, "true");
    });
    
    // brand (таблица brands)
    Object.keys(brandFilters).forEach((key) => {
      if (brandFilters[key]) queryParams.append("brand_" + key, "true");
    });
    
    // color: пока не используется, но оставляем место для будущего
    // Object.keys(colorFilters).forEach((key) => {
    //   if (colorFilters[key]) queryParams.append("color_" + key, "true");
    // });
    
    // scent (таблица scents)
    Object.keys(scentFilters).forEach((key) => {
      if (scentFilters[key]) queryParams.append("scent_" + key, "true");
    });
    
    // producttype: типы продуктов (таблица product_types)
    Object.keys(productTypeFilters).forEach((key) => {
      if (productTypeFilters[key]) queryParams.append("producttype_" + key, "true");
    });

    if (priceFrom) queryParams.append("minPrice", priceFrom);
    if (priceTo) queryParams.append("maxPrice", priceTo);
    if (searchQuery) queryParams.append("search_query", searchQuery);

    return queryParams.toString(); // БЕЗ начального "?"
  }, [categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters, productTypeFilters, priceFrom, priceTo, searchQuery]);

  // ---------- Кэш для результатов запросов ----------
  const cacheRef = useMemo(() => new Map(), []);
  const abortControllerRef = useMemo(() => ({ current: null }), []);
  const debounceTimerRef = useMemo(() => ({ current: null }), []);

  // Функция для загрузки изображений карточек
  const loadImagesForCards = useCallback(async (cards) => {
    const authToken = typeof window !== "undefined" 
      ? (localStorage.getItem("authToken") || "guest")
      : "guest";
    
    // Загружаем изображения с ограничением параллельных запросов (по 6 одновременно)
    const batchSize = 6;
    for (let i = 0; i < cards.length; i += batchSize) {
      const batch = cards.slice(i, i + batchSize);
      const imagePromises = batch.map(async (card) => {
        if (card.image && card.image.startsWith("/api/products/")) {
          try {
            const match = card.image.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
            if (match) {
              const productId = match[1];
              const variantId = match[2];
              const imageUrl = await fetchImageUrl(
                productId,
                variantId,
                authToken !== "guest" ? authToken : null
              );
              return { cardId: card.cardId, image: imageUrl || "/korm1.svg" };
            }
          } catch (e) {
            console.warn(`Failed to load image from ${card.image}:`, e);
          }
        }
        return { cardId: card.cardId, image: "/korm1.svg" };
      });
      
      const loadedImages = await Promise.all(imagePromises);
      
      // Обновляем только загруженные изображения
      setProducts((prevProducts) => {
        const updated = prevProducts.map((product) => {
          const loaded = loadedImages.find((img) => img.cardId === product.cardId);
          return loaded ? { ...product, image: loaded.image } : product;
        });
        return updated;
      });
    }
  }, []);

  // ---------- API: /api/products/cards/search-by-url?filtersUrl=<строка> ----------
  const fetchCards = useCallback(async (filtersUrlString = "", useCache = true) => {
    // Отменяем предыдущий запрос, если он еще выполняется
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Создаем новый AbortController для этого запроса
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

      // filtersUrlString ожидается в формате "?typeoffood_dry=true&brand_landy=true&category_cat=true&breed_for-sterilized=true"
      let filtersUrlValue =
        filtersUrlString || window.location.search || ""; // может быть "" либо "?..."
      
      // Убираем начальный "?" если он есть
      if (filtersUrlValue.startsWith("?")) {
        filtersUrlValue = filtersUrlValue.substring(1);
      }

      // Формируем filtersUrl с префиксом "catalog?"
      // Формат: catalog?flavor_partridge=true&minPrice=800
      const filtersUrl = filtersUrlValue ? `catalog?${filtersUrlValue}` : "catalog?";

      const url = `/api/products/cards/search-by-url?filtersUrl=${encodeURIComponent(
        filtersUrl
      )}`;

    // Проверяем кэш
    const cacheKey = url;
    if (useCache && cacheRef.has(cacheKey)) {
      const cachedData = cacheRef.get(cacheKey);
      // Проверяем, не устарел ли кэш (5 минут)
      if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
        setLoading(false);
        setError("");
        const cards = cachedData.cards;
        
        // Сначала показываем карточки с fallback изображениями
        const cardsWithFallback = cards.map((card) => ({
          ...card,
          image: "/korm1.svg",
          imageUrl: card.image,
        }));
        setProducts(cardsWithFallback);
        
        // Сохраняем все товары в sessionStorage для поиска (если еще не сохранено)
        try {
          const existing = sessionStorage.getItem("catalog:all");
          if (!existing) {
            // Сохраняем полные данные для поиска с картинками, ценами и весом
            const searchData = cards.map((card) => ({
              id: card.id || card.variantId,
              variantId: card.variantId || card.id,
              productId: card.productId || card.parentId,
              displayName: card.displayName || card.title || "Товар",
              title: card.displayName || card.title || "Товар",
              price: card.price ?? null,
              weight: card.weight ?? null,
              weightLabel: card.weightLabel || (card.weight ? (typeof card.weight === "number" ? `${card.weight} кг` : card.weight) : null),
              imageUrl: card.imageUrl || card.image || "/korm1.svg",
              image: card.imageUrl || card.image || "/korm1.svg",
            }));
            sessionStorage.setItem("catalog:all", JSON.stringify(searchData));
            window.dispatchEvent(new Event("catalog:update"));
          }
        } catch (e) {
          console.warn("Failed to save catalog:all to sessionStorage:", e);
        }
        
        // Загружаем изображения в фоне
        loadImagesForCards(cards);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(url, {
        signal: abortController.signal,
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("API error:", res.status, errorText);
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      
      // API /api/products/cards/search-by-url возвращает уже готовые карточки (варианты)
      // Структура: [{ id, displayName, price, stock, weight, imageUrl }, ...]
      if (!Array.isArray(data)) {
        console.warn("API returned non-array data:", data);
        setProducts([]);
        setPage(1);
        setLoading(false);
        return;
      }
      
      // Оптимизированное создание карточек (минимальные вычисления)
      const cards = data.map((item) => {
        const variantId = item?.id ?? null;
        const imageUrl = item?.imageUrl || "";
        
        // Извлекаем productId из imageUrl только если нужно
        let productId = null;
        if (imageUrl && imageUrl.startsWith("/api/products/")) {
          const match = imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
          if (match) {
            productId = match[1];
          }
        }
        // Также проверяем, может быть productId уже есть в данных
        if (!productId && item?.productId) {
          productId = item.productId;
        }
        
        return {
          cardId: `p-${productId || 'unknown'}-v-${variantId}`,
          id: variantId,
          parentId: productId,
          productId: productId,
          variantId: variantId,
          title: item?.displayName || "Товар",
          displayName: item?.displayName || "Товар",
          image: imageUrl,
          imageUrl: imageUrl,
          price: Number(item?.price ?? 0) || 0,
          stock: Number(item?.stock ?? 0) || 0,
          weight: item?.weight || null,
          weightLabel: item?.weightLabel || (item?.weight ? `${item.weight} кг` : null),
        };
      });
      
      // Сохраняем в кэш
      cacheRef.set(cacheKey, {
        cards,
        timestamp: Date.now(),
      });
      
      // Сохраняем все товары в sessionStorage для поиска (catalog:all), только если нет фильтров
      // Проверяем, есть ли активные фильтры
      const hasFilters = filtersUrlValue && filtersUrlValue.length > 0;
      if (!hasFilters) {
        try {
          // Сохраняем полные данные для поиска с картинками, ценами и весом
          const searchData = cards.map((card) => ({
            id: card.id || card.variantId,
            variantId: card.variantId || card.id,
            productId: card.productId || card.parentId,
            displayName: card.displayName || card.title || "Товар",
            title: card.displayName || card.title || "Товар",
            price: card.price ?? null,
            weight: card.weight ?? null,
            weightLabel: card.weightLabel || (card.weight ? (typeof card.weight === "number" ? `${card.weight} кг` : card.weight) : null),
            imageUrl: card.imageUrl || card.image || "/korm1.svg",
            image: card.imageUrl || card.image || "/korm1.svg",
          }));
          sessionStorage.setItem("catalog:all", JSON.stringify(searchData));
          // Отправляем событие для обновления поиска в Header
          window.dispatchEvent(new Event("catalog:update"));
        } catch (e) {
          console.warn("Failed to save catalog:all to sessionStorage:", e);
        }
      }
      
      // Сначала показываем карточки с fallback изображениями для быстрого отображения
      const cardsWithFallback = cards.map((card) => ({
        ...card,
        image: "/korm1.svg", // Временный fallback
        imageUrl: card.image, // Сохраняем оригинальный путь для последующей загрузки
      }));
      
      // Показываем карточки сразу
      setProducts(cardsWithFallback);
      
      // Затем асинхронно загружаем изображения в фоне (не блокируем UI)
      loadImagesForCards(cards);
      
      setLoading(false);
    } catch (error) {
      // Игнорируем ошибки отмены запроса
      if (error.name === 'AbortError') {
        return;
      }
      
      const errorText = error.message || "Ошибка загрузки";
      console.error("Error fetching cards:", error);
      setError(errorText);
      setLoading(false);
    } finally {
      // Очищаем ссылку на AbortController, если это был последний запрос
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
      }
    }
  }, [cacheRef, abortControllerRef, loadImagesForCards]);

  // Дебаунсированная версия fetchCards
  const debouncedFetchCards = useCallback((filtersUrlString = "", useCache = true) => {
    // Очищаем предыдущий таймер
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Устанавливаем новый таймер (300ms задержка)
    debounceTimerRef.current = setTimeout(() => {
      fetchCards(filtersUrlString, useCache);
    }, 300);
  }, [fetchCards, debounceTimerRef]);

  // Загрузка всех товаров для поиска (без фильтров)
  const loadAllProductsForSearch = useCallback(async () => {
    // Проверяем, есть ли уже сохраненные товары
    try {
      const existing = sessionStorage.getItem("catalog:all");
      if (existing) {
        // Если уже есть, не загружаем повторно
        return;
      }
    } catch (e) {
      // Игнорируем ошибки чтения
    }

    try {
      // Загружаем все товары без фильтров
      const url = `/api/products/cards/search-by-url?filtersUrl=${encodeURIComponent("catalog?")}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn("Failed to load all products for search:", res.status);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        return;
      }

      // Формируем полные данные для поиска с картинками, ценами и весом
      const searchData = data.map((item) => {
        // Извлекаем productId из imageUrl, если он есть
        let productId = item?.productId;
        if (!productId && item?.imageUrl && item.imageUrl.startsWith("/api/products/")) {
          const match = item.imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
          if (match) {
            productId = parseInt(match[1]);
          }
        }
        
        return {
          id: item?.id,
          variantId: item?.id,
          productId: productId,
          displayName: item?.displayName || "Товар",
          title: item?.displayName || "Товар",
          price: item?.price ?? null,
          weight: item?.weight ?? null,
          weightLabel: item?.weightLabel || (item?.weight ? (typeof item.weight === "number" ? `${item.weight} кг` : item.weight) : null),
          imageUrl: item?.imageUrl || "/korm1.svg",
          image: item?.imageUrl || "/korm1.svg",
        };
      });

      // Сохраняем в sessionStorage
      sessionStorage.setItem("catalog:all", JSON.stringify(searchData));
      
      // Отправляем событие для обновления поиска в Header
      window.dispatchEvent(new Event("catalog:update"));
    } catch (e) {
      console.warn("Error loading all products for search:", e);
    }
  }, []);

  // Восстановление фильтров при монтировании (если нет параметров в URL)
  useEffect(() => {
    const queryString = window.location.search || "";
    const urlParams = new URLSearchParams(queryString);
    const categoryParam = urlParams.get("category");
    
    // Если нет параметров в URL, пытаемся восстановить фильтры из sessionStorage
    if (!queryString && !categoryParam) {
      const restored = restoreFiltersFromStorage();
      if (restored) {
        setFiltersRestored(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Применение восстановленных фильтров после обновления состояния (только один раз)
  useEffect(() => {
    if (!filtersRestored) {
      return;
    }
    
    const queryString = window.location.search || "";
    const urlParams = new URLSearchParams(queryString);
    const categoryParam = urlParams.get("category");
    
    // Пропускаем, если уже есть параметры в URL
    if (queryString || categoryParam) {
      setFiltersRestored(false);
      return;
    }
    
    // Проверяем, есть ли сохраненные фильтры
    const saved = sessionStorage.getItem("catalog:filters");
    if (!saved) {
      setFiltersRestored(false);
      return;
    }
    
    try {
      const filtersState = JSON.parse(saved);
      // Проверяем, есть ли хотя бы один активный фильтр
      const hasActiveFilters = 
        (filtersState.searchQuery && filtersState.searchQuery.trim()) ||
        (filtersState.priceFrom && filtersState.priceFrom.trim()) ||
        (filtersState.priceTo && filtersState.priceTo.trim()) ||
        (filtersState.categoryFilters && Object.values(filtersState.categoryFilters).some(v => v)) ||
        (filtersState.catFilters && Object.values(filtersState.catFilters).some(v => v)) ||
        (filtersState.dogFilters && Object.values(filtersState.dogFilters).some(v => v)) ||
        (filtersState.minicatFilters && Object.values(filtersState.minicatFilters).some(v => v)) ||
        (filtersState.minidogFilters && Object.values(filtersState.minidogFilters).some(v => v)) ||
        (filtersState.countryFilters && Object.values(filtersState.countryFilters).some(v => v)) ||
        (filtersState.flavorFilters && Object.values(filtersState.flavorFilters).some(v => v)) ||
        (filtersState.brandFilters && Object.values(filtersState.brandFilters).some(v => v)) ||
        (filtersState.scentFilters && Object.values(filtersState.scentFilters).some(v => v)) ||
        (filtersState.productTypeFilters && Object.values(filtersState.productTypeFilters).some(v => v));
      
      if (hasActiveFilters) {
        // Применяем восстановленные фильтры
        const queryParams = generateQueryParams();
        const filtersUrlString = queryParams ? `?${queryParams}` : "";
        if (filtersUrlString) {
          window.history.pushState({}, "", filtersUrlString);
          fetchCards(filtersUrlString, true);
          // НЕ прокручиваем вверх при восстановлении фильтров
        }
      }
      // Сбрасываем filtersRestored сразу после первой проверки, чтобы не срабатывать при изменении фильтров
      setFiltersRestored(false);
    } catch (e) {
      console.warn("Failed to apply restored filters:", e);
      setFiltersRestored(false);
    }
    // Зависимости только от filtersRestored, чтобы срабатывать только один раз
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersRestored]);

  // Загрузка фильтров из API
  const loadFilters = useCallback(async () => {
    try {
      // Получаем токен для авторизации
      const token = getAdminToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [brandsRes, flavorsRes, scentsRes, countriesRes, breedsRes, categoriesRes, typeOfFoodsRes, productTypesRes] = await Promise.all([
        fetch("/api/brands", { headers }),
        fetch("/api/flavors", { headers }),
        fetch("/api/scents", { headers }),
        fetch("/api/countries", { headers }),
        fetch("/api/breeds", { headers }),
        fetch("/api/categories", { headers }),
        fetch("/api/typeOfFoods", { headers }),
        fetch("/api/productTypes", { headers }),
      ]);

      const [brands, flavors, scents, countries, breeds, categories, typeOfFoods, productTypes] = await Promise.all([
        brandsRes.ok ? brandsRes.json() : [],
        flavorsRes.ok ? flavorsRes.json() : [],
        scentsRes.ok ? scentsRes.json() : [],
        countriesRes.ok ? countriesRes.json() : [],
        breedsRes.ok ? breedsRes.json() : [],
        categoriesRes.ok ? categoriesRes.json() : [],
        typeOfFoodsRes.ok ? typeOfFoodsRes.json() : [],
        productTypesRes.ok ? productTypesRes.json() : [],
      ]);

      setAvailableFilters({
        brands: Array.isArray(brands) ? brands.filter((b) => b.isActive !== false) : [],
        flavors: Array.isArray(flavors) ? flavors : [],
        scents: Array.isArray(scents) ? scents : [],
        countries: Array.isArray(countries) ? countries : [],
        breeds: Array.isArray(breeds) ? breeds : [],
        categories: Array.isArray(categories) ? categories : [],
        typeOfFoods: Array.isArray(typeOfFoods) ? typeOfFoods : [],
        productTypes: Array.isArray(productTypes) ? productTypes : [],
        loading: false,
      });

      // Динамически группируем породы по ВСЕМ категориям из API
      // Создаем объект breedsByCategory для каждой категории
      const breedsByCategory = {};
      const categoryIds = {};
      
      if (Array.isArray(categories)) {
        categories.forEach((category) => {
          // Используем slug как ключ для совместимости со старым кодом
          const categoryKey = category.slug;
          const categoryId = category.id;
          
          categoryIds[categoryKey] = categoryId;
        
          // Группируем породы для этой категории
          breedsByCategory[categoryKey] = Array.isArray(breeds)
          ? breeds.filter((b) => {
                const breedCategoryId = b.categoryId != null ? Number(b.categoryId) : null;
                return breedCategoryId === categoryId;
            }) 
            : [];
        });
      }

      console.log("[Catalog] Breeds grouped by category (dynamic):", {
        breedsByCategory,
        categoryIds,
        categoriesCount: Array.isArray(categories) ? categories.length : 0,
      });

      // Инициализируем фильтры на основе загруженных данных
      // Обновляем только если фильтры пустые или если нужно добавить новые
      setBrandFilters((prev) => {
        const newFilters = { ...prev };
        if (Array.isArray(brands)) {
          brands.forEach((brand) => {
            if (!(brand.slug in newFilters)) {
              newFilters[brand.slug] = false;
            }
          });
        }
        return newFilters;
      });
      setFlavorFilters((prev) => {
        const newFilters = { ...prev };
        if (Array.isArray(flavors)) {
          flavors.forEach((flavor) => {
            // Используем canonicalName вместо slug, так как в API flavors нет slug
            const flavorKey = flavor.canonicalName || String(flavor.id);
            if (!(flavorKey in newFilters)) {
              newFilters[flavorKey] = false;
            }
          });
        }
        return newFilters;
      });
      setScentFilters((prev) => {
        const newFilters = { ...prev };
        if (Array.isArray(scents)) {
          scents.forEach((scent) => {
            if (!(scent.slug in newFilters)) {
              newFilters[scent.slug] = false;
            }
          });
        }
        return newFilters;
      });
      setCountryFilters((prev) => {
        const newFilters = { ...prev };
        if (Array.isArray(countries)) {
          countries.forEach((country) => {
            if (!(country.slug in newFilters)) {
              newFilters[country.slug] = false;
            }
          });
        }
        return newFilters;
      });
      setProductTypeFilters((prev) => {
        const newFilters = { ...prev };
        if (Array.isArray(productTypes)) {
          productTypes.forEach((productType) => {
            if (!(productType.slug in newFilters)) {
              newFilters[productType.slug] = false;
            }
          });
        }
        return newFilters;
      });
      
      // Инициализируем фильтры типов корма (typeOfFoods) для categoryFilters
      setCategoryFilters((prev) => {
        const newFilters = { ...prev };
        // НЕ устанавливаем "all" в true по умолчанию
        if (Array.isArray(typeOfFoods)) {
          typeOfFoods.forEach((type) => {
            if (!(type.slug in newFilters)) {
              newFilters[type.slug] = false;
            }
          });
        }
        // Если есть filler, добавляем его
        if (Array.isArray(categories)) {
          const fillerCategory = categories.find((c) => c.slug === "filler");
          if (fillerCategory && !("filler" in newFilters)) {
            newFilters.filler = false;
          }
        }
        return newFilters;
      });

      // Динамически инициализируем фильтры пород для ВСЕХ категорий
      // Используем общий подход для всех категорий
      Object.keys(breedsByCategory).forEach((categorySlug) => {
        const breeds = breedsByCategory[categorySlug] || [];
        
        // Обновляем соответствующий state фильтров в зависимости от slug категории
        if (categorySlug === "cat") {
          setCatFilters((prev) => {
            const newFilters = { ...prev };
            breeds.forEach((breed) => {
              if (!(breed.slug in newFilters)) {
                newFilters[breed.slug] = false;
              }
            });
            return newFilters;
          });
        } else if (categorySlug === "dog") {
          setDogFilters((prev) => {
            const newFilters = { ...prev };
            breeds.forEach((breed) => {
              if (!(breed.slug in newFilters)) {
                newFilters[breed.slug] = false;
              }
            });
            return newFilters;
          });
        } else if (categorySlug === "minicat") {
          setMiniCatFilters((prev) => {
            const newFilters = { ...prev };
            breeds.forEach((breed) => {
              if (!(breed.slug in newFilters)) {
                newFilters[breed.slug] = false;
              }
            });
            return newFilters;
          });
        } else if (categorySlug === "minidog") {
          setMiniDogFilters((prev) => {
            const newFilters = { ...prev };
            breeds.forEach((breed) => {
              if (!(breed.slug in newFilters)) {
                newFilters[breed.slug] = false;
              }
            });
            return newFilters;
          });
        } else {
          // Для новых категорий используем общий механизм через catFilters, dogFilters и т.д.
          // Или создаем динамический state для новых категорий
          // Пока используем catFilters как fallback для новых категорий
          setCatFilters((prev) => {
            const newFilters = { ...prev };
            breeds.forEach((breed) => {
              // Используем префикс категории для уникальности
              const breedKey = `${categorySlug}_${breed.slug}`;
              if (!(breedKey in newFilters)) {
                newFilters[breedKey] = false;
              }
            });
            return newFilters;
          });
        }
      });

      // Сохраняем все загруженные данные фильтров
      // НЕ фильтруем категории по isActive - показываем все категории из API
      const updatedFilters = {
        brands: Array.isArray(brands) ? brands.filter((b) => b.isActive !== false) : [],
        flavors: Array.isArray(flavors) ? flavors : [],
        scents: Array.isArray(scents) ? scents : [],
        countries: Array.isArray(countries) ? countries : [],
        breeds: Array.isArray(breeds) ? breeds : [],
        categories: Array.isArray(categories) ? categories : [], // Показываем ВСЕ категории
        typeOfFoods: Array.isArray(typeOfFoods) ? typeOfFoods : [],
        productTypes: Array.isArray(productTypes) ? productTypes : [],
        breedsByCategory,
        loading: false,
      };
      
      console.log("[Catalog] Setting availableFilters with breedsByCategory:", {
        breedsByCategory,
        hasBreedsByCategory: !!updatedFilters.breedsByCategory,
        categories: updatedFilters.categories,
        categoriesCount: updatedFilters.categories.length,
      });
      
      setAvailableFilters(updatedFilters);
    } catch (e) {
      console.error("Error loading filters:", e);
      setAvailableFilters((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Загрузка фильтров при монтировании
  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  // Обновление фильтров при событиях от админки
  useEffect(() => {
    const handleFiltersUpdated = () => {
      loadFilters();
    };

    window.addEventListener("catalog:filters-updated", handleFiltersUpdated);
    window.addEventListener("catalog:categories-updated", handleFiltersUpdated);

    return () => {
      window.removeEventListener("catalog:filters-updated", handleFiltersUpdated);
      window.removeEventListener("catalog:categories-updated", handleFiltersUpdated);
    };
  }, [loadFilters]);

  // Загрузка всех товаров для поиска при первой загрузке
  useEffect(() => {
    loadAllProductsForSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Слушатель событий для обновления при изменении фильтров/категорий в админке
  useEffect(() => {
    const handleFiltersUpdated = () => {
      // Очищаем кэш товаров
      try {
        sessionStorage.removeItem("catalog:all");
      } catch (e) {
        console.warn("Failed to clear catalog cache:", e);
      }
      
      // Очищаем кэш запросов каталога
      cacheRef.clear();
      
      // Перезагружаем товары с текущими фильтрами
      const queryString = window.location.search || "";
      fetchCards(queryString, false); // false = не использовать кэш
      
      // Перезагружаем все товары для поиска
      loadAllProductsForSearch();
    };

    const handleCategoriesUpdated = () => {
      // Очищаем кэш товаров
      try {
        sessionStorage.removeItem("catalog:all");
      } catch (e) {
        console.warn("Failed to clear catalog cache:", e);
      }
      
      // Очищаем кэш запросов каталога
      cacheRef.clear();
      
      // Перезагружаем товары с текущими фильтрами
      const queryString = window.location.search || "";
      fetchCards(queryString, false); // false = не использовать кэш
      
      // Перезагружаем все товары для поиска
      loadAllProductsForSearch();
    };

    window.addEventListener("catalog:filters-updated", handleFiltersUpdated);
    window.addEventListener("catalog:categories-updated", handleCategoriesUpdated);

    return () => {
      window.removeEventListener("catalog:filters-updated", handleFiltersUpdated);
      window.removeEventListener("catalog:categories-updated", handleCategoriesUpdated);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // первая загрузка: используем то, что уже есть в адресной строке
  useEffect(() => {
    // Ждем загрузки фильтров перед обработкой категорий из URL
    if (availableFilters.loading) return;

    const queryString = window.location.search || "";
    const urlParams = new URLSearchParams(queryString);
    const categoryParam = urlParams.get("category");

    // Если есть параметр category, генерируем соответствующие query параметры
    if (categoryParam) {
      const categoryQueryParams = new URLSearchParams();
      
      // Динамически обрабатываем ВСЕ категории из API
      // Специальная обработка для filler
      if (categoryParam === "filler") {
          // Для наполнителей - используем producttype_filler и активируем ВСЕ запахи
          categoryQueryParams.append("producttype_filler", "true");
          const scents = availableFilters.scents || [];
          scents.forEach((scent) => {
            categoryQueryParams.append(`scent_${scent.slug}`, "true");
          });
      } else {
        // Для всех остальных категорий - динамически активируем категорию и все породы
        const categorySlug = categoryParam;
        categoryQueryParams.append(`category_${categorySlug}`, "true");
        
        // Активируем все породы для этой категории
        const breeds = availableFilters.breedsByCategory?.[categorySlug] || [];
        breeds.forEach((breed) => {
          categoryQueryParams.append(`breed_${breed.slug}`, "true");
        });
      }

      // Добавляем остальные параметры из URL (если есть)
      urlParams.forEach((value, key) => {
        if (key !== "category") {
          categoryQueryParams.append(key, value);
        }
      });

      // Динамически устанавливаем фильтры в состояние для отображения в UI
      if (categoryParam === "filler") {
        // Для наполнителей устанавливаем фильтр категории и ВСЕ запахи
        setCategoryFilters((prev) => ({
          ...prev,
          all: false,
          filler: true,
        }));
        const scents = availableFilters.scents || [];
        const newScentFilters = {};
        scents.forEach((scent) => {
          newScentFilters[scent.slug] = true;
        });
        setScentFilters(newScentFilters);
      } else {
        // Для всех остальных категорий - динамически активируем фильтры пород
        const categorySlug = categoryParam;
        const breeds = availableFilters.breedsByCategory?.[categorySlug] || [];
        
        // Обновляем соответствующий state фильтров в зависимости от slug категории
        if (categorySlug === "cat") {
          const newCatFilters = {};
          breeds.forEach((breed) => {
            newCatFilters[breed.slug] = true;
          });
          setCatFilters(newCatFilters);
        } else if (categorySlug === "dog") {
          const newDogFilters = {};
          breeds.forEach((breed) => {
            newDogFilters[breed.slug] = true;
          });
          setDogFilters(newDogFilters);
        } else if (categorySlug === "minicat") {
          const newMiniCatFilters = {};
          breeds.forEach((breed) => {
            newMiniCatFilters[breed.slug] = true;
          });
          setMiniCatFilters(newMiniCatFilters);
        } else if (categorySlug === "minidog") {
          const newMiniDogFilters = {};
          breeds.forEach((breed) => {
            newMiniDogFilters[breed.slug] = true;
          });
          setMiniDogFilters(newMiniDogFilters);
        }
        // Для новых категорий можно добавить общий state или обрабатывать отдельно
      }

      // Вызываем fetchCards с правильными параметрами
      const finalQueryString = categoryQueryParams.toString() ? `?${categoryQueryParams.toString()}` : "";
      
      // Обновляем URL без перезагрузки страницы
      window.history.pushState({}, "", finalQueryString || window.location.pathname);
      
      fetchCards(finalQueryString, true);
      if (finalQueryString) {
        sessionStorage.setItem("catalog:lastQuery", finalQueryString);
      }
    } else {
      // Если нет параметра category, используем обычную логику
      fetchCards(queryString, true);
      if (queryString) {
        sessionStorage.setItem("catalog:lastQuery", queryString);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableFilters.loading, availableFilters.breedsByCategory, availableFilters.scents]);

  // клиентская фильтрация по поиску (фильтрация по цене работает через API)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products.filter((p) => {
      const title = (p.title ?? p.name ?? "").toString().toLowerCase();
      const byQuery = q ? title.includes(q) : true;
      return byQuery;
    });
  }, [products, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const goto = (p) => {
    const newPage = Math.min(Math.max(1, p), totalPages);
    setPage(newPage);
  };

  // Автоматическое сохранение фильтров при их изменении
  useEffect(() => {
    // Сохраняем фильтры только если они были изменены пользователем (не при восстановлении)
    if (!filtersRestored) {
      saveFiltersToStorage();
    }
  }, [searchQuery, priceFrom, priceTo, categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters, page, saveFiltersToStorage, filtersRestored]);

  // Прокручиваем вверх при смене страницы
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  const handleCategoryChange = useCallback((category) => {
    if (category === "all") {
      setCategoryFilters({
        all: true,
        dry: false,
        wet: false,
        filler: false,
      });
    } else {
      setCategoryFilters((prev) => ({
        ...prev,
        all: false,
        [category]: !prev[category],
      }));
    }
  }, []);

  const handleApplyFilters = useCallback(() => {
    const queryParams = generateQueryParams(); // "typeoffood_dry=true&brand_landy=true&category_cat=true&breed_for-sterilized=true"
    const filtersUrlString = queryParams ? `?${queryParams}` : "";

    console.log("Applying filters, queryParams:", queryParams);
    console.log("Filters URL string:", filtersUrlString);

    // обновляем URL страницы
    window.history.pushState({}, "", filtersUrlString || window.location.pathname);

    // сохраняем query параметры в sessionStorage для использования при возврате из страницы товара
    sessionStorage.setItem("catalog:lastQuery", filtersUrlString);
    
    // сохраняем состояние всех фильтров
    saveFiltersToStorage();

    // отправляем в бэк именно эту строку (без дебаунсинга для явного применения фильтров)
    fetchCards(filtersUrlString, true);
    setMobileFiltersOpen(false);
    // Прокручиваем вверх при применении фильтров
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [generateQueryParams, saveFiltersToStorage, fetchCards]);

  const handleResetFilters = useCallback(() => {
    // Сбрасываем категории корма (без автоматической галочки "все корма")
    const resetCategoryFilters = {};
    availableFilters.typeOfFoods.forEach((type) => {
      resetCategoryFilters[type.slug] = false;
    });
    if (availableFilters.categories.find((c) => c.slug === "filler")) {
      resetCategoryFilters.filler = false;
    }
    setCategoryFilters(resetCategoryFilters);
    
    // Сбрасываем все остальные фильтры (породы остаются как есть, просто сбрасываем значения)
    setCatFilters({});
    setDogFilters({});
    setMiniCatFilters({});
    setMiniDogFilters({});
    
    // Сбрасываем динамические фильтры
    const resetCountryFilters = {};
    availableFilters.countries.forEach((country) => {
      resetCountryFilters[country.slug] = false;
    });
    setCountryFilters(resetCountryFilters);
    
    const resetFlavorFilters = {};
    availableFilters.flavors.forEach((flavor) => {
      // Используем canonicalName вместо slug, так как в API flavors нет slug
      const flavorKey = flavor.canonicalName || String(flavor.id);
      resetFlavorFilters[flavorKey] = false;
    });
    setFlavorFilters(resetFlavorFilters);
    
    const resetBrandFilters = {};
    availableFilters.brands.forEach((brand) => {
      resetBrandFilters[brand.slug] = false;
    });
    setBrandFilters(resetBrandFilters);
    
    const resetScentFilters = {};
    availableFilters.scents.forEach((scent) => {
      resetScentFilters[scent.slug] = false;
    });
    setScentFilters(resetScentFilters);
    
    const resetProductTypeFilters = {};
    availableFilters.productTypes.forEach((productType) => {
      resetProductTypeFilters[productType.slug] = false;
    });
    setProductTypeFilters(resetProductTypeFilters);
    
    setPriceFrom("");
    setPriceTo("");
    setSearchQuery("");

    // чистим URL
    window.history.pushState({}, "", window.location.pathname);

    // отправляем пустую строку в filtersUrl
    fetchCards("", true);
    setMobileFiltersOpen(false);
    // Прокручиваем вверх при сбросе фильтров
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [availableFilters]);

  // Мобильные фильтры
  const MobileFilters = () => (
    <div className="fixed inset-0 z-50 bg-white lg:hidden">
      <div className="flex flex-col h-full">
        {/* Хедер */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Фильтры</h2>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Контент фильтров */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-6">
            {/* Тип продукта */}
            <FilterSection title="Тип продукта">
              <div className="space-y-2">
                {availableFilters.productTypes.map((productType) => (
                  <label key={productType.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={productTypeFilters[productType.slug] || false}
                      onCheckedChange={(c) =>
                        setProductTypeFilters((prev) => ({ ...prev, [productType.slug]: c }))
                      }
                    />
                    <span className="text-sm">{productType.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="Тип корма">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={categoryFilters.all}
                    onCheckedChange={() => handleCategoryChange("all")}
                  />
                  <span className="text-sm">Все корма</span>
                </label>
                {availableFilters.typeOfFoods.map((type) => (
                  <label key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                      checked={categoryFilters[type.slug] || false}
                      onCheckedChange={() => handleCategoryChange(type.slug)}
                  />
                    <span className="text-sm">{type.name}</span>
                </label>
                ))}
                {/* Наполнитель (если есть в категориях) */}
                {availableFilters.categories.find((c) => c.slug === "filler") && (
                <label className="flex items-center space-x-2">
                  <Checkbox
                      checked={categoryFilters.filler || false}
                    onCheckedChange={() => handleCategoryChange("filler")}
                  />
                  <span className="text-sm">Наполнитель</span>
                </label>
                )}
              </div>
            </FilterSection>

            <FilterSection title="По стоимости">
              <div className="flex space-x-2">
                <Input
                  placeholder="от"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="до"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="flex-1"
                />
              </div>
            </FilterSection>

            {/* Динамически отображаем фильтры пород для ВСЕХ категорий */}
            {(() => {
              // Логируем для отладки
              const categoriesToRender = Array.isArray(availableFilters.categories) 
                ? availableFilters.categories.filter((cat) => cat.slug !== "filler")
                : [];
              
              console.log("[Catalog] Rendering category filters:", {
                allCategories: availableFilters.categories,
                categoriesToRender: categoriesToRender,
                breedsByCategory: availableFilters.breedsByCategory,
                breedsByCategoryKeys: availableFilters.breedsByCategory ? Object.keys(availableFilters.breedsByCategory) : [],
              });
              
              return categoriesToRender
                .map((category) => {
                  const categorySlug = category.slug;
                  const breeds = availableFilters.breedsByCategory?.[categorySlug] || [];
                  
                  console.log(`[Catalog] Processing category ${category.name} (${categorySlug}):`, {
                    categoryId: category.id,
                    breedsCount: breeds.length,
                    hasBreeds: breeds.length > 0,
                  });
                  
                  // Пропускаем категории без пород
                  if (breeds.length === 0) {
                    console.log(`[Catalog] Skipping category ${category.name} - no breeds`);
                    return null;
                  }
                
                // Получаем правильный state фильтров в зависимости от slug
                const getFilterValue = (breedSlug) => {
                  if (categorySlug === "cat") return catFilters[breedSlug] || false;
                  if (categorySlug === "dog") return dogFilters[breedSlug] || false;
                  if (categorySlug === "minicat") return minicatFilters[breedSlug] || false;
                  if (categorySlug === "minidog") return minidogFilters[breedSlug] || false;
                  // Для новых категорий используем catFilters с префиксом
                  const breedKey = `${categorySlug}_${breedSlug}`;
                  return catFilters[breedKey] || false;
                };
                
                const handleFilterChange = (breedSlug, checked) => {
                  if (categorySlug === "cat") {
                    setCatFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                  } else if (categorySlug === "dog") {
                    setDogFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                  } else if (categorySlug === "minicat") {
                    setMiniCatFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                  } else if (categorySlug === "minidog") {
                    setMiniDogFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                  } else {
                    // Для новых категорий используем catFilters с префиксом
                    const breedKey = `${categorySlug}_${breedSlug}`;
                    setCatFilters((prev) => ({ ...prev, [breedKey]: checked }));
                  }
                };
                
                return (
                  <FilterSection key={category.id} title={category.name}>
              <div className="space-y-2">
                      {breeds.map((breed) => (
                      <label key={breed.id} className="flex items-center space-x-2">
                  <Checkbox
                            checked={getFilterValue(breed.slug)}
                            onCheckedChange={(c) => handleFilterChange(breed.slug, c)}
                  />
                        <span className="text-sm">{breed.name}</span>
                </label>
                      ))}
              </div>
            </FilterSection>
                );
              })
              .filter(Boolean); // Убираем null значения
            })()}

            {/* Страна */}
            <FilterSection title="Страна производства">
              <div className="space-y-2">
                {availableFilters.countries.map((country) => (
                  <label key={country.id} className="flex items-center space-x-2">
                  <Checkbox
                      checked={countryFilters[country.slug] || false}
                    onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, [country.slug]: c }))
                    }
                  />
                    <span className="text-sm">{country.name}</span>
                </label>
                ))}
              </div>
            </FilterSection>

            {/* Вкус */}
            <FilterSection title="Вкус">
              <div className="grid grid-cols-2 gap-2">
                {availableFilters.flavors.map((flavor) => {
                  // Используем canonicalName вместо slug, так как в API flavors нет slug
                  const flavorKey = flavor.canonicalName || String(flavor.id);
                  return (
                  <label key={flavor.id} className="flex items-center space-x-2">
                    <Checkbox
                        checked={flavorFilters[flavorKey] || false}
                      onCheckedChange={(c) =>
                          setFlavorFilters((prev) => ({ ...prev, [flavorKey]: c }))
                      }
                    />
                    <span className="text-sm">{flavor.name}</span>
                  </label>
                  );
                })}
              </div>
            </FilterSection>

            {/* Запахи */}
            <FilterSection title="Запахи">
              <div className="grid grid-cols-2 gap-2">
                {availableFilters.scents.map((scent) => (
                  <label key={scent.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={scentFilters[scent.slug] || false}
                      onCheckedChange={(c) =>
                        setScentFilters((prev) => ({ ...prev, [scent.slug]: c }))
                      }
                    />
                    <span className="text-sm">{scent.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Бренд */}
            <FilterSection title="Бренд">
              <div className="space-y-2">
                {availableFilters.brands.map((brand) => (
                  <label key={brand.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={brandFilters[brand.slug] || false}
                      onCheckedChange={(c) =>
                        setBrandFilters((prev) => ({ ...prev, [brand.slug]: c }))
                      }
                    />
                    <span className="text-sm">{brand.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </div>

        {/* Футер кнопок */}
        <div className="p-4 bg-white border-t border-gray-200">
          <Button
            onClick={handleApplyFilters}
            className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mb-3"
          >
            Применить
          </Button>
          <Button
            onClick={handleResetFilters}
            className="w-full text-white bg-gray-500 hover:bg-gray-600"
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow container px-4 py-8 mx-auto">
        <BreadcrumbNav items={[
          { label: "Главная", to: "/" },
          { label: "Каталог" }
        ]} />
        {/* Мобильная панель */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <Button
            onClick={() => setMobileFiltersOpen(true)}
            className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
          >
            <Filter className="w-4 h-4" />
            Фильтры
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Левая колонка — фильтры (десктоп) */}
          <PageFade>
            <div className="hidden lg:block lg:col-span-1">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Фильтры</h2>

              {/* Те же фильтры, что и в MobileFilters */}
              {/* Тип продукта */}
              <FilterSection title="Тип продукта">
                <div className="space-y-2">
                  {availableFilters.productTypes.map((productType) => (
                    <label key={productType.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={productTypeFilters[productType.slug] || false}
                        onCheckedChange={(c) =>
                          setProductTypeFilters((prev) => ({ ...prev, [productType.slug]: c }))
                        }
                      />
                      <span className="text-sm">{productType.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Тип корма">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.all}
                      onCheckedChange={() => handleCategoryChange("all")}
                    />
                    <span className="text-sm">Все корма</span>
                  </label>
                {availableFilters.typeOfFoods.map((type) => (
                  <label key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters[type.slug] || false}
                      onCheckedChange={() => handleCategoryChange(type.slug)}
                    />
                    <span className="text-sm">{type.name}</span>
                  </label>
                ))}
                {/* Наполнитель (если есть в категориях) */}
                {availableFilters.categories.find((c) => c.slug === "filler") && (
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.filler || false}
                      onCheckedChange={() => handleCategoryChange("filler")}
                    />
                    <span className="text-sm">Наполнитель</span>
                  </label>
                )}
                </div>
              </FilterSection>

              <FilterSection title="По стоимости">
                <div className="flex space-x-2">
                  <Input
                    placeholder="от"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="до"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </FilterSection>

              {/* Динамически отображаем фильтры пород для ВСЕХ категорий */}
              {(() => {
                return availableFilters.categories
                  .filter((cat) => cat.slug !== "filler") // Исключаем filler, он обрабатывается отдельно
                  .map((category) => {
                    const categorySlug = category.slug;
                    const breeds = availableFilters.breedsByCategory?.[categorySlug] || [];
                    
                    // Пропускаем категории без пород
                    if (breeds.length === 0) return null;
                  
                  // Получаем правильный state фильтров в зависимости от slug
                  const getFilterValue = (breedSlug) => {
                    if (categorySlug === "cat") return catFilters[breedSlug] || false;
                    if (categorySlug === "dog") return dogFilters[breedSlug] || false;
                    if (categorySlug === "minicat") return minicatFilters[breedSlug] || false;
                    if (categorySlug === "minidog") return minidogFilters[breedSlug] || false;
                    // Для новых категорий используем catFilters с префиксом
                    const breedKey = `${categorySlug}_${breedSlug}`;
                    return catFilters[breedKey] || false;
                  };
                  
                  const handleFilterChange = (breedSlug, checked) => {
                    if (categorySlug === "cat") {
                      setCatFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                    } else if (categorySlug === "dog") {
                      setDogFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                    } else if (categorySlug === "minicat") {
                      setMiniCatFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                    } else if (categorySlug === "minidog") {
                      setMiniDogFilters((prev) => ({ ...prev, [breedSlug]: checked }));
                    } else {
                      // Для новых категорий используем catFilters с префиксом
                      const breedKey = `${categorySlug}_${breedSlug}`;
                      setCatFilters((prev) => ({ ...prev, [breedKey]: checked }));
                    }
                  };
                  
                  return (
                    <FilterSection key={category.id} title={category.name}>
                <div className="space-y-2">
                        {breeds.map((breed) => (
                        <label key={breed.id} className="flex items-center space-x-2">
                    <Checkbox
                              checked={getFilterValue(breed.slug)}
                              onCheckedChange={(c) => handleFilterChange(breed.slug, c)}
                    />
                          <span className="text-sm">{breed.name}</span>
                  </label>
                        ))}
                </div>
              </FilterSection>
                );
              })
              .filter(Boolean); // Убираем null значения
            })()}

              {/* Страна */}
              <FilterSection title="Страна производства">
                <div className="space-y-2">
                  {availableFilters.countries.map((country) => (
                    <label key={country.id} className="flex items-center space-x-2">
                    <Checkbox
                        checked={countryFilters[country.slug] || false}
                      onCheckedChange={(c) =>
                          setCountryFilters((prev) => ({ ...prev, [country.slug]: c }))
                      }
                    />
                      <span className="text-sm">{country.name}</span>
                  </label>
                  ))}
                </div>
              </FilterSection>

              {/* Вкус */}
              <FilterSection title="Вкус">
                <div className="grid grid-cols-2 gap-2">
                  {availableFilters.flavors.map((flavor) => {
                    // Используем canonicalName вместо slug, так как в API flavors нет slug
                    const flavorKey = flavor.canonicalName || String(flavor.id);
                    return (
                    <label key={flavor.id} className="flex items-center space-x-2">
                      <Checkbox
                          checked={flavorFilters[flavorKey] || false}
                        onCheckedChange={(c) =>
                          setFlavorFilters((prev) => ({
                            ...prev,
                              [flavorKey]: c,
                          }))
                        }
                      />
                      <span className="text-sm">{flavor.name}</span>
                    </label>
                    );
                  })}
                </div>
              </FilterSection>

              {/* Запахи */}
              <FilterSection title="Запахи">
                <div className="grid grid-cols-2 gap-2">
                  {availableFilters.scents.map((scent) => (
                    <label key={scent.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={scentFilters[scent.slug] || false}
                        onCheckedChange={(c) =>
                          setScentFilters((prev) => ({ ...prev, [scent.slug]: c }))
                        }
                      />
                      <span className="text-sm">{scent.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Бренд */}
              <FilterSection title="Бренд">
                <div className="space-y-2">
                  {availableFilters.brands.map((brand) => (
                    <label key={brand.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={brandFilters[brand.slug] || false}
                        onCheckedChange={(c) =>
                          setBrandFilters((prev) => ({
                            ...prev,
                            [brand.slug]: c,
                          }))
                        }
                      />
                      <span className="text-sm">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <Button
                onClick={handleApplyFilters}
                className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6"
              >
                Применить
              </Button>
              <Button
                onClick={handleResetFilters}
                className="w-full mt-3 text-white bg-gray-500 hover:bg-gray-600"
              >
                Сбросить фильтры
              </Button>
            </div>
            </div>
          </PageFade>

          {/* Правая колонка — товары */}
          <div className="lg:col-span-3">
            <ScrollFade>
              <div className="mb-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">
                  Каталог
                </h1>
              </div>
            </ScrollFade>

            {loading && (
              <div className="py-12 text-center text-gray-500">Загрузка…</div>
            )}
            {!loading && error && (
              <div className="py-12 text-center text-red-600">
                Ошибка: {error}
              </div>
            )}
            {!loading && !error && products.length === 0 && (
              <div className="py-12 text-center text-gray-500">
                Нет товаров
              </div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <StaggerParent
                  delayChildren={0.05}
                  stagger={0.05}
                  key={page}
                >
                  <div className="grid items-stretch grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paged.map((product) => {
                      // Вариант определяется по наличию parentId и его отличию от id
                      const isVariantCard =
                        product.parentId != null && 
                        String(product.parentId) !== String(product.id);
                      
                      // Всегда формируем URL с вариантом, если есть parentId
                      const to = product.parentId != null
                        ? `/product/${encodeURIComponent(
                            product.parentId
                          )}?variant=${encodeURIComponent(product.id)}`
                        : `/product/${encodeURIComponent(product.id)}`;

                      // Форматируем вес
                      const weightDisplay = product.weight 
                        ? (typeof product.weight === "number" 
                          ? `${product.weight % 1 === 0 ? product.weight : product.weight.toFixed(3)} кг`
                          : product.weight)
                        : product.weightLabel || null;

                      return (
                        <ProductCard
                          key={product.cardId}
                          to={to}
                          productId={product.parentId || product.id}
                          variantId={product.id}
                          image={product.image}
                          title={product.title ?? product.name ?? "Товар"}
                          price={`${Number(
                            product.price ?? 0
                          ).toLocaleString()} ₽`}
                          stock={product.stock}
                          weight={weightDisplay}
                        />
                      );
                    })}
                  </div>
                </StaggerParent>

                <PageFade>
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goto(page - 1)}
                      disabled={page === 1}
                    >
                      &lt;
                    </Button>

                    <span className="text-sm font-medium text-gray-700">
                      {String(page).padStart(2, "0")}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goto(page + 1)}
                      disabled={page === totalPages}
                    >
                      &gt;
                    </Button>
                  </div>

                  <div className="mt-4 text-sm text-center text-gray-500">
                    Показано {Math.min((page - 1) * ITEMS_PER_PAGE + paged.length, filtered.length)} из {filtered.length} товаров ·
                    Страница {page} из {totalPages}
                  </div>
                </PageFade>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && <MobileFilters />}

      <Footer />
    </div>
  );
}
