import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import useDebouncedValue from "@/hooks/useDebouncedValue";
import { localSearch as originalLocalSearch } from "@/utils/localSearch";
import { getAuthToken } from "@/utils/auth";

// Форматирование цены
const formatPrice = (price) => {
  if (typeof price !== "number") return "";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);
};

// Улучшенная функция поиска на основе оригинальной
const localSearch = (query, dataset, maxResults = 10) => {
  if (!query || !dataset || dataset.length === 0) return [];

  // Очищаем запрос от знаков препинания и лишних пробелов
  const cleanQuery = query
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ') // заменяем знаки препинания на пробелы
    .replace(/\s+/g, ' ') // заменяем множественные пробелы на один
    .trim();

  if (!cleanQuery) return [];

  // Создаем очищенный dataset для поиска
  const cleanedDataset = dataset.map(item => {
    // Формируем строку для поиска: название + вес
    let searchText = item.title
      ?.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() || '';
    
    // Добавляем вес в поиск
    if (item.weight) {
      let weightStr = "";
      if (typeof item.weight === "number") {
        weightStr = ` ${item.weight} кг ${item.weight % 1 === 0 ? item.weight : item.weight.toFixed(3)}`;
      } else {
        weightStr = ` ${String(item.weight).toLowerCase()}`;
      }
      searchText += weightStr;
    }
    if (item.weightLabel) {
      searchText += ` ${String(item.weightLabel).toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')}`;
    }
    
    return {
      ...item,
      cleanSearchText: searchText
    };
  });

  const results = cleanedDataset.filter(item => {
    return item.cleanSearchText.includes(cleanQuery);
  });

  // Возвращаем оригинальные объекты (без cleanSearchText)
  return results.slice(0, maxResults).map(({ cleanSearchText, ...item }) => item);
};

// Альтернативный вариант - если предыдущий не работает, используем этот:
const localSearchSimple = (query, dataset, maxResults = 5) => {
  if (!query || !dataset || dataset.length === 0) return [];

  const cleanQuery = query.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  
  if (!cleanQuery) return [];

  const results = dataset.filter(item => {
    const cleanTitle = item.title?.toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ').replace(/\s+/g, ' ').trim() || '';
    
    // Добавляем вес в поиск
    let searchText = cleanTitle;
    if (item.weight) {
      let weightStr = "";
      if (typeof item.weight === "number") {
        weightStr = ` ${item.weight} кг ${item.weight % 1 === 0 ? item.weight : item.weight.toFixed(3)}`;
      } else {
        weightStr = ` ${String(item.weight).toLowerCase()}`;
      }
      searchText += weightStr;
    }
    if (item.weightLabel) {
      searchText += ` ${String(item.weightLabel).toLowerCase().replace(/[^a-zA-Zа-яА-Я0-9\s]/g, ' ')}`;
    }
    
    return searchText.includes(cleanQuery);
  });

  return results.slice(0, maxResults);
};

// Кэш для парсинга sessionStorage
let cachedProducts = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 1000; // 1 секунда

const getAllProducts = () => {
  const now = Date.now();
  if (cachedProducts && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedProducts;
  }
  try {
    cachedProducts = JSON.parse(sessionStorage.getItem("catalog:all") || "[]");
    cacheTimestamp = now;
    return cachedProducts;
  } catch {
    cachedProducts = [];
    return [];
  }
};

// Кэш для изображений
const imageCache = new Map();

// Загрузка изображения через API
async function fetchImageUrl(productId, imageId, token) {
  if (!productId || !imageId) return "/korm1.svg";
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(imageId)}`,
      {
        headers: token && token !== "guest" ? { Authorization: `Bearer ${token}` } : {},
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

export default function GlobalSearch({
  placeholder = "Искать здесь...",
  dataset = [],
  maxItems = 5,
  className = "",
  onSelect,
}) {
  const [q, setQ] = useState("");
  const dq = useDebouncedValue(q, 200);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loadedImages, setLoadedImages] = useState(new Map());

  const ref = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dq) {
      setItems([]);
      setOpen(false);
      return;
    }

    // Используем оригинальный localSearch, который работает с полными данными товаров
    let results = [];
    if (originalLocalSearch) {
      results = originalLocalSearch(dq, dataset, maxItems);
    }
    
    // Если не нашли результатов, пробуем простой вариант
    if (results.length === 0) {
      results = localSearch(dq, dataset, maxItems);
    }

    // Если все еще нет результатов, пробуем простой вариант
    if (results.length === 0) {
      results = localSearchSimple(dq, dataset, maxItems);
    }

    setItems(results);
    setActive(0);
    setOpen(results.length > 0 || dq.length > 0);
  }, [dq, dataset, maxItems]);

  // Отдельный эффект для загрузки изображений
  useEffect(() => {
    if (items.length === 0) return;
    
    const authToken = getAuthToken();
    const newLoadedImages = new Map();
    
    items.forEach((item) => {
      const imageUrl = item.image || item.imageUrl;
      const itemId = item.id || `${item.productId || ''}-${item.variantId || ''}`;
      
      if (imageUrl && imageUrl.startsWith("/api/products/")) {
        const match = imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
        if (match) {
          const productId = match[1];
          const variantId = match[2];
          
          // Загружаем изображение только если еще не загружено
          if (!loadedImages.has(itemId)) {
            fetchImageUrl(productId, variantId, authToken).then((url) => {
              setLoadedImages((prev) => {
                const next = new Map(prev);
                next.set(itemId, url);
                return next;
              });
            });
          } else {
            // Используем уже загруженное изображение
            newLoadedImages.set(itemId, loadedImages.get(itemId));
          }
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // закрытие по клику вне
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const submit = (idx = active) => {
    const it = items[idx];
    if (!it) return;
    
    // Формируем URL для перехода
    let url = it.url;
    if (!url || url === "#") {
      if (it.productId && it.variantId) {
        url = `/product/${it.productId}?variant=${it.variantId}`;
      } else if (it.productId) {
        url = `/product/${it.productId}`;
      } else if (it.id) {
        url = `/product/${it.id}`;
      } else {
        url = "#";
      }
    }
    
    navigate(url);
    setOpen(false);
    if (onSelect) onSelect();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
              <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => (items.length > 0 || dq.length > 0) && setOpen(true)}
        placeholder={placeholder}
        className={`h-11 pl-4 pr-20 py-3 rounded-full border border-[#A9A9A9] text-sm bg-gray-50 ${className}`}
      />
      <button
        onClick={() => {
          if (items.length) submit(0);
          else navigate(`/catalog?search_query=${encodeURIComponent(q)}`);
          if (onSelect) onSelect();
        }}
        className="absolute right-0 top-0 h-11 bg-[#6F2A2B] text-white px-6 rounded-r-full hover:bg-[#5a2223] flex items-center justify-center"
      >
        <Search className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-xl shadow-lg border-[#E6E6E6] overflow-hidden">
          <ul className="max-h-[60vh] overflow-auto py-1">
            {items.length === 0 ? (
              <li className="px-3 py-2 text-center text-gray-500">
                Не найдено
              </li>
            ) : (
              items.map((it, i) => {
                // Определяем цену - приоритет price, потом из subtitle
                let price = null;
                if (typeof it.price === "number" && it.price > 0) {
                  price = it.price;
                } else if (it.subtitle) {
                  // Пытаемся извлечь цену из subtitle (например, "850 ₽")
                  const priceMatch = it.subtitle.match(/(\d+(?:[.,]\d+)?)/);
                  if (priceMatch) {
                    price = parseFloat(priceMatch[1].replace(",", "."));
                  }
                }
                
                // Получаем загруженное изображение или используем оригинальное
                const itemId = it.id || `${it.productId || ''}-${it.variantId || ''}`;
                const originalImage = it.image || it.imageUrl || "/korm1.svg";
                const loadedImage = loadedImages.get(itemId);
                // Используем загруженное изображение, если есть, иначе оригинальное (или fallback)
                const image = loadedImage || (originalImage && originalImage !== "/korm1.svg" ? originalImage : "/korm1.svg");
                
                const title = it.title || it.displayName || "Товар";
                
                // Определяем вес - приоритет weightLabel, потом weight
                let weightDisplay = "";
                if (it.weightLabel) {
                  weightDisplay = typeof it.weightLabel === "string" ? it.weightLabel : `${it.weightLabel} кг`;
                } else if (it.weight) {
                  if (typeof it.weight === "number") {
                    weightDisplay = `${it.weight % 1 === 0 ? it.weight : it.weight.toFixed(3)} кг`;
                  } else {
                    weightDisplay = it.weight;
                  }
                }
                
                // Формируем URL для перехода
                const productUrl = it.url || (it.productId && it.variantId 
                  ? `/product/${it.productId}?variant=${it.variantId}`
                  : it.productId 
                  ? `/product/${it.productId}`
                  : it.variantId
                  ? `/product/${it.variantId}`
                  : "#");
                

                return (
                  <li
                    key={it.id || i}
                    onClick={() => {
                      if (productUrl !== "#") {
                        navigate(productUrl);
                        setOpen(false);
                        if (onSelect) onSelect();
                      }
                    }}
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                      i === active ? "bg-[#FFF3E0]" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                      <img
                        src={image}
                        alt={title}
                        className="object-contain w-full h-full"
                        onError={(e) => {
                          if (e.currentTarget.src !== "/korm1.svg") {
                            e.currentTarget.src = "/korm1.svg";
                          }
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="text-xs font-medium text-[#1E1E1E] line-clamp-2 leading-tight">
                        {title}
                      </div>
                      {weightDisplay ? (
                        <div className="text-[11px] text-[#8B8B8B] mt-0.5">
                          {weightDisplay}
                        </div>
                      ) : null}
                      {price !== null && !isNaN(price) && price > 0 ? (
                        <div className="text-sm font-semibold text-[#6F2A2B] mt-0.5">
                          {formatPrice(price)}
                        </div>
                      ) : it.subtitle && !price ? (
                        <div className="text-xs text-[#8B8B8B] mt-0.5 truncate">
                          {it.subtitle}
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}