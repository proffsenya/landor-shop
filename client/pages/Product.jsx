import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import { PageFade } from "@/utils/PageAnimations";

// Универсальная секция-аккордеон
function CardSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <PageFade>
      <div className="rounded-lg border border-[#E6E6E6]">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-medium text-[#1E1E1E]"
        >
          {title}
          <span className="inline-flex h-6 w-6 items-center justify-center text-[#6F2A2B] text-[18px]">
            {open ? "–" : "+"}
          </span>
        </button>
        {open && (
          <div className="px-4 pb-4 text-[14px] leading-relaxed text-[#2a2a2a]">
            {children}
          </div>
        )}
      </div>
    </PageFade>
  );
}

const pickName = (obj, fall = "") =>
  obj?.name ?? obj?.title ?? obj?.displayName ?? obj?.display_name ?? fall;


const pickDisplayName = (obj) => obj?.display_name ?? obj?.displayName ?? null;

const getImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  return img.url || img.path || img.src || null;
};

const s = (v) => (v == null ? null : String(v));

const normalizeVariants = (product) => {
  const raw = (Array.isArray(product?.variants) && product.variants) || [];
  return raw
    .map((v, idx) => {
      const id = s(v?.id) ?? s(v?.sku) ?? `v${idx}`;
      const weightLabel =
        typeof v?.weight === "number"
          ? `${v.weight % 1 === 0 ? v.weight : v.weight.toFixed(3)} кг`
          : s(v?.weight) ?? "—";
      const numericWeight =
        typeof v?.weight === "number"
          ? v.weight
          : Number.parseFloat(typeof v?.weight === "string" ? v.weight.replace(",", ".") : Number.NaN);
      return {
        id,
        label: weightLabel,
        numericWeight,
        price: Number(v?.price ?? 0),
        available: Number(v?.stock ?? 0) >= 0,
        raw: v,
      };
    })
    .sort((a, b) => {
      if (Number.isFinite(a.numericWeight) && Number.isFinite(b.numericWeight) && a.numericWeight !== b.numericWeight) {
        return a.numericWeight - b.numericWeight;
      }
      return a.price - b.price;
    });
};

const pickSKU = (obj) => obj?.sku ?? obj?.article ?? obj?.code ?? "—";

export default function Product() {
  // теперь id = productId из маршрута /product/:id
  const { id: productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [product, setProduct] = useState(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  // Загружаем продукт по productId
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        if (!productId) throw new Error("productId is required");
        const res = await fetch(`/api/products/${encodeURIComponent(productId)}/details`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setProduct(data);
      } catch (e) {
        if (!mounted) return;
        setFailed(true);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [productId]);


  const images = useMemo(() => {
    const imgs = Array.isArray(product?.productImageDTOs) ? product.productImageDTOs : (Array.isArray(product?.images) ? product.images : []);
    const list = imgs.map(getImageUrl).filter(Boolean).slice(0, 8);
    return list.length ? list : ["/korm1.svg"];
  }, [product]);

  const variants = useMemo(() => normalizeVariants(product), [product]);

  // читаем выбранный вариант из query ?variant=...
  const selectedIdx = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    const qVariantId = sp.get("variant");
    if (qVariantId) {
      const idx = variants.findIndex((v) => s(v.id) === s(qVariantId));
      if (idx >= 0) return idx;
    }
    return 0;
  }, [location.search, variants]);

  const selectedVariant = variants[selectedIdx] || null;

  const title = useMemo(() => {
  if (!product) return "Товар";
  // если есть выбранный вариант — берём его displayName
  const v = variants[selectedIdx]?.raw;
  const variantName = pickDisplayName(v);
  if (variantName) return variantName;

  // иначе displayName товара, иначе fallback
  return pickDisplayName(product) ?? pickName(product, "Товар");
}, [product, variants, selectedIdx]);

  const priceStr = useMemo(() => {
    const p = Number(selectedVariant?.price ?? product?.price ?? 0);
    return `${p.toLocaleString("ru-RU")}₽`;
  }, [selectedVariant, product?.price]);

  const brand = useMemo(() => pickName(product?.brand, "—") || "—", [product]);

  const tastesText = useMemo(() => {
    const fl = Array.isArray(product?.flavorIds) ? product.flavorIds : (Array.isArray(product?.flavors) ? product.flavors : []);
    return fl.map((f) => pickName(f)).filter(Boolean).join(", ") || "—";
  }, [product]);

  const countryText = useMemo(() => {
    const countries = Array.isArray(product?.countryDTOs) ? product.countryDTOs : (Array.isArray(product?.countries) ? product.countries : []);
    return countries.map((c) => pickName(c)).filter(Boolean).join(" / ") || "—";
  }, [product]);

  const skuText = useMemo(() => pickSKU(selectedVariant?.raw) || pickSKU(product) || "—", [selectedVariant, product]);
  const weightLabel = useMemo(() => selectedVariant?.label || "—", [selectedVariant]);
  const stockText = useMemo(() => {
    const st = Number(selectedVariant?.raw?.stock ?? product?.stock ?? 0);
    if (!Number.isFinite(st)) return "—";
    return st > 0 ? `${st} шт.` : "Нет в наличии";
  }, [selectedVariant, product]);

  const composition = product?.composition ?? "—";
  const nutritionalValue = product?.nutritionalValue ?? "—";
  const guaranteedIndicators = product?.guaranteedIndicators ?? "—";
  const feedingNote = product?.feedingNote ?? "—";

  // Переключение веса — меняем только query ?variant=... у текущего /product/:productId
  const handleSelectWeight = (idx) => {
    if (idx < 0 || idx >= variants.length) return;
    const nextVariantId = variants[idx].id;
    const sp = new URLSearchParams(location.search);
    sp.set("variant", String(nextVariantId));
    navigate(`/product/${encodeURIComponent(productId)}?${sp.toString()}`, { replace: false });
    setSelectedImage(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-40 bg-gray-200 rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded" />
              <div className="space-y-3">
                <div className="h-6 bg-gray-200 w-2/3 rounded" />
                <div className="h-6 bg-gray-200 w-1/3 rounded" />
                <div className="h-10 bg-gray-200 w-40 rounded" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (failed || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
          <Link to="/catalog" className="mb-6 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            В каталог
          </Link>
          <div className="text-[16px] text-[#1E1E1E]">Не удалось загрузить товар.</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
        <Link to="/catalog" className="mb-4 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          В каталог
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Изображения */}
          <div className="flex flex-col w-full">
            <div className="rounded-lg border border-[#E6E6E6] bg-white p-2">
              <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-[#F2F2F2] h-64 md:h-[360px]">
                <img src={images[selectedImage]} alt={title} className="object-contain w-full h-full" />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-md border ${selectedImage === i ? "border-[#6F2A2B]" : "border-[#E6E6E6]"} bg-[#F7F7F7] h-16`}
                >
                  <img src={img} alt={`img-${i}`} className="object-contain w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Информация */}
          <div className="md:pl-6 lg:pl-8">
            <h1 className="text-[20px] md:text-[24px] font-semibold text-[#1E1E1E] leading-snug">
              {title}
            </h1>

            <div className="flex flex-col items-start gap-4 mt-4 sm:flex-row sm:items-center">
              <div className="text-[24px] font-semibold text-[#1E1E1E]">{priceStr}</div>
              <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E]">
                <button onClick={() => setQty((n) => Math.max(1, n - 1))} className="h-9 w-9 text-[18px]">–</button>
                <span className="min-w-[36px] text-center text-[15px]">{qty}</span>
                <button onClick={() => setQty((n) => n + 1)} className="h-9 w-9 text-[18px]">+</button>
              </div>
            </div>

            {/* Переключение между вариантами (весами) */}
            {variants.length > 0 && (
              <div className="mt-5">
                <div className="mb-2 text-[13px] font-medium text-[#1E1E1E]">Вес:</div>
                <div className="flex flex-wrap gap-2">
                  {variants.map((opt, idx) => {
                    const active = idx === selectedIdx;
                    return (
                      <button
                        key={opt.id}
                        disabled={!opt.available}
                        onClick={() => handleSelectWeight(idx)}
                        className={`h-9 rounded-full px-4 text-[12px] ${active ? "bg-[#6F2A2B] text-white" : "border border-[#D6D6D6] text-[#1E1E1E]"} disabled:opacity-40`}
                        title={opt.available ? "" : "Нет в наличии"}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-5 sm:flex-row">
              <Button className="h-11 rounded-lg bg-[#6F2A2B] px-6 text-[14px] text-white hover:bg-[#5a2223] w-full sm:w-auto">
                Добавить в корзину
              </Button>
              <button
                onClick={() => setIsFav((v) => !v)}
                className={`flex h-11 items-center justify-center rounded-lg border sm:w-11 ${
                  isFav ? "border-[#6F2A2B] text-[#6F2A2B]" : "border-[#DADADA] text-[#9B9B9B]"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                <span className="ml-2 text-[14px] sm:hidden">
                  {isFav ? "В избранном" : "В избранное"}
                </span>
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-2 text-[14px]">
              <div className="text-[#6B6B6B]">Артикул (SKU):</div>
              <div>{pickSKU(selectedVariant?.raw) || pickSKU(product) || "—"}</div>

              <div className="text-[#6B6B6B]">Бренд:</div>
              <div>{brand}</div>

              <div className="text-[#6B6B6B]">Страна производства:</div>
              <div>{countryText}</div>

              <div className="text-[#6B6B6B]">Вкус:</div>
              <div>{tastesText}</div>

              <div className="text-[#6B6B6B]">Вес:</div>
              <div>{weightLabel}</div>

              <div className="text-[#6B6B6B]">Наличие:</div>
              <div>{stockText}</div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <CardSection title="Состав">{composition}</CardSection>
          <CardSection title="Энергетическая ценность" defaultOpen>{nutritionalValue}</CardSection>
          <CardSection title="Гарантируемые показатели" defaultOpen>{guaranteedIndicators}</CardSection>
          <CardSection title="Нормы кормления" defaultOpen>
            <p className="text-[13px] leading-relaxed text-[#1E1E1E]">{feedingNote}</p>
          </CardSection>
        </div>
      </div>
      <Footer />
    </div>
  );
}
