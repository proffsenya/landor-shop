import { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BreadcrumbNav from '@/components/BreadcrumbNav';
import { PageFade, ToastMotion } from '@/utils/PageAnimations';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { useCatalogFetch } from '@/hooks/useCatalogFetch';
import { useCatalogUrlSync } from '@/hooks/useCatalogUrlSync';
import { useCatalogSearchCache } from '@/hooks/useCatalogSearchCache';
import { FiltersDesktop } from '@/components/catalog/FiltersDesktop';
import { FiltersMobile } from '@/components/catalog/FiltersMobile';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { CatalogPagination } from '@/components/catalog/CatalogPagination';
import { EmptyCatalog } from '@/components/catalog/EmptyCatalog';
import { useToast } from '@/hooks/useToast';

export default function Catalog() {
  const { toast, toastType, showToast } = useToast();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Загружаем опции фильтров (бренды, вкусы и т.д.) через отдельный хук (не показан, но можно сделать useAvailableFilters)
  const [availableFilters, setAvailableFilters] = useState({ loading: true });
  useEffect(() => {
    import('@/services/catalogService').then(({ fetchFilterOptions }) => {
      fetchFilterOptions().then(setAvailableFilters);
    });
  }, []);

  const filters = useCatalogFilters(availableFilters);
  const { products, loading, error, totalPages, totalElements, page, fetchCards, goToPage } = useCatalogFetch(1);
  useCatalogUrlSync(filters, filters.generateQueryParams, fetchCards, page, goToPage);
  useCatalogSearchCache();

  const handleApplyFilters = () => {
    const query = filters.generateQueryParams();
    fetchCards(query, 1);
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    filters.resetFilters();
    fetchCards('', 1);
    setMobileFiltersOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = !loading && !error && products.length === 0 && totalElements === 0;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="container flex flex-col flex-grow px-4 py-8 mx-auto">
        <BreadcrumbNav items={[{ label: 'Главная', to: '/' }, { label: 'Каталог' }]} />

        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <Button onClick={() => setMobileFiltersOpen(true)} className="flex items-center justify-center w-full gap-2 text-white bg-primary">
            <Filter className="w-4 h-4" /> Фильтры
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="hidden lg:block lg:col-span-1">
            <FiltersDesktop
              availableFilters={availableFilters}
              filters={filters}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
          </div>

          <div className="lg:col-span-3">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">Каталог</h1>

            {loading && <div className="py-12 text-center text-gray-500">Загрузка…</div>}
            {!loading && error && <div className="py-12 text-center text-red-600">Ошибка: {error}</div>}
            {!loading && !error && isEmpty && <EmptyCatalog />}
            {!loading && !error && products.length > 0 && (
              <>
                <ProductGrid products={products} />
                <PageFade>
                  <CatalogPagination page={page} totalPages={totalPages} onPageChange={goToPage} totalElements={totalElements} />
                </PageFade>
              </>
            )}
          </div>
        </div>
      </div>

      {mobileFiltersOpen && (
        <FiltersMobile
          availableFilters={availableFilters}
          filters={filters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          onClose={() => setMobileFiltersOpen(false)}
        />
      )}

      <Footer />
      <ToastMotion show={!!toast} type={toastType}>{toast}</ToastMotion>
    </div>
  );
}