import { useState, useCallback, useEffect } from "react";
import { getAuthToken } from "@/utils/auth";
import { STORAGE_CART, mapCartResponse, loadSet, saveSet } from "@/utils/cartUtils";
import { fetchCartAPI, deleteCartItemAPI, changeQuantityAPI } from "@/services/cartService";
import { safeWarn } from "@/utils/logger";
import { handleApiError } from "@/utils/errorMessages";

export const useCart = () => {
  const authToken = getAuthToken();
  const cartKey = STORAGE_CART(authToken);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchCartAPI(authToken);
      if (res.status === 401) {
        setItems([]);
        setAuthToastMessage("Для просмотра корзины необходимо авторизоваться");
        setShowAuthToast(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const mapped = mapCartResponse(data);
      setItems(mapped);
      // синхронизируем sessionStorage
      const setCart = new Set(mapped.map(i => i.variantId).filter(v => v != null).map(String));
      saveSet(cartKey, setCart);
    } catch (e) {
      setItems([]);
      setError(e?.message || "Не удалось загрузить корзину");
    } finally {
      setLoading(false);
    }
  }, [authToken, cartKey]);

  const updateQuantityLocally = (id, newQuantity) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
  };

  const changeQuantity = async (item, direction) => {
    const variantId = Number(item.variantId);
    if (!Number.isFinite(variantId)) return { ok: false, error: null };

    const result = await changeQuantityAPI(variantId, direction, authToken);
    if (result.ok) {
      const delta = direction === "inc" ? 1 : -1;
      updateQuantityLocally(item.id, item.quantity + delta);
      return { ok: true, error: null };
    } else {
      const errorText = await result.text();
      let errorMessage = await handleApiError(result, "изменение количества", "товар");
      if (result.status >= 500 && !errorMessage) errorMessage = "Ошибка сервера";
      return { ok: false, error: errorMessage };
    }
  };

  const removeItem = async (item) => {
    // оптимистичное удаление
    setItems(prev => prev.filter(i => i.id !== item.id));
    const ok = await deleteCartItemAPI(item.variantId, authToken);
    if (!ok) {
      // откат
      setItems(prev => [item, ...prev]);
      return false;
    }
    // обновляем sessionStorage
    const setCart = loadSet(cartKey);
    setCart.delete(String(item.variantId));
    saveSet(cartKey, setCart);
    window.dispatchEvent(new Event("cart:update"));
    return true;
  };

  // слушаем события обновления корзины
  useEffect(() => {
    const handleCartUpdate = () => { fetchCart(); };
    window.addEventListener("cart:update", handleCartUpdate);
    window.addEventListener("cart:changed", handleCartUpdate);
    return () => {
      window.removeEventListener("cart:update", handleCartUpdate);
      window.removeEventListener("cart:changed", handleCartUpdate);
    };
  }, [fetchCart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return {
    items,
    loading,
    error,
    showAuthToast,
    authToastMessage,
    setShowAuthToast,
    changeQuantity,
    removeItem,
    refetch: fetchCart,
  };
};