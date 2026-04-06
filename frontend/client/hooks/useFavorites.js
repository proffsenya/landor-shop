import { useState, useCallback, useEffect } from "react";
import { fetchFavorites, deleteFavoriteItem, deleteAllFavorites, moveToCart } from "@/services/favoritesService";
import { FAVORITES_STORAGE_KEY } from "@/constants/favoritesConstants";
import { safeWarn } from "@/utils/logger";

export const useFavorites = (authToken) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  const mapResponseToFavorites = (data) => {
    const items = Array.isArray(data) ? data : [];
    return items.map((item) => {
      let productId = NaN;
      let variantId = NaN;
      if (item.id !== undefined && item.id !== null) variantId = Number(item.id);
      if (item.variantId !== undefined && item.variantId !== null) variantId = Number(item.variantId);
      if (item.productId !== undefined && item.productId !== null) productId = Number(item.productId);
      if (!Number.isFinite(productId) && item.imageUrl?.startsWith("/api/products/")) {
        const match = item.imageUrl.match(/\/api\/products\/(\d+)\/images\/(\d+)/);
        if (match) productId = Number(match[1]);
      }
      return {
        id: Number(item.id),
        variantId: Number.isFinite(variantId) && variantId > 0 ? variantId : NaN,
        productId: Number.isFinite(productId) && productId > 0 ? productId : NaN,
        name: item.displayName || "Товар",
        price: Number(item.price ?? 0),
        image: item.imageUrl || "/korm1.svg",
        isInStock: Number(item.stock) > 0,
        weight: item.weight || "—",
        dateAdded: new Date().toLocaleDateString("ru-RU"),
      };
    });
  };

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      if (!authToken || authToken === "guest") {
        setFavorites([]);
        setAuthToastMessage("Для просмотра избранного необходимо авторизоваться");
        setShowAuthToast(true);
        return;
      }
      const data = await fetchFavorites(authToken);
      const mapped = mapResponseToFavorites(data);
      setFavorites(mapped);
      // синхронизация sessionStorage
      const key = FAVORITES_STORAGE_KEY(authToken);
      const variantIds = mapped.map(i => String(i.id));
      sessionStorage.setItem(key, JSON.stringify(variantIds));
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        setFavorites([]);
        setAuthToastMessage("Для просмотра избранного необходимо авторизоваться");
        setShowAuthToast(true);
      } else {
        safeWarn("Ошибка загрузки избранного:", err);
        setFavorites([]);
      }
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  const removeItems = useCallback(async (ids) => {
    if (!ids.length) return { succeeded: new Set(), failed: new Set() };
    const succeeded = new Set();
    const failed = new Set();
    let has401 = false;
    await Promise.all(ids.map(async (id) => {
      try {
        const ok = await deleteFavoriteItem(id, authToken);
        if (ok) succeeded.add(id);
        else failed.add(id);
      } catch (err) {
        if (err.message === "UNAUTHORIZED") has401 = true;
        failed.add(id);
      }
    }));
    if (has401) {
      setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
      setShowAuthToast(true);
    }
    if (succeeded.size) {
      setFavorites(prev => prev.filter(item => !succeeded.has(item.id)));
      const key = FAVORITES_STORAGE_KEY(authToken);
      const remainingIds = favorites.filter(f => !succeeded.has(f.id)).map(f => String(f.id));
      sessionStorage.setItem(key, JSON.stringify(remainingIds));
      window.dispatchEvent(new Event("favorites:update"));
    }
    return { succeeded, failed };
  }, [authToken, favorites]);

  const removeAll = useCallback(async () => {
    try {
      const ok = await deleteAllFavorites(authToken);
      if (ok) {
        setFavorites([]);
        const key = FAVORITES_STORAGE_KEY(authToken);
        sessionStorage.setItem(key, JSON.stringify([]));
        window.dispatchEvent(new Event("favorites:update"));
        return true;
      }
      return false;
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
        setShowAuthToast(true);
      }
      return false;
    }
  }, [authToken]);

  const moveToCartHandler = useCallback(async (variantIds) => {
    if (!variantIds.length) return false;
    try {
      const ok = await moveToCart(variantIds, authToken);
      if (ok) {
        // удаляем перемещённые из избранного
        const idsToRemove = favorites.filter(f => variantIds.includes(f.variantId)).map(f => f.id);
        if (idsToRemove.length) {
          await removeItems(idsToRemove);
        }
        window.dispatchEvent(new Event("cart:update"));
        return true;
      }
      return false;
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
        setShowAuthToast(true);
      }
      return false;
    }
  }, [authToken, favorites, removeItems]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // слушаем событие обновления избранного из других вкладок/компонентов
  useEffect(() => {
    const handleUpdate = () => loadFavorites();
    window.addEventListener("favorites:update", handleUpdate);
    return () => window.removeEventListener("favorites:update", handleUpdate);
  }, [loadFavorites]);

  return {
    favorites,
    loading,
    showAuthToast,
    authToastMessage,
    setShowAuthToast,
    removeItems,
    removeAll,
    moveToCart: moveToCartHandler,
    refetch: loadFavorites,
  };
};