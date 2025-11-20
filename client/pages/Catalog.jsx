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
import { PageFade } from "@/utils/PageAnimations";

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

// ---------- Получение первой картинки ----------
const getFirstImage = (product) => {
  const images =
    (Array.isArray(product?.images) && product.images) ||
    (Array.isArray(product?.productImageDTOs) && product.productImageDTOs) ||
    [];

  const first =
    images.find((img) => {
      if (typeof img === "string") return true;
      return img?.url || img?.path || img?.src;
    }) || null;

  if (!first) return "/korm1.svg";
  if (typeof first === "string") return first;
  return first.url || first.path || first.src || "/korm1.svg";
};

// ---------- Преобразование продукта в карточки ----------
const expandProductToCards = (product) => {
  const firstImage = getFirstImage(product);

  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.map((v, idx) => {
      const price = Number(v?.price ?? 0);
      const variantId =
        v?.id ?? v?.sku ?? `${product.id ?? product.slug}-v${idx}`;
      const imageUrl =
        typeof v?.imageUrl === "string" && v.imageUrl.length > 0
          ? v.imageUrl
          : firstImage;
      const stock = Number(v?.stock ?? 0);

      return {
        cardId: `p-${product.id ?? product.slug}-v-${variantId}`,
        id: variantId,
        parentId: product?.id ?? product?.slug ?? null,
        title: getVariantDisplayName(product, v),
        image: imageUrl,
        price: Number.isFinite(price) ? price : 0,
        stock: Number.isFinite(stock) ? stock : 0,
      };
    });
  }

  // Без variants -> одна карточка
  const price = Number(product?.price ?? 0);
  const pid =
    product?.id ?? product?.slug ?? Math.random().toString(36).slice(2);
  const stock = Number(product?.stock ?? 0);

  return [
    {
      cardId: `p-${pid}`,
      id: pid,
      parentId: pid,
      title: getProductName(product),
      image: firstImage,
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
    forKittens: false,
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

  // пагинация
  const ITEMS_PER_PAGE = 12;
  const [page, setPage] = useState(1);

  // ---------- Генерация query-строки для фильтров ----------
  const generateQueryParams = useCallback(() => {
    const queryParams = new URLSearchParams();

    Object.keys(categoryFilters).forEach((key) => {
      if (key !== "all" && categoryFilters[key]) {
        queryParams.append("category_" + key, "true");
      }
    });
    Object.keys(catFilters).forEach((key) => {
      if (catFilters[key]) queryParams.append("cat_" + key, "true");
    });
    Object.keys(dogFilters).forEach((key) => {
      if (dogFilters[key]) queryParams.append("dog_" + key, "true");
    });
    Object.keys(minicatFilters).forEach((key) => {
      if (minicatFilters[key]) queryParams.append("minicat_" + key, "true");
    });
    Object.keys(minidogFilters).forEach((key) => {
      if (minidogFilters[key]) queryParams.append("minidog_" + key, "true");
    });
    Object.keys(countryFilters).forEach((key) => {
      if (countryFilters[key]) queryParams.append("country_" + key, "true");
    });
    Object.keys(flavorFilters).forEach((key) => {
      if (flavorFilters[key]) queryParams.append("flavor_" + key, "true");
    });
    Object.keys(brandFilters).forEach((key) => {
      if (brandFilters[key]) queryParams.append("brand_" + key, "true");
    });

    if (priceFrom) queryParams.append("price_from", priceFrom);
    if (priceTo) queryParams.append("price_to", priceTo);
    if (searchQuery) queryParams.append("search_query", searchQuery);

    return queryParams.toString(); // БЕЗ начального "?"
  }, [categoryFilters, catFilters, dogFilters, minicatFilters, minidogFilters, countryFilters, flavorFilters, brandFilters, priceFrom, priceTo, searchQuery]);

  // ---------- API: /api/products/cards/search-by-url?filtersUrl=<строка> ----------
  const fetchCards = async (filtersUrlString = "") => {
    setLoading(true);
    setError("");

    try {
      // filtersUrlString ожидается в формате "?category_dry=true&brand_landy=true"
      const filtersUrlValue =
        filtersUrlString || window.location.search || ""; // может быть "" либо "?..."

      const url = `/api/products/cards/search-by-url?filtersUrl=${encodeURIComponent(
        filtersUrlValue
      )}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const cards = Array.isArray(data)
        ? data.flatMap(expandProductToCards)
        : [];
      setProducts(cards);
      setPage(1);
      
      // Сохраняем исходные данные продуктов для поиска (не развернутые карточки)
      if (Array.isArray(data) && data.length > 0) {
        sessionStorage.setItem("catalog:all", JSON.stringify(data));
      }
    } catch (e) {
      setProducts([]);
      setPage(1);
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  // первая загрузка: используем то, что уже есть в адресной строке
  useEffect(() => {
    const queryString = window.location.search || "";
    fetchCards(queryString);
    // сохраняем query параметры в sessionStorage при загрузке
    if (queryString) {
      sessionStorage.setItem("catalog:lastQuery", queryString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // клиентская фильтрация по поиску/цене (можно оставить)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = priceFrom ? Number(priceFrom) : null;
    const to = priceTo ? Number(priceTo) : null;

    return products.filter((p) => {
      const title = (p.title ?? p.name ?? "").toString().toLowerCase();
      const price = Number(p.price ?? 0);
      const byQuery = q ? title.includes(q) : true;
      const byFrom = from !== null ? price >= from : true;
      const byTo = to !== null ? price <= to : true;
      return byQuery && byFrom && byTo;
    });
  }, [products, searchQuery, priceFrom, priceTo]);

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
    const queryParams = generateQueryParams(); // "category_dry=true&brand_landy=true"
    const filtersUrlString = queryParams ? `?${queryParams}` : "";

    // обновляем URL страницы
    window.history.pushState({}, "", filtersUrlString || window.location.pathname);

    // сохраняем query параметры в sessionStorage для использования при возврате из страницы товара
    sessionStorage.setItem("catalog:lastQuery", filtersUrlString);

    // отправляем в бэк именно эту строку
    fetchCards(filtersUrlString);
    setMobileFiltersOpen(false);
    // Прокручиваем вверх при применении фильтров
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [generateQueryParams]);

  const handleResetFilters = useCallback(() => {
    setCategoryFilters({
      all: true,
      dry: false,
      wet: false,
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
      forKittens: false,
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
    setPriceFrom("");
    setPriceTo("");
    setSearchQuery("");

    // чистим URL
    window.history.pushState({}, "", window.location.pathname);

    // отправляем пустую строку в filtersUrl
    fetchCards("");
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
                    checked={minicatFilters.forKittens}
                    onCheckedChange={(c) =>
                      setMiniCatFilters((prev) => ({
                        ...prev,
                        forKittens: c,
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
                      checked={minicatFilters.forKittens}
                      onCheckedChange={(c) =>
                        setMiniCatFilters((prev) => ({
                          ...prev,
                          forKittens: c,
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
                    ["lamb", "Ягненок"],
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
                      const isVariantCard =
                        !!product.parentId && product.parentId !== product.id;
                      const to = isVariantCard
                        ? `/product/${encodeURIComponent(
                            product.parentId
                          )}?variant=${encodeURIComponent(product.id)}`
                        : `/product/${encodeURIComponent(product.id)}`;

                      return (
                        <ProductCard
                          key={product.cardId}
                          to={to}
                          productId={
                            isVariantCard ? product.parentId : product.id
                          }
                          variantId={
                            isVariantCard
                              ? product.id
                              : product.defaultVariantId || product.id
                          }
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
