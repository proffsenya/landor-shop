// client/pages/Catalog.jsx
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import AccordionMotion from "@/utils/AccordionMotion";
import { motion } from "framer-motion";
import { ScrollFade, SlideFade, StaggerParent } from "@/utils/CatalogAnimations";

// -------- Вспомогательные блоки ----------
const FilterSection = ({ title, children, isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);

  return (
    <div className="pb-4 mb-4 border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3 font-medium text-left text-gray-900 select-none"
      >
        <span>{title}</span>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </motion.div>
      </button>

      <AccordionMotion isOpen={expanded}>
        <div className="mt-2">{children}</div>
      </AccordionMotion>
    </div>
  );
};

// ---------- Хелперы названий (фикс undefined) ----------
const getProductName = (p) =>
  p?.name ??
  p?.title ??
  p?.productName ??
  p?.display_name ??
  p?.displayName ??
  "Товар";

const normalizeWeight = (w) => {
  if (typeof w === "string") {
    const n = Number.parseFloat(w.replace(",", "."));
    return Number.isFinite(n) ? n : null;
  }
  return Number.isFinite(w) ? w : null;
};

const weightLabel = (w) => {
  const n = normalizeWeight(w);
  if (n == null) return "";
  return ` • ${n % 1 === 0 ? `${n} кг` : `${n.toFixed(3)} кг`}`;
};

const getVariantDisplayName = (_, v) => {
  return v?.display_name ?? v?.displayName ?? v?.name ?? "Товар";
};

// ---------- Получение первой картинки из разных структур ----------
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

// ---------- Преобразование продукта в карточки (каждый вариант — отдельная карточка) ----------
// ---------- Преобразование продукта в карточки (каждый вариант — отдельная карточка) ----------
const expandProductToCards = (product) => {
  const firstImage = getFirstImage(product);

  if (Array.isArray(product?.variants) && product.variants.length > 0) {
    return product.variants.map((v, idx) => {
      const price = Number(v?.price ?? 0);
      const variantId = v?.id ?? v?.sku ?? `${product.id ?? product.slug}-v${idx}`;
      const imageUrl = typeof v?.imageUrl === "string" && v.imageUrl.length > 0 ? v.imageUrl : firstImage;
      const stock = Number(v?.stock ?? 0); // <-- важно

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
  const pid = product?.id ?? product?.slug ?? Math.random().toString(36).slice(2);
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

  // фильтры
  const [categoryFilters, setCategoryFilters] = useState({
    all: true,
    dry: false,
    wet: false,
    litter: false,
    goodies: false,
  });
  const [catFilters, setCatFilters] = useState({
    sterilized: false,
    skin: false,
    digestion: false,
    picky: false,
    indoor: false,
  });
  const [dogFilters, setDogFilters] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const [minicatFilters, setMiniCatFilters] = useState({
    sterilized: false,
    skin: false,
    digestion: false,
    picky: false,
    indoor: false,
  });
  const [minidogFilters, setMiniDogFilters] = useState({
    small: false,
    medium: false,
    large: false,
  });
  const [countryFilters, setCountryFilters] = useState({
    spain: false,
    germany: false,
    russia: false,
    belarus: false,
    china: false,
  });
  const [tasteFilters, setTasteFilters] = useState({
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
    fresh: false,
    clean: false,
  });

  // пагинация
  const ITEMS_PER_PAGE = 12;
  const [page, setPage] = useState(1);

  // ---------- API: загрузка карточек ----------
  const fetchCards = async (searchParams = "") => {
    setLoading(true);
    setError("");
    try {
      // Если у тебя список по /api/products — поменяй тут на '/api/products'
      const url = searchParams ? `/api/products/cards?${searchParams}` : `/api/products/cards`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json(); // ожидается массив продуктов (каждый с variants)
      const cards = Array.isArray(data) ? data.flatMap(expandProductToCards) : [];
      setProducts(cards);
      setPage(1);
    } catch (e) {
      setProducts([]);
      setPage(1);
      setError(e?.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  // первая загрузка (учтём query из адресной строки)
  useEffect(() => {
    fetchCards(window.location.search?.replace(/^\?/, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // фильтрация на клиенте по поиску/цене
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

  const goto = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const handleCategoryChange = (category) => {
    if (category === "all") {
      setCategoryFilters({ all: true, dry: false, wet: false, litter: false, goodies: false });
    } else {
      setCategoryFilters((prev) => ({ ...prev, all: false, [category]: !prev[category] }));
    }
  };

  // ---------- Query params генерация ----------
  const generateQueryParams = () => {
    const queryParams = new URLSearchParams();

    Object.keys(categoryFilters).forEach((key) => {
      if (categoryFilters[key]) queryParams.append("category_" + key, "true");
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
    Object.keys(tasteFilters).forEach((key) => {
      if (tasteFilters[key]) queryParams.append("taste_" + key, "true");
    });
    Object.keys(brandFilters).forEach((key) => {
      if (brandFilters[key]) queryParams.append("brand_" + key, "true");
    });

    if (priceFrom) queryParams.append("price_from", priceFrom);
    if (priceTo) queryParams.append("price_to", priceTo);
    if (searchQuery) queryParams.append("search_query", searchQuery);

    return queryParams.toString();
  };

  const handleApplyFilters = () => {
    const queryParams = generateQueryParams();
    window.history.pushState({}, "", "?" + queryParams);
    fetchCards(queryParams);
  };

  const handleResetFilters = () => {
    setCategoryFilters({
      all: true,
      dry: false,
      wet: false,
      litter: false,
      goodies: false,
    });
    setCatFilters({
      sterilized: false,
      skin: false,
      digestion: false,
      picky: false,
      indoor: false,
    });
    setDogFilters({
      small: false,
      medium: false,
      large: false,
    });
    setMiniCatFilters({
      sterilized: false,
      skin: false,
      digestion: false,
      picky: false,
      indoor: false,
    });
    setMiniDogFilters({
      small: false,
      medium: false,
      large: false,
    });
    setCountryFilters({
      spain: false,
      germany: false,
      russia: false,
      belarus: false,
      china: false,
    });
    setTasteFilters({
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
      fresh: false,
      clean: false,
    });
    setPriceFrom("");
    setPriceTo("");
    setSearchQuery("");

    window.history.pushState({}, "", window.location.pathname);
    fetchCards("");
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Левая колонка — фильтры */}
          <SlideFade direction="left" distance={36} delay={0.05} className="lg:col-span-1">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Фильтры</h2>

              <FilterSection title="По категории">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={categoryFilters.all} onCheckedChange={() => handleCategoryChange("all")} />
                    <span className="text-sm">Все корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={categoryFilters.dry} onCheckedChange={() => handleCategoryChange("dry")} />
                    <span className="text-sm">Сухие корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={categoryFilters.wet} onCheckedChange={() => handleCategoryChange("wet")} />
                    <span className="textсм">Влажные корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={categoryFilters.litter} onCheckedChange={() => handleCategoryChange("litter")} />
                    <span className="text-sm">Наполнители</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={categoryFilters.goodies} onCheckedChange={() => handleCategoryChange("goodies")} />
                    <span className="text-sm">Лакомства</span>
                  </label>
                </div>
              </FilterSection>

              <FilterSection title="По стоимости">
                <div className="flex space-x-2">
                  <Input placeholder="от" value={priceFrom} onChange={(e) => setPriceFrom(e.target.value)} className="flex-1" />
                  <Input placeholder="до" value={priceTo} onChange={(e) => setPriceTo(e.target.value)} className="flex-1" />
                </div>
              </FilterSection>

              {/* Котенок */}
              <FilterSection title="Котенок">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minicatFilters.sterilized} onCheckedChange={(c) => setMiniCatFilters(prev => ({ ...prev, sterilized: c }))} />
                    <span className="text-sm">Для стерилизованных</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minicatFilters.skin} onCheckedChange={(c) => setMiniCatFilters(prev => ({ ...prev, skin: c }))} />
                    <span className="text-sm">Для здоровья кожи и блеска шерсти</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minicatFilters.digestion} onCheckedChange={(c) => setMiniCatFilters(prev => ({ ...prev, digestion: c }))} />
                    <span className="text-sm">Для чувствительного пищеварения</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minicatFilters.picky} onCheckedChange={(c) => setMiniCatFilters(prev => ({ ...prev, picky: c }))} />
                    <span className="text-sm">Для привередливых</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minicatFilters.indoor} onCheckedChange={(c) => setMiniCatFilters(prev => ({ ...prev, indoor: c }))} />
                    <span className="text-sm">Для домашних</span>
                  </label>
                </div>
              </FilterSection>

              {/* Кошка */}
              <FilterSection title="Кошка">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={catFilters.sterilized} onCheckedChange={(c) => setCatFilters(prev => ({ ...prev, sterilized: c }))} />
                    <span className="text-sm">Для стерилизованных</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={catFilters.skin} onCheckedChange={(c) => setCatFilters(prev => ({ ...prev, skin: c }))} />
                    <span className="text-sm">Для здоровья кожи и блеска шерсти</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={catFilters.digestion} onCheckedChange={(c) => setCatFilters(prev => ({ ...prev, digestion: c }))} />
                    <span className="text-sm">Для чувствительного пищеварения</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={catFilters.picky} onCheckedChange={(c) => setCatFilters(prev => ({ ...prev, picky: c }))} />
                    <span className="text-sm">Для привередливых</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={catFilters.indoor} onCheckedChange={(c) => setCatFilters(prev => ({ ...prev, indoor: c }))} />
                    <span className="text-sm">Для домашних</span>
                  </label>
                </div>
              </FilterSection>

              {/* Щенок */}
              <FilterSection title="Щенок">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minidogFilters.small} onCheckedChange={(c) => setMiniDogFilters(prev => ({ ...prev, small: c }))} />
                    <span className="text-sm">Для мелких пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minidogFilters.medium} onCheckedChange={(c) => setMiniDogFilters(prev => ({ ...prev, medium: c }))} />
                    <span className="text-sm">Для средних пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={minidogFilters.large} onCheckedChange={(c) => setMiniDogFilters(prev => ({ ...prev, large: c }))} />
                    <span className="text-sm">Для крупных пород</span>
                  </label>
                </div>
              </FilterSection>

              {/* Собака */}
              <FilterSection title="Собака">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={dogFilters.small} onCheckedChange={(c) => setDogFilters(prev => ({ ...prev, small: c }))} />
                    <span className="text-sm">Для мелких пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={dogFilters.medium} onCheckedChange={(c) => setDogFilters(prev => ({ ...prev, medium: c }))} />
                    <span className="text-sm">Для средних пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={dogFilters.large} onCheckedChange={(c) => setDogFilters(prev => ({ ...prev, large: c }))} />
                    <span className="text-sm">Для крупных пород</span>
                  </label>
                </div>
              </FilterSection>

              {/* Страна производства */}
              <FilterSection title="Страна производства">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={countryFilters.spain} onCheckedChange={(c) => setCountryFilters(prev => ({ ...prev, spain: c }))} />
                    <span className="text-sm">Испания</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={countryFilters.germany} onCheckedChange={(c) => setCountryFilters(prev => ({ ...prev, germany: c }))} />
                    <span className="text-sm">Германия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={countryFilters.russia} onCheckedChange={(c) => setCountryFilters(prev => ({ ...prev, russia: c }))} />
                    <span className="text-sm">Россия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={countryFilters.belarus} onCheckedChange={(c) => setCountryFilters(prev => ({ ...prev, belarus: c }))} />
                    <span className="text-sm">Беларусь</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox checked={countryFilters.china} onCheckedChange={(c) => setCountryFilters(prev => ({ ...prev, china: c }))} />
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
                        checked={tasteFilters[key]}
                        onCheckedChange={(c) => setTasteFilters(prev => ({ ...prev, [key]: c }))}
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
                    ["fresh", "FRESH PET PROFBALANCE"],
                    ["clean", "ЧИСТЫЕ ПУШИСТЫЕ"],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2">
                      <Checkbox
                        checked={brandFilters[key]}
                        onCheckedChange={(c) => setBrandFilters(prev => ({ ...prev, [key]: c }))}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </FilterSection>

              <Button onClick={handleApplyFilters} className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6">
                Применить
              </Button>
              <Button onClick={handleResetFilters} className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-3">
                Сбросить фильтры
              </Button>
            </div>
          </SlideFade>

          {/* Правая колонка — товары */}
          <div className="lg:col-span-3">
            <ScrollFade>
              <div className="mb-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">Каталог</h1>
              </div>
            </ScrollFade>

            {loading && <div className="py-12 text-center text-gray-500">Загрузка…</div>}
            {!loading && error && <div className="py-12 text-center text-red-600">Ошибка: {error}</div>}
            {!loading && !error && products.length === 0 && (
              <div className="py-12 text-center text-gray-500">Нет товаров</div>
            )}

            {!loading && !error && products.length > 0 && (
              <>
                <StaggerParent delayChildren={0.05} stagger={0.05} key={page}>
                  <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {paged.map((product) => {
                      const isVariantCard = !!product.parentId && product.parentId !== product.id;
                      const to = isVariantCard
                        ? `/product/${encodeURIComponent(product.parentId)}?variant=${encodeURIComponent(product.id)}`
                        : `/product/${encodeURIComponent(product.id)}`;

                      return (
                        <ProductCard
                          key={product.cardId}
                          to={to}
                          productId={isVariantCard ? product.parentId : product.id}  // ✅ основной продукт
                          variantId={isVariantCard ? product.id : product.defaultVariantId || product.id } // ✅ сюда передаём id варианта
                          image={product.image}
                          title={product.title ?? product.name ?? "Товар"}
                          price={`${Number(product.price ?? 0).toLocaleString()} ₽`}
                          stock={product.stock}
                        />
                      );
                    })}
                  </div>

                </StaggerParent>

                <SlideFade direction="up" distance={20}>
                  <div className="flex items-center justify-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => goto(page - 1)} disabled={page === 1}>
                      &lt;
                    </Button>

                    <span className="text-sm font-medium text-gray-700">{String(page).padStart(2, "0")}</span>

                    {/* используем totalPages */}
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
                    Показано {paged.length} из {filtered.length} товаров · Страница {page} из {totalPages}
                  </div>
                </SlideFade>
              </>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
