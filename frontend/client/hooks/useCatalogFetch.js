import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchCatalogCards } from '@/services/catalogService';
import { loadImagesForCards } from '@/hooks/useCatalogImageLoader'; // см. ниже
import { safeError } from '@/utils/logger';

export const useCatalogFetch = (initialPage = 1) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(initialPage);
  const abortControllerRef = useRef(null);

  const fetchCards = useCallback(async (filtersUrlString, pageNumber = page, useCache = true) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError('');
    try {
      const response = await fetchCatalogCards(filtersUrlString, pageNumber, controller.signal);
      const data = response?.content || [];
      setTotalPages(Math.max(1, response?.totalPages || 1));
      setTotalElements(response?.totalElements || 0);
      // преобразуем данные в карточки (логика из оригинального файла: mapCartResponse-like)
      const cards = data.map(item => ({ /* ... */ }));
      setProducts(cards);
      // асинхронная подгрузка изображений
      loadImagesForCards(cards);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        safeError(err);
      }
    } finally {
      setLoading(false);
      if (abortControllerRef.current === controller) abortControllerRef.current = null;
    }
  }, [page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
    }
  };

  return { products, loading, error, totalPages, totalElements, page, fetchCards, goToPage, setPage };
};