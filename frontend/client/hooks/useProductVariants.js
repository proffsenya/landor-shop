import { useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { normalizeVariants } from "@/utils/productUtils";

export const useProductVariants = (product, productId) => {
  const location = useLocation();
  const navigate = useNavigate();

  const variants = useMemo(() => normalizeVariants(product), [product]);

  const selectedIdx = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const qVariantId = sp.get("variant");
    if (qVariantId) {
      const idx = variants.findIndex(v => v.id === String(qVariantId));
      if (idx >= 0) return idx;
    }
    return 0;
  }, [location.search, variants]);

  const selectedVariant = variants[selectedIdx] || null;

  const handleSelectWeight = useCallback((idx) => {
    if (idx < 0 || idx >= variants.length) return;
    const sp = new URLSearchParams(location.search);
    sp.set("variant", String(variants[idx].id));
    navigate(`/product/${encodeURIComponent(productId)}?${sp.toString()}`, { replace: true });
  }, [variants, location.search, navigate, productId]);

  return { variants, selectedIdx, selectedVariant, handleSelectWeight };
};