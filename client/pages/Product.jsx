// client/pages/Product.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Check } from "lucide-react";
import { PageFade } from "@/utils/PageAnimations";

// ------------------ UI: секция-аккордеон ------------------
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

// ------------------ утилиты ------------------
const pickName = (obj, fall = "") =>
  obj?.name ?? obj?.title ?? obj?.displayName ?? obj?.display_name ?? fall;

const pickDisplayName = (obj) => obj?.display_name ?? obj?.displayName ?? null;

const s = (v) => (v == null ? null : String(v));

const pickSKU = (obj) => obj?.sku ?? obj?.article ?? obj?.code ?? "—";

// helpers: authToken + sessionStorage-сеты по токену
const getAuthToken = () => {
  if (typeof window === "undefined") return "guest";
  return localStorage.getItem("authToken") || "guest";
};
const STORAGE_CART = (token) => `cart:variants:${token || "guest"}`;
const STORAGE_FAVS = (token) => `favs:variants:${token || "guest"}`;

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

function authHeaders(authToken, extra = {}) {
  const h = { ...extra };
  if (authToken && authToken !== "guest") h.Authorization = `Bearer ${authToken}`;
  return h;
}

/** POST /api/favorites { variantId } */
async function apiAddFavorite(variantId, authToken) {
  const r = await fetch("/api/favorites", {
    method: "POST",
    headers: authHeaders(authToken, { "Content-Type": "application/json" }),
    body: JSON.stringify({ variantId: Number(variantId) }),
  });
  if (!r.ok) throw new Error(`POST /api/favorites -> ${r.status} ${await safeText(r)}`);
  return true;
}

/** DELETE /api/favorites по разным вариантам роутинга */
async function apiRemoveFavorite(variantId, authToken) {
  // 1) DELETE /api/favorites/:variantId
  try {
    const r = await fetch(`/api/favorites/${encodeURIComponent(variantId)}`, {
      method: "DELETE",
      headers: authHeaders(authToken),
    });
    if (r.ok) return true;
  } catch {}

  // 2) DELETE /api/favorites?variantId=...
  try {
    const r = await fetch(`/api/favorites?variantId=${encodeURIComponent(variantId)}`, {
      method: "DELETE",
      headers: authHeaders(authToken),
    });
    if (r.ok) return true;
  } catch {}

  // 3) DELETE /api/favorites (body)
  try {
    const r = await fetch(`/api/favorites`, {
      method: "DELETE",
      headers: authHeaders(authToken, { "Content-Type": "application/json" }),
      body: JSON.stringify({ variantId: Number(variantId) }),
    });
    if (r.ok) return true;
  } catch {}

  return false;
}


const loadSet = (key) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};
const saveSet = (key, set) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
};

// нормализация вариантов с весом
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
          : Number.parseFloat(
              typeof v?.weight === "string"
                ? v.weight.replace(",", ".")
                : Number.NaN
            );
      return {
        id,
        label: weightLabel,
        numericWeight,
        price: Number(v?.price ?? 0),
        available: Number(v?.stock ?? 0) >= 1,
        raw: v,
      };
    })
    .sort((a, b) => {
      if (
        Number.isFinite(a.numericWeight) &&
        Number.isFinite(b.numericWeight) &&
        a.numericWeight !== b.numericWeight
      ) {
        return a.numericWeight - b.numericWeight;
      }
      return a.price - b.price;
    });
};

// кэш objectURL по imageId
const imageCache = new Map();

// грузим один файл-изображение -> objectURL
async function fetchImageUrl(productId, imageId, token) {
  if (!productId || !imageId) return "/korm1.svg";
  const cacheKey = `${productId}:${imageId}`;
  if (imageCache.has(cacheKey)) return imageCache.get(cacheKey);

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(
        productId
      )}/images/${encodeURIComponent(imageId)}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!res.ok) {
      let body = "";
      try {
        body = await res.text();
      } catch {}
      console.warn("[images]", res.status, res.url, body?.slice(0, 300));
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const blob = await res.blob();
    const ct = res.headers.get("content-type") || blob.type || "";
    if (!ct.startsWith("image/")) {
      console.warn(
        `[images] not image content for id=${imageId}, content-type=${ct}`
      );
      const fb = "/korm1.svg";
      imageCache.set(cacheKey, fb);
      return fb;
    }
    const url = URL.createObjectURL(blob);
    imageCache.set(cacheKey, url);
    return url;
  } catch (e) {
    console.warn("[images] error", e);
    const fb = "/korm1.svg";
    imageCache.set(cacheKey, fb);
    return fb;
  }
}

// ------------------ компонент ------------------
export default function Product() {
  const { id: productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [product, setProduct] = useState(null);

  // картинки карусели
  const [gallery, setGallery] = useState([]); // [{id, url, isMain, altText}]
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  // session ключи
  const authToken = getAuthToken();
  const cartKey = STORAGE_CART(authToken);
  const favKey = STORAGE_FAVS(authToken);

  const [inCart, setInCart] = useState(false);
  const [adding, setAdding] = useState(false);

  // ---------- загрузка детали товара ----------
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        if (!productId) throw new Error("productId is required");
        const res = await fetch(
          `/api/products/${encodeURIComponent(productId)}/details`
        );
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
    return () => {
      mounted = false;
    };
  }, [productId]);

  // ---------- загрузка картинок карусели ----------
  useEffect(() => {
    let mounted = true;
    const token = authToken;

    async function loadGallery() {
      try {
        if (!productId) return;
        const res = await fetch(
          `/api/products/${encodeURIComponent(productId)}/images`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const meta = await res.json();

        const ordered = [...meta].sort(
          (a, b) => (b.isMain === true) - (a.isMain === true)
        );

        const urls = await Promise.all(
          ordered.map((m) => fetchImageUrl(productId, m.id, token))
        );

        const items = ordered.map((m, i) => ({
          ...m,
          url: urls[i] || "/korm1.svg",
        }));

        if (!mounted) return;
        setGallery(
          items.length
            ? items
            : [{ id: "ph", url: "/korm1.svg", isMain: true, altText: "image" }]
        );
        setSelectedImageIdx(0);
      } catch (e) {
        console.warn("gallery load error:", e);
        if (!mounted) return;
        setGallery([
          { id: "ph", url: "/korm1.svg", isMain: true, altText: "image" },
        ]);
        setSelectedImageIdx(0);
      }
    }

    loadGallery();
    return () => {
      mounted = false;
    };
  }, [productId, authToken]);

  // ---------- варианты ----------
  const variants = useMemo(() => normalizeVariants(product), [product]);

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
    const v = variants[selectedIdx]?.raw;
    const variantName = pickDisplayName(v);
    if (variantName) return variantName;
    return pickDisplayName(product) ?? pickName(product, "Товар");
  }, [product, variants, selectedIdx]);

  const priceStr = useMemo(() => {
    const p = Number(selectedVariant?.price ?? product?.price ?? 0);
    return `${p.toLocaleString("ru-RU")}₽`;
  }, [selectedVariant, product?.price]);

  const brand = useMemo(
    () => pickName(product?.brand, "—") || "—",
    [product]
  );

  const tastesText = useMemo(() => {
    const fl = Array.isArray(product?.flavorIds)
      ? product.flavorIds
      : Array.isArray(product?.flavors)
      ? product.flavors
      : [];
    return fl.map((f) => pickName(f)).filter(Boolean).join(", ") || "—";
  }, [product]);

  const countryText = useMemo(() => {
    const countries = Array.isArray(product?.countryDTOs)
      ? product.countryDTOs
      : Array.isArray(product?.countries)
      ? product.countries
      : [];
    return countries.map((c) => pickName(c)).filter(Boolean).join(" / ") || "—";
  }, [product]);

  const skuText = useMemo(
    () => pickSKU(selectedVariant?.raw) || pickSKU(product) || "—",
    [selectedVariant, product]
  );

  const weightLabel = useMemo(
    () => selectedVariant?.label || "—",
    [selectedVariant]
  );

  const stockText = useMemo(() => {
    const st = Number(selectedVariant?.raw?.stock ?? product?.stock ?? 0);
    if (!Number.isFinite(st)) return "—";
    return st > 0 ? `${st} шт.` : "Нет в наличии";
  }, [selectedVariant, product]);

  const totalStock = useMemo(() => {
    const st = Number(selectedVariant?.raw?.stock ?? product?.stock ?? 0);
    return Number.isFinite(st) ? st : 0;
  }, [selectedVariant, product]);

  const available = totalStock >= 1;

  const composition = product?.composition ?? "—";
  const nutritionalValue = product?.nutritionalValue ?? "—";
  const guaranteedIndicators = product?.guaranteedIndicators ?? "—";
  const feedingNote = product?.feedingNote ?? "—";

  const handleSelectWeight = (idx) => {
    if (idx < 0 || idx >= variants.length) return;
    const nextVariantId = variants[idx].id;
    const sp = new URLSearchParams(location.search);
    sp.set("variant", String(nextVariantId));
    navigate(
      `/product/${encodeURIComponent(productId)}?${sp.toString()}`,
      { replace: false }
    );
    setSelectedImageIdx(0);
  };

  // ---------- синхронизация с сессией (кнопки) ----------
  useEffect(() => {
    const vid = String(selectedVariant?.id ?? "");
    if (!vid) return;
    const cartSet = loadSet(cartKey);
    const favSet = loadSet(favKey);
    setInCart(cartSet.has(vid));
    setIsFav(favSet.has(vid));
  }, [selectedVariant?.id, cartKey, favKey]);

  // слушатель на возможные внешние изменения (если где-то диспатчишь)
  useEffect(() => {
    const handler = () => {
      const vid = String(selectedVariant?.id ?? "");
      if (!vid) return;
      const cartSet = loadSet(cartKey);
      const favSet = loadSet(favKey);
      setInCart(cartSet.has(vid));
      setIsFav(favSet.has(vid));
    };
    window.addEventListener("cart:changed", handler);
    window.addEventListener("favs:changed", handler);
    return () => {
      window.removeEventListener("cart:changed", handler);
      window.removeEventListener("favs:changed", handler);
    };
  }, [selectedVariant?.id, cartKey, favKey]);

  // ---------- добавление в корзину ----------
  const handleAddToCart = async () => {
  const vid = selectedVariant?.id;
  if (!vid || adding) return;

  setAdding(true);

  // если уже в корзине → удалить
  if (inCart) {
    try {
      const res = await fetch(`/api/cart/${encodeURIComponent(vid)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ variantId: Number(vid), quantity: 1 }),
      });

      if (res.ok) {
        console.log("✅ Товар удалён из корзины:", vid);
        const set = loadSet(cartKey);
        set.delete(String(vid));
        saveSet(cartKey, set);
        setInCart(false);
        window.dispatchEvent(new Event("cart:update"));
        try {
          window.dispatchEvent(new Event("cart:changed"));
        } catch {}
      } else {
        console.warn("Ошибка при удалении:", res.status, await res.text());
      }
    } catch (e) {
      console.warn("Ошибка удаления из корзины:", e);
    } finally {
      setAdding(false);
    }
    return;
  }

  // если не в корзине → добавить
  try {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        variantId: Number(vid),
        quantity: 1, // фиксированное количество при добавлении
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("Ошибка при добавлении в корзину:", res.status, text);
      return;
    }

    const data = await res.json();
    console.log("✅ Добавлено в корзину:", data);

    const set = loadSet(cartKey);
    set.add(String(vid));
    saveSet(cartKey, set);
    setInCart(true);
    window.dispatchEvent(new Event("cart:update"));
    try {
      window.dispatchEvent(new Event("cart:changed"));
    } catch {}
  } catch (e) {
    console.warn("Ошибка запроса:", e);
  } finally {
    setAdding(false);
  }
};


  // ---------- избранное ----------
  // ---------- избранное ----------
const handleToggleFavorite = async () => {
  const vidStr = String(selectedVariant?.id ?? "");
  if (!vidStr) return;

  const vidNum = Number(vidStr);
  const favSet = loadSet(favKey);
  const nowFav = favSet.has(vidStr);

  // оптимистично переключаем UI + sessionStorage
  setIsFav(!nowFav);
  if (!nowFav) favSet.add(vidStr);
  else favSet.delete(vidStr);
  saveSet(favKey, favSet);

  try {
    if (!nowFav) {
      // добавить в избранное
      await apiAddFavorite(vidNum, authToken);
    } else {
      // удалить из избранного
      const ok = await apiRemoveFavorite(vidNum, authToken);
      if (!ok) throw new Error("favorites delete failed");
    }
    // обновить бейджи/прочие слушатели
    try { window.dispatchEvent(new Event("favorites:update")); } catch {}
    try { window.dispatchEvent(new Event("favs:changed")); } catch {}
  } catch (e) {
    // откат при ошибке
    const rollback = loadSet(favKey);
    if (!nowFav) {
      rollback.delete(vidStr);
      setIsFav(false);
    } else {
      rollback.add(vidStr);
      setIsFav(true);
    }
    saveSet(favKey, rollback);
    console.warn("[favorites] api error:", e);
  }
};



  // ---------- загрузочные и ошибочные состояния ----------
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
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
        </main>
        <Footer />
      </div>
    );
  }

  if (failed || !product) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
            <Link
              to="/catalog"
              className="mb-6 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              В каталог
            </Link>
            <div className="text-[16px] text-[#1E1E1E]">
              Не удалось загрузить товар.
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------- рендер ----------
  const mainImage = gallery[selectedImageIdx]?.url || "/korm1.svg";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
          <Link
            to="/catalog"
            className="mb-4 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            В каталог
          </Link>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Карусель изображений */}
            <div className="flex flex-col w-full">
              <div className="rounded-lg border border-[#E6E6E6] bg-white p-2">
                <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-[#F2F2F2] h-64 md:h-[360px]">
                  <img
                    src={mainImage}
                    alt={gallery[selectedImageIdx]?.altText || title}
                    className="object-contain w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/korm1.svg";
                    }}
                  />
                </div>
              </div>

              {/* превьюшки */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {gallery.map((img, i) => (
                  <button
                    key={img.id ?? i}
                    onClick={() => setSelectedImageIdx(i)}
                    className={`overflow-hidden rounded-md border ${
                      selectedImageIdx === i
                        ? "border-[#6F2A2B]"
                        : "border-[#E6E6E6]"
                    } bg-[#F7F7F7] h-16`}
                    title={img.altText || ""}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || `img-${i}`}
                      className="object-contain w-full h-full"
                      onError={(e) => {
                        e.currentTarget.src = "/korm1.svg";
                      }}
                    />
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
                <div className="text-[24px] font-semibold text-[#1E1E1E]">
                  {priceStr}
                </div>
                <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E]">
                  <button
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                    className="h-9 w-9 text-[18px]"
                  >
                    –
                  </button>
                  <span className="min-w-[36px] text-center text-[15px]">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((n) => n + 1)}
                    className="h-9 w-9 text-[18px]"
                  >
                    +
                  </button>
                </div>
              </div>

              {variants.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2 text-[13px] font-medium text-[#1E1E1E]">
                    Вес:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((opt, idx) => {
                      const active = idx === selectedIdx;
                      const notAvail = !opt.available;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectWeight(idx)}
                          // Визуально отмечаем недоступные, но НЕ блокируем клик
                          className={`h-9 rounded-full px-4 text-[12px] transition ${
                            active
                              ? "bg-[#6F2A2B] text-white"
                              : "border border-[#D6D6D6] text-[#1E1E1E]"
                          } ${notAvail ? "opacity-50" : ""}`}
                          title={notAvail ? "Нет в наличии" : ""}
                          aria-pressed={active}
                          aria-label={notAvail ? `${opt.label} (нет в наличии)` : opt.label}
                        >
                          {opt.label}
                        </button>
                      );
                    })}

                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-5 sm:flex-row">
                {available ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`h-11 rounded-lg px-6 text-[14px] w-full sm:w-auto ${
                      inCart
                        ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                        : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                    } ${adding ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {inCart ? (
                      <span className="flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" /> В корзине
                      </span>
                    ) : adding ? (
                      "Добавление..."
                    ) : (
                      "Добавить в корзину"
                    )}
                  </Button>
                ) : (
                  <span className="h-11 inline-flex items-center justify-center rounded-lg px-6 text-[14px] w-full sm:w-auto bg-gray-100 text-gray-500">
                    Нет в наличии
                  </span>
                )}

                <button
                  onClick={handleToggleFavorite}
                  className={`flex h-11 items-center justify-center rounded-lg border sm:w-11 ${
                    isFav
                      ? "border-[#6F2A2B] text-[#6F2A2B]"
                      : "border-[#DADADA] text-[#9B9B9B]"
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
                <div>{skuText}</div>

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
            <CardSection title="Энергетическая ценность" defaultOpen>
              {nutritionalValue}
            </CardSection>
            <CardSection title="Гарантируемые показатели" defaultOpen>
              {guaranteedIndicators}
            </CardSection>
            <CardSection title="Нормы кормления" defaultOpen>
              <p className="text-[13px] leading-relaxed text-[#1E1E1E]">
                {feedingNote}
              </p>
            </CardSection>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
