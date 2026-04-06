import { useState, useEffect, useCallback } from "react";
import { fetchProductImagesMeta, fetchImageBlobUrl } from "@/services/productService";
import { DEFAULT_IMAGE } from "@/constants/productConstants";

export const useProductImages = (productId, authToken, selectedVariantId) => {
  const [gallery, setGallery] = useState([]);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const loadGallery = useCallback(async () => {
    try {
      const meta = await fetchProductImagesMeta(productId, authToken);
      const ordered = [...meta].sort((a, b) => {
        if (a.productVariantId != null && b.productVariantId != null)
          return (a.productVariantId || 0) - (b.productVariantId || 0);
        if (a.productVariantId != null && b.productVariantId == null) return -1;
        if (a.productVariantId == null && b.productVariantId != null) return 1;
        return (a.id || 0) - (b.id || 0);
      });
      const urls = await Promise.all(ordered.map(m => fetchImageBlobUrl(productId, m.id, authToken)));
      const items = ordered.map((m, i) => ({ ...m, url: urls[i] || DEFAULT_IMAGE }));
      setGallery(items.length ? items : [{ id: "ph", url: DEFAULT_IMAGE, isMain: true, altText: "image" }]);
      setSelectedImageIdx(0);
    } catch (err) {
      setGallery([{ id: "ph", url: DEFAULT_IMAGE, isMain: true, altText: "image" }]);
      setSelectedImageIdx(0);
    }
  }, [productId, authToken]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Автоматический выбор изображения при смене варианта
  useEffect(() => {
    if (!selectedVariantId || !gallery.length) return;
    const variantIdStr = String(selectedVariantId);
    let idx = gallery.findIndex(img => img.productVariantId != null && String(img.productVariantId) === variantIdStr);
    if (idx === -1) idx = gallery.findIndex(img => img.productVariantId == null && img.isMain === true);
    if (idx === -1) idx = gallery.findIndex(img => img.productVariantId == null);
    if (idx === -1) idx = 0;
    setSelectedImageIdx(idx);
  }, [selectedVariantId, gallery]);

  const relevantThumbnails = gallery.filter(img => {
    if (!selectedVariantId) return true;
    const variantIdStr = String(selectedVariantId);
    return img.productVariantId == null || String(img.productVariantId) === variantIdStr;
  });

  const handleSelectImage = (idx) => {
    setSelectedImageIdx(idx);
  };

  return { gallery, selectedImageIdx, relevantThumbnails, handleSelectImage };
};