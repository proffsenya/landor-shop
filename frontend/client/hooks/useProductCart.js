import { useState, useEffect, useCallback } from "react";
import { addToCart, removeFromCart } from "@/services/cartService";
import { STORAGE_CART } from "@/constants/productConstants";
import { loadSet, saveSet } from "@/utils/cartUtils"; // уже есть из корзины

export const useProductCart = (selectedVariantId, authToken, totalStock) => {
  const cartKey = STORAGE_CART(authToken);
  const [inCart, setInCart] = useState(false);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);

  // Синхронизация состояния с sessionStorage
  useEffect(() => {
    const vid = String(selectedVariantId ?? "");
    if (!vid) return;
    const cartSet = loadSet(cartKey);
    setInCart(cartSet.has(vid));
  }, [selectedVariantId, cartKey]);

  const addToCartHandler = useCallback(async () => {
    const vid = selectedVariantId;
    if (!vid || adding || !totalStock) return;
    if (!authToken || authToken === "guest") throw new Error("UNAUTHORIZED");
    if (qty > totalStock) throw new Error(`STOCK_EXCEEDED:${totalStock}`);

    setAdding(true);
    try {
      await addToCart(vid, qty, authToken);
      setInCart(true);
      const cartSet = loadSet(cartKey);
      cartSet.add(String(vid));
      saveSet(cartKey, cartSet);
      window.dispatchEvent(new Event("cart:update"));
      window.dispatchEvent(new Event("cart:changed"));
      setQty(1);
      return { success: true };
    } finally {
      setAdding(false);
    }
  }, [selectedVariantId, adding, qty, totalStock, authToken, cartKey]);

  const removeFromCartHandler = useCallback(async () => {
    const vid = selectedVariantId;
    if (!vid || adding) return;
    setAdding(true);
    try {
      const ok = await removeFromCart(vid, authToken);
      if (ok) {
        setInCart(false);
        const cartSet = loadSet(cartKey);
        cartSet.delete(String(vid));
        saveSet(cartKey, cartSet);
        window.dispatchEvent(new Event("cart:update"));
        window.dispatchEvent(new Event("cart:changed"));
        setQty(1);
        return { success: true };
      }
      return { success: false };
    } finally {
      setAdding(false);
    }
  }, [selectedVariantId, adding, authToken, cartKey]);

  const toggleCart = async () => {
    if (inCart) return removeFromCartHandler();
    return addToCartHandler();
  };

  return { inCart, adding, qty, setQty, toggleCart };
};