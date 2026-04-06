import { useEffect } from 'react';
import { STORAGE_KEYS } from '@/constants/catalogConstants';
import { fetchCatalogCards } from '@/services/catalogService';
import { safeWarn } from '@/utils/logger';

export const useCatalogSearchCache = () => {
  useEffect(() => {
    const loadAll = async () => {
      try {
        const existing = sessionStorage.getItem(STORAGE_KEYS.CATALOG_ALL);
        if (existing) return;
        const response = await fetchCatalogCards('', 1);
        const items = response?.content || [];
        const searchData = items.map(item => ({
          id: item.id,
          variantId: item.id,
          productId: item.productId,
          displayName: item.displayName || 'Товар',
          price: item.price,
          weight: item.weight,
          imageUrl: item.imageUrl,
        }));
        sessionStorage.setItem(STORAGE_KEYS.CATALOG_ALL, JSON.stringify(searchData));
        window.dispatchEvent(new Event('catalog:update'));
      } catch (e) {
        safeWarn(e);
      }
    };
    loadAll();
  }, []);
};