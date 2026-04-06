// components/catalog/FiltersDesktop.jsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterSection } from "./FilterSection";

export const FiltersDesktop = ({
  availableFilters,
  filters,
  onApply,
  onReset,
}) => {
  const {
    searchQuery, setSearchQuery,
    priceFrom, setPriceFrom,
    priceTo, setPriceTo,
    categoryFilters, setCategoryFilters,
    catFilters, setCatFilters,
    dogFilters, setDogFilters,
    minicatFilters, setMiniCatFilters,
    minidogFilters, setMiniDogFilters,
    countryFilters, setCountryFilters,
    flavorFilters, setFlavorFilters,
    brandFilters, setBrandFilters,
    scentFilters, setScentFilters,
    productTypeFilters, setProductTypeFilters,
  } = filters;

  const handleCategoryChange = (category) => {
    if (category === "all") {
      setCategoryFilters({
        all: true,
        dry: false,
        wet: false,
        filler: false,
        ...Object.fromEntries((availableFilters.typeOfFoods || []).map(t => [t.slug, false]))
      });
    } else {
      setCategoryFilters(prev => ({
        ...prev,
        all: false,
        [category]: !prev[category],
      }));
    }
  };

  // Вспомогательная функция для получения значения фильтра породы в зависимости от категории
  const getBreedFilterValue = (categorySlug, breedSlug) => {
    if (categorySlug === "cat") return catFilters[breedSlug] || false;
    if (categorySlug === "dog") return dogFilters[breedSlug] || false;
    if (categorySlug === "minicat") return minicatFilters[breedSlug] || false;
    if (categorySlug === "minidog") return minidogFilters[breedSlug] || false;
    const breedKey = `${categorySlug}_${breedSlug}`;
    return catFilters[breedKey] || false;
  };

  const setBreedFilter = (categorySlug, breedSlug, checked) => {
    if (categorySlug === "cat") {
      setCatFilters(prev => ({ ...prev, [breedSlug]: checked }));
    } else if (categorySlug === "dog") {
      setDogFilters(prev => ({ ...prev, [breedSlug]: checked }));
    } else if (categorySlug === "minicat") {
      setMiniCatFilters(prev => ({ ...prev, [breedSlug]: checked }));
    } else if (categorySlug === "minidog") {
      setMiniDogFilters(prev => ({ ...prev, [breedSlug]: checked }));
    } else {
      const breedKey = `${categorySlug}_${breedSlug}`;
      setCatFilters(prev => ({ ...prev, [breedKey]: checked }));
    }
  };

  if (availableFilters.loading) {
    return <div className="p-6 bg-white border rounded-lg">Загрузка фильтров...</div>;
  }

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg">
      <h2 className="mb-6 text-xl font-bold text-gray-900">Фильтры</h2>

      {/* Тип продукта */}
      <FilterSection title="Тип продукта">
        <div className="space-y-2">
          {availableFilters.productTypes?.map((productType) => (
            <label key={productType.id} className="flex items-center space-x-2">
              <Checkbox
                checked={productTypeFilters[productType.slug] || false}
                onCheckedChange={(c) =>
                  setProductTypeFilters(prev => ({ ...prev, [productType.slug]: c }))
                }
              />
              <span className="text-sm">{productType.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Тип корма */}
      <FilterSection title="Тип корма">
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <Checkbox
              checked={categoryFilters.all === true}
              onCheckedChange={() => handleCategoryChange("all")}
            />
            <span className="text-sm">Все корма</span>
          </label>
          {availableFilters.typeOfFoods?.map((type) => (
            <label key={type.id} className="flex items-center space-x-2">
              <Checkbox
                checked={categoryFilters[type.slug] || false}
                onCheckedChange={() => handleCategoryChange(type.slug)}
              />
              <span className="text-sm">{type.name}</span>
            </label>
          ))}
          {availableFilters.categories?.find(c => c.slug === "filler") && (
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

      {/* По стоимости */}
      <FilterSection title="По стоимости">
        <div className="flex space-x-2">
          <Input
            placeholder="от"
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-2 focus-visible:border-[#6F2A2B]"
          />
          <Input
            placeholder="до"
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-2 focus-visible:border-[#6F2A2B]"
          />
        </div>
      </FilterSection>

      {/* Динамические секции пород для каждой категории */}
      {availableFilters.categories?.filter(cat => cat.slug !== "filler").map(category => {
        const breeds = availableFilters.breedsByCategory?.[category.slug] || [];
        if (breeds.length === 0) return null;
        return (
          <FilterSection key={category.id} title={category.name}>
            <div className="space-y-2">
              {breeds.map(breed => (
                <label key={breed.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={getBreedFilterValue(category.slug, breed.slug)}
                    onCheckedChange={(c) => setBreedFilter(category.slug, breed.slug, c)}
                  />
                  <span className="text-sm">{breed.name}</span>
                </label>
              ))}
            </div>
          </FilterSection>
        );
      })}

      {/* Страна производства */}
      <FilterSection title="Страна производства">
        <div className="space-y-2">
          {availableFilters.countries?.map((country) => (
            <label key={country.id} className="flex items-center space-x-2">
              <Checkbox
                checked={countryFilters[country.slug] || false}
                onCheckedChange={(c) =>
                  setCountryFilters(prev => ({ ...prev, [country.slug]: c }))
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
          {availableFilters.flavors?.map((flavor) => {
            const flavorKey = flavor.canonicalName || String(flavor.id);
            return (
              <label key={flavor.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={flavorFilters[flavorKey] || false}
                  onCheckedChange={(c) =>
                    setFlavorFilters(prev => ({ ...prev, [flavorKey]: c }))
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
          {availableFilters.scents?.map((scent) => (
            <label key={scent.id} className="flex items-center space-x-2">
              <Checkbox
                checked={scentFilters[scent.slug] || false}
                onCheckedChange={(c) =>
                  setScentFilters(prev => ({ ...prev, [scent.slug]: c }))
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
          {availableFilters.brands?.map((brand) => (
            <label key={brand.id} className="flex items-center space-x-2">
              <Checkbox
                checked={brandFilters[brand.slug] || false}
                onCheckedChange={(c) =>
                  setBrandFilters(prev => ({ ...prev, [brand.slug]: c }))
                }
              />
              <span className="text-sm">{brand.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <Button
        onClick={onApply}
        className="w-full bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white mt-6"
      >
        Применить
      </Button>
      <Button
        onClick={onReset}
        className="w-full mt-3 text-white bg-gray-500 hover:bg-gray-600"
      >
        Сбросить фильтры
      </Button>
    </div>
  );
};