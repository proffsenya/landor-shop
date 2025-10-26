import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp, Heart, Search } from "lucide-react";

// Моковые данные товаров
const mockProducts = [
  {
    id: 1,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 2,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: true
  },
  {
    id: 3,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 4,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 5,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 6,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 7,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 8,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 9,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 10,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 11,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  },
  {
    id: 12,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    image: "/korm1.svg",
    isFavorite: false
  }
];

// Компонент фильтра
const FilterSection = ({ title, children, isExpanded = true }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  return (
    <div className="pb-4 mb-4 border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full mb-3 font-medium text-left text-gray-900"
      >
        <span>{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && children}
    </div>
  );
};

// Компонент карточки товара
const ProductCard = ({ product, onToggleFavorite }) => {
  return (
    <Card className="transition-shadow group hover:shadow-lg">
      <CardContent className="p-4">
        <div className="relative">
          <button
            onClick={() => onToggleFavorite(product.id)}
            className="absolute z-10 p-1 transition-colors rounded-full top-2 right-2 bg-white/80 hover:bg-white"
          >
            <Heart 
              className={`w-5 h-5 ${
                product.isFavorite 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`} 
            />
          </button>
          
          <div className="mb-3 overflow-hidden bg-gray-100 rounded-lg aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </div>
          
          <h3 className="mb-2 text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">
              {product.price.toLocaleString()} Р
            </span>
            <Button 
              size="sm" 
              className="bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
            >
              В корзину
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Catalog() {
  const [products, setProducts] = useState(mockProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  
  // Состояния фильтров
  const [categoryFilters, setCategoryFilters] = useState({
    all: true,
    dry: false,
    wet: false,
    litter: false
  });
  
  const [catFilters, setCatFilters] = useState({
    sterilized: false,
    skin: false,
    digestion: false,
    picky: false,
    indoor: false
  });
  
  const [dogFilters, setDogFilters] = useState({
    small: false,
    medium: false,
    large: false
  });
  
  const [countryFilters, setCountryFilters] = useState({
    spain: false,
    germany: false,
    russia: false,
    belarus: false
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
    lamb: false
  });
  
  const [brandFilters, setBrandFilters] = useState({
    landor: false,
    landy: false,
    fresh: false,
    clean: false
  });

  const toggleFavorite = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isFavorite: !product.isFavorite }
        : product
    ));
  };

  const handleCategoryChange = (category) => {
    if (category === 'all') {
      setCategoryFilters({
        all: true,
        dry: false,
        wet: false,
        litter: false
      });
    } else {
      setCategoryFilters(prev => ({
        ...prev,
        all: false,
        [category]: !prev[category]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container px-4 py-8 mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Левая колонка - Фильтры */}
          <div className="lg:col-span-1">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">Фильтры</h2>
              
              {/* По категории */}
              <FilterSection title="По категории">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={categoryFilters.all}
                      onCheckedChange={() => handleCategoryChange('all')}
                    />
                    <span className="text-sm">Все корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={categoryFilters.dry}
                      onCheckedChange={() => handleCategoryChange('dry')}
                    />
                    <span className="text-sm">Сухие корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={categoryFilters.wet}
                      onCheckedChange={() => handleCategoryChange('wet')}
                    />
                    <span className="text-sm">Влажные корма</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={categoryFilters.litter}
                      onCheckedChange={() => handleCategoryChange('litter')}
                    />
                    <span className="text-sm">Наполнители</span>
                  </label>
                </div>
              </FilterSection>

              {/* По стоимости */}
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
              <FilterSection title="Котенок" isExpanded={false}>
                <div className="space-y-2">
                  {/* Здесь будут чекбоксы для котят */}
                </div>
              </FilterSection>

              {/* Кошка */}
              <FilterSection title="Кошка">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={catFilters.sterilized}
                      onCheckedChange={(checked) => setCatFilters(prev => ({...prev, sterilized: checked}))}
                    />
                    <span className="text-sm">Для стерилизованных</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={catFilters.skin}
                      onCheckedChange={(checked) => setCatFilters(prev => ({...prev, skin: checked}))}
                    />
                    <span className="text-sm">Для здоровья кожи и блеска шерсти</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={catFilters.digestion}
                      onCheckedChange={(checked) => setCatFilters(prev => ({...prev, digestion: checked}))}
                    />
                    <span className="text-sm">Для чувствительного пищеварения</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={catFilters.picky}
                      onCheckedChange={(checked) => setCatFilters(prev => ({...prev, picky: checked}))}
                    />
                    <span className="text-sm">Для привередливых</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={catFilters.indoor}
                      onCheckedChange={(checked) => setCatFilters(prev => ({...prev, indoor: checked}))}
                    />
                    <span className="text-sm">Для домашних</span>
                  </label>
                </div>
              </FilterSection>

              {/* Щенок */}
              <FilterSection title="Щенок" isExpanded={false}>
                <div className="space-y-2">
                  {/* Здесь будут чекбоксы для щенков */}
                </div>
              </FilterSection>

              {/* Собака */}
              <FilterSection title="Собака">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={dogFilters.small}
                      onCheckedChange={(checked) => setDogFilters(prev => ({...prev, small: checked}))}
                    />
                    <span className="text-sm">Для мелких пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={dogFilters.medium}
                      onCheckedChange={(checked) => setDogFilters(prev => ({...prev, medium: checked}))}
                    />
                    <span className="text-sm">Для средних пород</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={dogFilters.large}
                      onCheckedChange={(checked) => setDogFilters(prev => ({...prev, large: checked}))}
                    />
                    <span className="text-sm">Для крупных пород</span>
                  </label>
                </div>
              </FilterSection>

              {/* Страна производства */}
              <FilterSection title="Страна производства">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={countryFilters.spain}
                      onCheckedChange={(checked) => setCountryFilters(prev => ({...prev, spain: checked}))}
                    />
                    <span className="text-sm">Испания</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={countryFilters.germany}
                      onCheckedChange={(checked) => setCountryFilters(prev => ({...prev, germany: checked}))}
                    />
                    <span className="text-sm">Германия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={countryFilters.russia}
                      onCheckedChange={(checked) => setCountryFilters(prev => ({...prev, russia: checked}))}
                    />
                    <span className="text-sm">Россия</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={countryFilters.belarus}
                      onCheckedChange={(checked) => setCountryFilters(prev => ({...prev, belarus: checked}))}
                    />
                    <span className="text-sm">Беларусь</span>
                  </label>
                </div>
              </FilterSection>

              {/* Вкус */}
              <FilterSection title="Вкус">
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.rabbit}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, rabbit: checked}))}
                    />
                    <span className="text-sm">Кролик</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.chicken}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, chicken: checked}))}
                    />
                    <span className="text-sm">Курица</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.partridge}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, partridge: checked}))}
                    />
                    <span className="text-sm">Куропатка</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.salmon}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, salmon: checked}))}
                    />
                    <span className="text-sm">Лосось</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.quail}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, quail: checked}))}
                    />
                    <span className="text-sm">Перепелка</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.fish}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, fish: checked}))}
                    />
                    <span className="text-sm">Рыба</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.veal}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, veal: checked}))}
                    />
                    <span className="text-sm">Телятина</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.duck}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, duck: checked}))}
                    />
                    <span className="text-sm">Утка</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={tasteFilters.lamb}
                      onCheckedChange={(checked) => setTasteFilters(prev => ({...prev, lamb: checked}))}
                    />
                    <span className="text-sm">Ягненок</span>
                  </label>
                </div>
              </FilterSection>

              {/* Бренд */}
              <FilterSection title="Бренд">
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={brandFilters.landor}
                      onCheckedChange={(checked) => setBrandFilters(prev => ({...prev, landor: checked}))}
                    />
                    <span className="text-sm">LANDOR</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={brandFilters.landy}
                      onCheckedChange={(checked) => setBrandFilters(prev => ({...prev, landy: checked}))}
                    />
                    <span className="text-sm">LANDY</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={brandFilters.fresh}
                      onCheckedChange={(checked) => setBrandFilters(prev => ({...prev, fresh: checked}))}
                    />
                    <span className="text-sm">FRESH PET PROFBALANCE</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <Checkbox 
                      checked={brandFilters.clean}
                      onCheckedChange={(checked) => setBrandFilters(prev => ({...prev, clean: checked}))}
                    />
                    <span className="text-sm">ЧИСТЫЕ ПУШИСТЫЕ</span>
                  </label>
                </div>
              </FilterSection>

              <Button 
                className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6"
              >
                Применить
              </Button>
            </div>
          </div>

          {/* Правая колонка - Товары */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="mb-4 text-2xl font-bold text-gray-900">Каталог</h1>
              
              {/* Поиск */}
              <div className="flex mb-6 space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                  <Input
                    placeholder="Искать здесь..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Search className="w-4 h-4 mr-2" />
                  Поиск
                </Button>
              </div>
            </div>

            {/* Сетка товаров */}
            <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>

            {/* Пагинация */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  &lt;
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-[hsl(var(--landor-primary))] text-white border-[hsl(var(--landor-primary))]"
                >
                  02
                </Button>
                <Button variant="outline" size="sm">
                  &gt;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
