import { useState, useEffect, useCallback } from "react";
import { addFavorite, removeFavorite } from "@/services/favoritesService";
import { STORAGE_FAVS } from "@/constants/productConstants";
import { loadSet, saveSet } from "@/utils/cartUtils";

export const useProductFavorites = (selectedVariantId, authToken) => {
  const favKey = STORAGE_FAVS(authToken);
  const [isFav, setIsFav] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const vid = String(selectedVariantId ?? "");
    if (!vid) return;
    const favSet = loadSet(favKey);
    setIsFav(favSet.has(vid));
  }, [selectedVariantId, favKey]);

  const toggleFavorite = useCallback(async () => {
    const vid = selectedVariantId;
    if (!vid || toggling) return;
    if (!authToken || authToken === "guest") throw new Error("UNAUTHORIZED");

    setToggling(true);
    const wasFav = isFav;
    // Оптимистично
    setIsFav(!wasFav);
    const favSet = loadSet(favKey);
    if (!wasFav) favSet.add(String(vid));
    else favSet.delete(String(vid));
    saveSet(favKey, favSet);

    try {
      if (!wasFav) await addFavorite(vid, authToken);
      else await removeFavorite(vid, authToken);
      window.dispatchEvent(new Event("favorites:update"));
      window.dispatchEvent(new Event("favs:changed"));
    } catch (err) {
      // Откат
      setIsFav(wasFav);
      const rollback = loadSet(favKey);
      if (!wasFav) rollback.delete(String(vid));
      else rollback.add(String(vid));
      saveSet(favKey, rollback);
      throw err;
    } finally {
      setToggling(false);
    }
  }, [selectedVariantId, isFav, toggling, authToken, favKey]);

  return { isFav, toggling, toggleFavorite };
};