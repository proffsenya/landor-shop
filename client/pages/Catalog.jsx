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

  // фильтры
  const [categoryFilters, setCategoryFilters] = useState({
    all: true,
    dry: false,
    wet: false,
    filler: false,
  });
  const [catFilters, setCatFilters] = useState({
    "for-sterilized": false,
    "for-skin-and-coat-health": false,
    "for-sensitive-digestion": false,
    "for-picky": false,
    "for-indoor": false,
  });
  const [dogFilters, setDogFilters] = useState({
    "for-small-breeds": false,
    "for-medium-breeds": false,
    "for-large-breeds": false,
  });
  const [minicatFilters, setMiniCatFilters] = useState({
    "for-kittens": false,
  });
  const [minidogFilters, setMiniDogFilters] = useState({
    "for-small-breeds": false,
    "for-medium-breeds": false,
    "for-large-breeds": false,
  });
  const [countryFilters, setCountryFilters] = useState({
    spain: false,
    germany: false,
    russia: false,
    belarus: false,
    china: false,
  });
  const [flavorFilters, setFlavorFilters] = useState({
    rabbit: false,
    chicken: false,
    partridge: false,
    salmon: false,
    quail: false,
    fish: false,
    veal: false,
    duck: false,
    lamb: false,
    goose: false,
    beef: false,
  });
  const [brandFilters, setBrandFilters] = useState({
    landor: false,
    landy: false,
    "fresh-pet-profbalance": false,
    "chistye-pushistye": false,
  });
  const [scentFilters, setScentFilters] = useState({
    classic: false,
    vanilla: false,
    banana: false,
    coconut: false,
    "green-tea": false,
    rose: false,
    apple: false,
    lemon: false,
    "no-flavor": false,
    milk: false,
  });

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
      if (catFilters[key]) queryParams.append("breed_" + key, "true");
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
      if (flavorFilters[key]) queryParams.append("taste_" + key, "true");
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
    
    // producttype: filler (таблица product_types)
    if (categoryFilters.filler) queryParams.append("producttype_filler", "true");

    if (priceFrom) queryParams.append("minPrice", priceFrom);
    if (priceTo) queryParams.append("maxPrice", priceTo);
    if (searchQuery) queryParams.append("search_query", searchQuery);

    return queryParams.toString(); // БЕЗ начального "?"
  }, [categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters, priceFrom, priceTo, searchQuery]);

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
        
        return {
          cardId: `p-${productId || 'unknown'}-v-${variantId}`,
          id: variantId,
          parentId: productId,
          title: item?.displayName || "Товар",
          image: imageUrl,
          price: Number(item?.price ?? 0) || 0,
          stock: Number(item?.stock ?? 0) || 0,
        };
      });
      
      // Сохраняем в кэш
      cacheRef.set(cacheKey, {
        cards,
        timestamp: Date.now(),
      });
      
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
        (filtersState.scentFilters && Object.values(filtersState.scentFilters).some(v => v));
      
      if (hasActiveFilters) {
        // Применяем восстановленные фильтры
        const queryParams = generateQueryParams();
        const filtersUrlString = queryParams ? `?${queryParams}` : "";
        if (filtersUrlString) {
          window.history.pushState({}, "", filtersUrlString);
          fetchCards(filtersUrlString, true);
        }
      }
      setFiltersRestored(false);
    } catch (e) {
      console.warn("Failed to apply restored filters:", e);
      setFiltersRestored(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersRestored, searchQuery, priceFrom, priceTo, categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, scentFilters]);

  // первая загрузка: используем то, что уже есть в адресной строке
  useEffect(() => {
    const queryString = window.location.search || "";
    const urlParams = new URLSearchParams(queryString);
    const categoryParam = urlParams.get("category");

    // Если есть параметр category, генерируем соответствующие query параметры
    if (categoryParam) {
      const categoryQueryParams = new URLSearchParams();
      
      // Маппинг категорий на query параметры API
      // Формат параметров: "category_<slug>", "breed_<slug>", "producttype_<slug>"
      const categoryMapping = {
        cat: () => {
          // Для кошек - активируем категорию и ВСЕ подфильтры кошек
          categoryQueryParams.append("category_cat", "true");
          categoryQueryParams.append("breed_for-sterilized", "true");
          categoryQueryParams.append("breed_for-skin-and-coat-health", "true");
          categoryQueryParams.append("breed_for-sensitive-digestion", "true");
          categoryQueryParams.append("breed_for-picky", "true");
          categoryQueryParams.append("breed_for-indoor", "true");
        },
        minicat: () => {
          // Для котят - активируем категорию и подфильтр
          categoryQueryParams.append("category_minicat", "true");
          categoryQueryParams.append("breed_for-kittens", "true");
        },
        dog: () => {
          // Для собак - активируем категорию и ВСЕ подфильтры собак
          categoryQueryParams.append("category_dog", "true");
          categoryQueryParams.append("breed_for-small-breeds", "true");
          categoryQueryParams.append("breed_for-medium-breeds", "true");
          categoryQueryParams.append("breed_for-large-breeds", "true");
        },
        minidog: () => {
          // Для щенков - активируем категорию и ВСЕ подфильтры щенков
          categoryQueryParams.append("category_minidog", "true");
          categoryQueryParams.append("breed_for-small-breeds", "true");
          categoryQueryParams.append("breed_for-medium-breeds", "true");
          categoryQueryParams.append("breed_for-large-breeds", "true");
        },
        filler: () => {
          // Для наполнителей - используем producttype_filler и активируем ВСЕ запахи
          categoryQueryParams.append("producttype_filler", "true");
          categoryQueryParams.append("scent_classic", "true");
          categoryQueryParams.append("scent_vanilla", "true");
          categoryQueryParams.append("scent_banana", "true");
          categoryQueryParams.append("scent_coconut", "true");
          categoryQueryParams.append("scent_green-tea", "true");
          categoryQueryParams.append("scent_rose", "true");
          categoryQueryParams.append("scent_apple", "true");
          categoryQueryParams.append("scent_lemon", "true");
          categoryQueryParams.append("scent_no-flavor", "true");
          categoryQueryParams.append("scent_milk", "true");
        },
      };

      // Применяем соответствующий фильтр
      if (categoryMapping[categoryParam]) {
        categoryMapping[categoryParam]();
      }

      // Добавляем остальные параметры из URL (если есть)
      urlParams.forEach((value, key) => {
        if (key !== "category") {
          categoryQueryParams.append(key, value);
        }
      });

      // Устанавливаем фильтры в состояние для отображения в UI
      if (categoryParam === "cat") {
        // Активируем ВСЕ фильтры для кошек
        setCatFilters({
          "for-sterilized": true,
          "for-skin-and-coat-health": true,
          "for-sensitive-digestion": true,
          "for-picky": true,
          "for-indoor": true,
        });
      } else if (categoryParam === "minicat") {
        setMiniCatFilters({ "for-kittens": true });
      } else if (categoryParam === "dog") {
        // Активируем ВСЕ фильтры для собак
        setDogFilters({
          "for-small-breeds": true,
          "for-medium-breeds": true,
          "for-large-breeds": true,
        });
      } else if (categoryParam === "minidog") {
        // Активируем ВСЕ фильтры для щенков
        setMiniDogFilters({
          "for-small-breeds": true,
          "for-medium-breeds": true,
          "for-large-breeds": true,
        });
      } else if (categoryParam === "filler") {
        // Для наполнителей устанавливаем фильтр категории и ВСЕ запахи
        setCategoryFilters((prev) => ({
          ...prev,
          all: false,
          filler: true,
        }));
        setScentFilters({
          classic: true,
          vanilla: true,
          banana: true,
          coconut: true,
          "green-tea": true,
          rose: true,
          apple: true,
          lemon: true,
          "no-flavor": true,
          milk: true,
        });
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
  }, []);

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
    setCategoryFilters({
      all: true,
      dry: false,
      wet: false,
      filler: false,
    });
    setCatFilters({
      "for-sterilized": false,
      "for-skin-and-coat-health": false,
      "for-sensitive-digestion": false,
      "for-picky": false,
      "for-indoor": false,
    });
    setDogFilters({
      "for-small-breeds": false,
      "for-medium-breeds": false,
      "for-large-breeds": false,
    });
    setMiniCatFilters({
      "for-kittens": false,
    });
    setMiniDogFilters({
      "for-small-breeds": false,
      "for-medium-breeds": false,
      "for-large-breeds": false,
    });
    setCountryFilters({
      spain: false,
      germany: false,
      russia: false,
      belarus: false,
      china: false,
    });
    setFlavorFilters({
      rabbit: false,
      chicken: false,
      partridge: false,
      salmon: false,
      quail: false,
      fish: false,
      veal: false,
      duck: false,
      lamb: false,
      goose: false,
      beef: false,
    });
    setBrandFilters({
      landor: false,
      landy: false,
      "fresh-pet-profbalance": false,
      "chistye-pushistye": false,
    });
    setScentFilters({
      classic: false,
      vanilla: false,
      banana: false,
      coconut: false,
      "green-tea": false,
      rose: false,
      apple: false,
      lemon: false,
      "no-flavor": false,
      milk: false,
    });
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
  }, []);

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
            <FilterSection title="По категории">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={categoryFilters.all}
                    onCheckedChange={() => handleCategoryChange("all")}
                  />
                  <span className="text-sm">Все корма</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={categoryFilters.dry}
                    onCheckedChange={() => handleCategoryChange("dry")}
                  />
                  <span className="text-sm">Сухие корма</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={categoryFilters.wet}
                    onCheckedChange={() => handleCategoryChange("wet")}
                  />
                  <span className="text-sm">Влажные корма</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={categoryFilters.filler}
                    onCheckedChange={() => handleCategoryChange("filler")}
                  />
                  <span className="text-sm">Наполнитель</span>
                </label>
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

            {/* Котенок */}
            <FilterSection title="Котенок">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={minicatFilters["for-kittens"]}
                    onCheckedChange={(c) =>
                      setMiniCatFilters((prev) => ({
                        ...prev,
                        "for-kittens": c,
                      }))
                    }
                  />
                  <span className="text-sm">Для котят</span>
                </label>
              </div>
            </FilterSection>

            {/* Кошка */}
            <FilterSection title="Кошка">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={catFilters["for-sterilized"]}
                    onCheckedChange={(c) =>
                      setCatFilters((prev) => ({ ...prev, "for-sterilized": c }))
                    }
                  />
                  <span className="text-sm">Для стерилизованных</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={catFilters["for-skin-and-coat-health"]}
                    onCheckedChange={(c) =>
                      setCatFilters((prev) => ({ ...prev, "for-skin-and-coat-health": c }))
                    }
                  />
                  <span className="text-sm">
                    Для здоровья кожи и шерсти
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={catFilters["for-sensitive-digestion"]}
                    onCheckedChange={(c) =>
                      setCatFilters((prev) => ({ ...prev, "for-sensitive-digestion": c }))
                    }
                  />
                  <span className="text-sm">
                    Для чувствительного пищеварения
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={catFilters["for-picky"]}
                    onCheckedChange={(c) =>
                      setCatFilters((prev) => ({ ...prev, "for-picky": c }))
                    }
                  />
                  <span className="text-sm">Для привередливых</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={catFilters["for-indoor"]}
                    onCheckedChange={(c) =>
                      setCatFilters((prev) => ({ ...prev, "for-indoor": c }))
                    }
                  />
                  <span className="text-sm">Для домашних</span>
                </label>
              </div>
            </FilterSection>

            {/* Щенок */}
            <FilterSection title="Щенок">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={minidogFilters["for-small-breeds"]}
                    onCheckedChange={(c) =>
                      setMiniDogFilters((prev) => ({ ...prev, "for-small-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для мелких пород</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={minidogFilters["for-medium-breeds"]}
                    onCheckedChange={(c) =>
                      setMiniDogFilters((prev) => ({ ...prev, "for-medium-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для средних пород</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={minidogFilters["for-large-breeds"]}
                    onCheckedChange={(c) =>
                      setMiniDogFilters((prev) => ({ ...prev, "for-large-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для крупных пород</span>
                </label>
              </div>
            </FilterSection>

            {/* Собака */}
            <FilterSection title="Собака">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={dogFilters["for-small-breeds"]}
                    onCheckedChange={(c) =>
                      setDogFilters((prev) => ({ ...prev, "for-small-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для мелких пород</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={dogFilters["for-medium-breeds"]}
                    onCheckedChange={(c) =>
                      setDogFilters((prev) => ({ ...prev, "for-medium-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для средних пород</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={dogFilters["for-large-breeds"]}
                    onCheckedChange={(c) =>
                      setDogFilters((prev) => ({ ...prev, "for-large-breeds": c }))
                    }
                  />
                  <span className="text-sm">Для крупных пород</span>
                </label>
              </div>
            </FilterSection>

            {/* Страна */}
            <FilterSection title="Страна производства">
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={countryFilters.spain}
                    onCheckedChange={(c) =>
                      setCountryFilters((prev) => ({ ...prev, spain: c }))
                    }
                  />
                  <span className="text-sm">Испания</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={countryFilters.germany}
                    onCheckedChange={(c) =>
                      setCountryFilters((prev) => ({ ...prev, germany: c }))
                    }
                  />
                  <span className="text-sm">Германия</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={countryFilters.russia}
                    onCheckedChange={(c) =>
                      setCountryFilters((prev) => ({ ...prev, russia: c }))
                    }
                  />
                  <span className="text-sm">Россия</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={countryFilters.belarus}
                    onCheckedChange={(c) =>
                      setCountryFilters((prev) => ({ ...prev, belarus: c }))
                    }
                  />
                  <span className="text-sm">Беларусь</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Checkbox
                    checked={countryFilters.china}
                    onCheckedChange={(c) =>
                      setCountryFilters((prev) => ({ ...prev, china: c }))
                    }
                  />
                  <span className="text-sm">Китай</span>
                </label>
              </div>
            </FilterSection>

            {/* Вкус */}
            <FilterSection title="Вкус">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["rabbit", "Кролик"],
                  ["chicken", "Курица"],
                  ["partridge", "Куропатка"],
                  ["salmon", "Лосось"],
                  ["quail", "Перепелка"],
                  ["fish", "Рыба"],
                  ["veal", "Телятина"],
                  ["duck", "Утка"],
                  ["lamb", "Ягненок"],
                  ["goose", "Гусь"],
                  ["beef", "Говядина"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={flavorFilters[key]}
                      onCheckedChange={(c) =>
                        setFlavorFilters((prev) => ({ ...prev, [key]: c }))
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Запахи */}
            <FilterSection title="Запахи">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["classic", "Классический"],
                  ["vanilla", "Ванильный"],
                  ["banana", "Банановый"],
                  ["coconut", "Кокосовый"],
                  ["green-tea", "Зеленый чай"],
                  ["rose", "Аромат розы"],
                  ["apple", "Яблоко"],
                  ["lemon", "Лимон"],
                  ["no-flavor", "Без амортизатора"],
                  ["milk", "Молоко"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={scentFilters[key]}
                      onCheckedChange={(c) =>
                        setScentFilters((prev) => ({ ...prev, [key]: c }))
                      }
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </FilterSection>

            {/* Бренд */}
            <FilterSection title="Бренд">
              <div className="space-y-2">
                {[
                  ["landor", "LANDOR"],
                  ["landy", "LANDY"],
                  ["fresh-pet-profbalance", "FRESH PET PROFBALANCE"],
                  ["chistye-pushistye", "ЧИСТЫЕ ПУШИСТЫЕ"],
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={brandFilters[key]}
                      onCheckedChange={(c) =>
                        setBrandFilters((prev) => ({ ...prev, [key]: c }))
                      }
                    />
                    <span className="text-sm">{label}</span>
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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-8 mx-auto">
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
              <FilterSection title="По категории">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.all}
                      onCheckedChange={() => handleCategoryChange("all")}
                    />
                    <span className="text-sm">Все корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.dry}
                      onCheckedChange={() => handleCategoryChange("dry")}
                    />
                    <span className="text-sm">Сухие корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.wet}
                      onCheckedChange={() => handleCategoryChange("wet")}
                    />
                    <span className="text-sm">Влажные корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={categoryFilters.filler}
                      onCheckedChange={() => handleCategoryChange("filler")}
                    />
                    <span className="text-sm">Наполнитель</span>
                  </label>
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

              {/* Котенок */}
              <FilterSection title="Котенок">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={minicatFilters["for-kittens"]}
                      onCheckedChange={(c) =>
                        setMiniCatFilters((prev) => ({
                          ...prev,
                          "for-kittens": c,
                        }))
                      }
                    />
                    <span className="text-sm">Для котят</span>
                  </label>
                </div>
              </FilterSection>

              {/* Кошка */}
              <FilterSection title="Кошка">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={catFilters["for-sterilized"]}
                      onCheckedChange={(c) =>
                        setCatFilters((prev) => ({ ...prev, "for-sterilized": c }))
                      }
                    />
                    <span className="text-sm">Для стерилизованных</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={catFilters["for-skin-and-coat-health"]}
                      onCheckedChange={(c) =>
                        setCatFilters((prev) => ({ ...prev, "for-skin-and-coat-health": c }))
                      }
                    />
                    <span className="text-sm">
                      Для здоровья кожи и блеска шерсти
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={catFilters["for-sensitive-digestion"]}
                      onCheckedChange={(c) =>
                        setCatFilters((prev) => ({ ...prev, "for-sensitive-digestion": c }))
                      }
                    />
                    <span className="text-sm">
                      Для чувствительного пищеварения
                    </span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={catFilters["for-picky"]}
                      onCheckedChange={(c) =>
                        setCatFilters((prev) => ({ ...prev, "for-picky": c }))
                      }
                    />
                    <span className="text-sm">Для привередливых</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={catFilters["for-indoor"]}
                      onCheckedChange={(c) =>
                        setCatFilters((prev) => ({ ...prev, "for-indoor": c }))
                      }
                    />
                    <span className="text-sm">Для домашних</span>
                  </label>
                </div>
              </FilterSection>

              {/* Щенок */}
              <FilterSection title="Щенок">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={minidogFilters["for-small-breeds"]}
                      onCheckedChange={(c) =>
                        setMiniDogFilters((prev) => ({ ...prev, "for-small-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для мелких пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={minidogFilters["for-medium-breeds"]}
                      onCheckedChange={(c) =>
                        setMiniDogFilters((prev) => ({ ...prev, "for-medium-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для средних пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={minidogFilters["for-large-breeds"]}
                      onCheckedChange={(c) =>
                        setMiniDogFilters((prev) => ({ ...prev, "for-large-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для крупных пород</span>
                  </label>
                </div>
              </FilterSection>

              {/* Собака */}
              <FilterSection title="Собака">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={dogFilters["for-small-breeds"]}
                      onCheckedChange={(c) =>
                        setDogFilters((prev) => ({ ...prev, "for-small-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для мелких пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={dogFilters["for-medium-breeds"]}
                      onCheckedChange={(c) =>
                        setDogFilters((prev) => ({ ...prev, "for-medium-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для средних пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={dogFilters["for-large-breeds"]}
                      onCheckedChange={(c) =>
                        setDogFilters((prev) => ({ ...prev, "for-large-breeds": c }))
                      }
                    />
                    <span className="text-sm">Для крупных пород</span>
                  </label>
                </div>
              </FilterSection>

              {/* Страна */}
              <FilterSection title="Страна производства">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={countryFilters.spain}
                      onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, spain: c }))
                      }
                    />
                    <span className="text-sm">Испания</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={countryFilters.germany}
                      onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, germany: c }))
                      }
                    />
                    <span className="text-sm">Германия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={countryFilters.russia}
                      onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, russia: c }))
                      }
                    />
                    <span className="text-sm">Россия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={countryFilters.belarus}
                      onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, belarus: c }))
                      }
                    />
                    <span className="text-sm">Беларусь</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={countryFilters.china}
                      onCheckedChange={(c) =>
                        setCountryFilters((prev) => ({ ...prev, china: c }))
                      }
                    />
                    <span className="text-sm">Китай</span>
                  </label>
                </div>
              </FilterSection>

              {/* Вкус */}
              <FilterSection title="Вкус">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["rabbit", "Кролик"],
                    ["chicken", "Курица"],
                    ["partridge", "Куропатка"],
                    ["salmon", "Лосось"],
                    ["quail", "Перепелка"],
                    ["fish", "Рыба"],
                    ["veal", "Телятина"],
                    ["duck", "Утка"],
                    ["lamb", "Ягнёнок"],
                    ["goose", "Гусь"],
                    ["beef", "Говядина"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={flavorFilters[key]}
                        onCheckedChange={(c) =>
                          setFlavorFilters((prev) => ({
                            ...prev,
                            [key]: c,
                          }))
                        }
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Запахи */}
              <FilterSection title="Запахи">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["classic", "Классический"],
                    ["vanilla", "Ванильный"],
                    ["banana", "Банановый"],
                    ["coconut", "Кокосовый"],
                    ["green-tea", "Зеленый чай"],
                    ["rose", "Аромат розы"],
                    ["apple", "Яблоко"],
                    ["lemon", "Лимон"],
                    ["no-flavor", "Без амортизатора"],
                    ["milk", "Молоко"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={scentFilters[key]}
                        onCheckedChange={(c) =>
                          setScentFilters((prev) => ({ ...prev, [key]: c }))
                        }
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              {/* Бренд */}
              <FilterSection title="Бренд">
                <div className="space-y-2">
                  {[
                    ["landor", "LANDOR"],
                    ["landy", "LANDY"],
                    ["fresh-pet-profbalance", "FRESH PET PROFBALANCE"],
                    ["chistye-pushistye", "ЧИСТЫЕ ПУШИСТЫЕ"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={brandFilters[key]}
                        onCheckedChange={(c) =>
                          setBrandFilters((prev) => ({
                            ...prev,
                            [key]: c,
                          }))
                        }
                      />
                      <span className="text-sm">{label}</span>
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
                  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
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
