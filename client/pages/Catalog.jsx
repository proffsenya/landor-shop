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
import {
  ScrollFade,
  SlideFade,
  StaggerParent,
  StaggerItem,
  HoverLift,
} from "@/utils/CatalogAnimations";

// -------- Mock data ----------
const mockProducts = [
  { id: 1, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 1, image: "/korm1.svg", isFavorite: false },
  { id: 2, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 2, image: "/korm1.svg", isFavorite: true },
  { id: 3, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 3, image: "/korm1.svg", isFavorite: false },
  { id: 4, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 4, image: "/korm1.svg", isFavorite: false },
  { id: 5, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 5, image: "/korm1.svg", isFavorite: false },
  { id: 6, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 6, image: "/korm1.svg", isFavorite: false },
  { id: 7, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 7, image: "/korm1.svg", isFavorite: false },
  { id: 8, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 8, image: "/korm1.svg", isFavorite: false },
  { id: 9, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 9, image: "/korm1.svg", isFavorite: false },
  { id: 10, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 10, image: "/korm1.svg", isFavorite: false },
  { id: 11, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 11, image: "/korm1.svg", isFavorite: false },
  { id: 12, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 12, image: "/korm1.svg", isFavorite: false },
  { id: 13, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 13, image: "/korm1.svg", isFavorite: false },
  { id: 14, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 14, image: "/korm1.svg", isFavorite: true },
  { id: 15, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 15, image: "/korm1.svg", isFavorite: false },
  { id: 16, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 16, image: "/korm1.svg", isFavorite: false },
  { id: 17, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 17, image: "/korm1.svg", isFavorite: false },
  { id: 18, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 18, image: "/korm1.svg", isFavorite: false },
  { id: 19, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 19, image: "/korm1.svg", isFavorite: false },
  { id: 20, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 20, image: "/korm1.svg", isFavorite: false },
  { id: 21, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 21, image: "/korm1.svg", isFavorite: false },
  { id: 22, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 22, image: "/korm1.svg", isFavorite: false },
  { id: 23, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 23, image: "/korm1.svg", isFavorite: false },
  { id: 24, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 24, image: "/korm1.svg", isFavorite: false },
  { id: 25, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 25, image: "/korm1.svg", isFavorite: false },
  { id: 26, name: "LANDOR полнорационный сухой корм для взрослых собак всех пород", price: 26, image: "/korm1.svg", isFavorite: true },
];

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

      {/* Оборачиваем контент в плавный контейнер */}
      <AccordionMotion isOpen={expanded}>
        <div className="mt-2">{children}</div>
      </AccordionMotion>
    </div>
  );
};

export default function Catalog() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");

  // фильтры (как были)
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

  // ----- ПАГИНАЦИЯ -----
  const ITEMS_PER_PAGE = 12; // Сколько карточек показывать на странице
  const [page, setPage] = useState(1);

  // Базовый фильтр по поиску и цене (чтобы пагинация работала по отфильтрованному списку)
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = priceFrom ? Number(priceFrom) : null;
    const to = priceTo ? Number(priceTo) : null;

    return products.filter((p) => {
      const byQuery = q ? p.name.toLowerCase().includes(q) : true;
      const byFrom = from !== null ? p.price >= from : true;
      const byTo = to !== null ? p.price <= to : true;
      return byQuery && byFrom && byTo;
    });
  }, [products, searchQuery, priceFrom, priceTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  // Корректируем текущую страницу, если меняется число товаров/фильтры
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, page]);

  const goto = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const toggleFavorite = (productId) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product
      )
    );
  };

  const handleCategoryChange = (category) => {
    if (category === "all") {
      setCategoryFilters({ all: true, dry: false, wet: false, litter: false });
    } else {
      setCategoryFilters((prev) => ({ ...prev, all: false, [category]: !prev[category] }));
    }
  };

  // Функция для формирования строки query параметров
  const generateQueryParams = () => {
    const queryParams = new URLSearchParams();

    // Добавление фильтров в query параметры
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

    // Добавление параметров цены
    if (priceFrom) queryParams.append("price_from", priceFrom);
    if (priceTo) queryParams.append("price_to", priceTo);

    // Добавление поискового запроса
    if (searchQuery) queryParams.append("search_query", searchQuery);

    return queryParams.toString();
  };

  const handleApplyFilters = () => {
    const queryParams = generateQueryParams();
    // Обновляем URL с новыми query параметрами
    window.history.pushState({}, "", "?" + queryParams);
    console.log("Applied filters:", queryParams);
    // Можно отправить queryParams на сервер для запроса данных
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
    // Сброс цены и поиска
    setPriceFrom("");
    setPriceTo("");
    setSearchQuery("");
    // Сброс URL
    window.history.pushState({}, "", window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Левая колонка — фильтры (выезд слева) */}
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
                    <span className="text-sm">Влажные корма</span>
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

              {/* Остальные фильтры */}
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

              {/* Кнопка Применить и Сбросить */}
              <Button onClick={handleApplyFilters} className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6">
                Применить
              </Button>
              <Button onClick={handleResetFilters} className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6">
                Сбросить фильтры
              </Button>
            </div>
          </SlideFade>

          {/* Правая колонка — товары */}
          <div className="lg:col-span-3">
            {/* Заголовок блока */}
            <ScrollFade>
              <div className="mb-6">
                <h1 className="mb-4 text-2xl font-bold text-gray-900">Каталог</h1>
              </div>
            </ScrollFade>

            {/* Сетка карточек с поочередным появлением + hover-lift */}
            <StaggerParent delayChildren={0.05} stagger={0.05}>
              <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((product) => (
                  <ProductCard
                    key={product.id}
                    image={product.image}
                    title={product.name}
                    price={`${product.price.toLocaleString()} ₽`}
                  />
                ))}
              </div>
            </StaggerParent>

            {/* Пагинация + инфо — мягкий подъём */}
            <SlideFade direction="up" distance={20}>
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
                Показано {paged.length} из {filtered.length} товаров · Страница {page} из {totalPages}
              </div>
            </SlideFade>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
