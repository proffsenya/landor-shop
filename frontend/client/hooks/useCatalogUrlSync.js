import { useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants/catalogConstants';

export const useCatalogUrlSync = (filters, generateQueryParams, fetchCards, page, setPage) => {
  // Сохранение фильтров в sessionStorage при изменении
  useEffect(() => {
    const filtersState = { ...filters, page };
    sessionStorage.setItem(STORAGE_KEYS.CATALOG_FILTERS, JSON.stringify(filtersState));
  }, [filters, page]);

  // Восстановление из URL при монтировании
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const restoredPage = parseInt(urlParams.get('page') || '1', 10);
    if (!isNaN(restoredPage)) setPage(restoredPage);
    // восстанавливаем фильтры из URL (код из restoreFiltersFromUrl)
    // ...
    const queryString = window.location.search;
    fetchCards(queryString, restoredPage);
  }, []);

  // Обновление URL при изменении фильтров
  useEffect(() => {
    const query = generateQueryParams();
    const newUrl = query ? `?${query}&page=${page}` : `?page=${page}`;
    window.history.pushState({}, '', newUrl);
  }, [generateQueryParams, page]);
};