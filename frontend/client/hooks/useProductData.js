import { useState, useEffect } from "react";
import { fetchProductDetails } from "@/services/productService";

export const useProductData = (productId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const data = await fetchProductDetails(productId);
        if (mounted) setProduct(data);
      } catch (err) {
        if (mounted) setFailed(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [productId]);

  return { product, loading, failed };
};