import { formatWeight } from "./formatting";

export const pickName = (obj, fall = "") =>
  obj?.name ?? obj?.title ?? obj?.displayName ?? obj?.display_name ?? fall;

export const pickDisplayName = (obj) => obj?.display_name ?? obj?.displayName ?? null;

export const pickSKU = (obj) => obj?.sku ?? obj?.article ?? obj?.code ?? "—";

export const normalizeVariants = (product) => {
  const raw = (Array.isArray(product?.variants) && product.variants) || [];
  return raw
    .map((v, idx) => {
      const id = v?.id ?? v?.sku ?? `v${idx}`;
      const weightLabel = typeof v?.weight === "number" ? formatWeight(v.weight) : (v?.weight ?? "—");
      const numericWeight = typeof v?.weight === "number" ? v.weight : Number.parseFloat(typeof v?.weight === "string" ? v.weight.replace(",", ".") : NaN);
      return {
        id: String(id),
        label: weightLabel,
        numericWeight,
        price: Number(v?.price ?? 0),
        available: Number(v?.stock ?? 0) >= 1,
        raw: v,
      };
    })
    .sort((a, b) => {
      if (Number.isFinite(a.numericWeight) && Number.isFinite(b.numericWeight) && a.numericWeight !== b.numericWeight)
        return a.numericWeight - b.numericWeight;
      return a.price - b.price;
    });
};