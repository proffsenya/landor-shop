// client/pages/Product.jsx
import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, Check } from "lucide-react";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import AccordionMotion from "@/utils/AccordionMotion";
import { AuthToast } from "@/components/AuthToast";
import { getAuthToken } from "@/utils/auth";

// ------------------ UI: секция-аккордеон ------------------
const CardSection = memo(({ title, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggleOpen = useCallback(() => setOpen(v => !v), []);
  
  return (
    <PageFade>
      <div className="rounded-lg border border-[#E6E6E6]">
        <button
          onClick={toggleOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-[18px] font-medium text-[#1E1E1E] rounded-t-lg"
        >
          {title}
          <span className="inline-flex h-6 w-6 items-center justify-center text-[#6F2A2B] text-[18px]">
            {open ? "–" : "+"}
          </span>
        </button>
        <AccordionMotion isOpen={open}>
          <div className="px-4 pb-4 text-base leading-relaxed text-gray-600">
            {children}
          </div>
        </AccordionMotion>
      </div>
    </PageFade>
  );
});
CardSection.displayName = 'CardSection';

// ------------------ утилиты ------------------
const pickName = (obj, fall = "") =>
  obj?.name ?? obj?.title ?? obj?.displayName ?? obj?.display_name ?? fall;

const pickDisplayName = (obj) => obj?.display_name ?? obj?.displayName ?? null;

const s = (v) => (v == null ? null : String(v));

const pickSKU = (obj) => obj?.sku ?? obj?.article ?? obj?.code ?? "—";
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

async function apiDeleteFromCart(variantId, authToken) {
  const headers = {
    "Content-Type": "application/json",
    ...(authToken !== "guest" ? { Authorization: `Bearer ${authToken}` } : {}),
  };
  const vId = Number(variantId);
  
  if (!Number.isFinite(vId)) {
    console.warn("[cart] variantId невалиден:", variantId);
    return false;
  }

  try {
    const r = await fetch(`/api/cart/${encodeURIComponent(vId)}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({
        variantId: vId,
        quantity: 1,
      }),
    });
    if (r.ok) return true;
    console.warn("DELETE /api/cart/:variantId ->", r.status, await safeText(r));
  } catch (e) { console.warn("cart delete path err", e); }

  try {
    const r = await fetch(`/api/cart?variantId=${encodeURIComponent(vId)}`, { method: "DELETE", headers });
    if (r.ok) return true;
    console.warn("DELETE /api/cart?variantId ->", r.status, await safeText(r));
  } catch (e) { console.warn("cart delete query err", e); }

  try {
    const r = await fetch(`/api/cart`, {
      method: "DELETE",
      headers,
      body: JSON.stringify({ variantId: vId, quantity: 1 })
    });
    if (r.ok) return true;
    console.warn("DELETE /api/cart body ->", r.status, await safeText(r));
  } catch (e) { console.warn("cart delete body err", e); }

  return false;
}

/** POST /api/favorites { variantId } */
async function apiAddFavorite(variantId, authToken) {
  const r = await fetch("/api/favorites", {
    method: "POST",
    headers: authHeaders(authToken, { "Content-Type": "application/json" }),
    body: JSON.stringify({ variantId: Number(variantId) }),
  });
  if (r.status === 401) {
    throw new Error("401 Unauthorized");
  }
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
    if (r.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (r.ok) return true;
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
  }

  // 2) DELETE /api/favorites?variantId=...
  try {
    const r = await fetch(`/api/favorites?variantId=${encodeURIComponent(variantId)}`, {
      method: "DELETE",
      headers: authHeaders(authToken),
    });
    if (r.status === 401) {
      throw new Error("401 Unauthorized");
    }
    if (r.ok) return true;
  } catch (e) {
    if (e.message === "401 Unauthorized") throw e;
  }

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
  const [toast, setToast] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  // Функция для показа уведомлений
  const showToast = (msg, ms = 1500) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

  // Функция для обработки ошибок API
  const handleApiError = (err, defaultMessage) => {
    const errorMessage = err.message || "";
    if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
      setAuthToastMessage("Для выполнения этого действия необходимо авторизоваться");
      setShowAuthToast(true);
      return true;
    }
    showToast(defaultMessage, 2000);
    return false;
  };

  // Сохраняем ссылку на каталог с последними фильтрами
  const catalogLink = useMemo(() => {
    const savedQuery = sessionStorage.getItem("catalog:lastQuery");
    return savedQuery ? `/catalog${savedQuery}` : "/catalog";
  }, []);

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

  const brand = useMemo(() => {
    // Проверяем brandDTO (как countryDTOs)
    if (product?.brandDTO) {
      return pickName(product.brandDTO, "—") || "—";
    }
    // Fallback на brand
    if (product?.brand) {
      return pickName(product.brand, "—") || "—";
    }
    return "—";
  }, [product?.brandDTO, product?.brand]);

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

  const description = product?.description ?? "—";
  const guaranteedIndicators = product?.guaranteedIndicators ?? "—";
  const feedingNote = product?.feedingNote ?? "—";

  const handleSelectWeight = useCallback((idx) => {
    if (idx < 0 || idx >= variants.length) return;
    const nextVariantId = variants[idx].id;
    const sp = new URLSearchParams(location.search);
    sp.set("variant", String(nextVariantId));
    navigate(
      `/product/${encodeURIComponent(productId)}?${sp.toString()}`,
      { replace: false }
    );
    setSelectedImageIdx(0);
  }, [variants, location.search, navigate, productId]);

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


  // Функция для изменения количества товара в корзине
  const changeQuantityOnServer = async (variantId, newQuantity) => {
    const headers = {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };

    try {
      // Добавляем товар с нужным количеством
      const res = await fetch("/api/cart", {
        method: "POST",
        headers,
        body: JSON.stringify({
          variantId: Number(variantId),
          quantity: newQuantity,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn("Ошибка при установке количества:", res.status, text);
        return false;
      }

      return true;
    } catch (e) {
      console.warn("Ошибка запроса:", e);
      return false;
    }
  };

  // ---------- добавление в корзину с выбранным количеством ----------
  const handleAddToCart = useCallback(async () => {
    const vid = selectedVariant?.id;
    if (!vid || adding || !available) return;

    // Проверка авторизации
    if (!authToken || authToken === "guest") {
      showToast("Для добавления товара в корзину необходимо авторизоваться", 3000);
      return;
    }

    // Проверка количества в наличии
    if (qty > totalStock) {
      showToast(`В наличии только ${totalStock} шт.`, 3000);
      setQty(totalStock);
      return;
    }

    const vidStr = String(vid);
    const vidNum = Number(vid);

    if (!inCart) {
      // ДОБАВИТЬ
      setAdding(true);
      try {
        const res = await fetch(`/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ variantId: vidNum, quantity: qty }),
        });
        if (!res.ok) {
          const errorText = await safeText(res);
          if (res.status === 401) {
            setAuthToastMessage("Для добавления товара в корзину необходимо авторизоваться");
            setShowAuthToast(true);
            setAdding(false);
            return;
          }
          
          // Проверка на ошибку превышения количества
          if (res.status === 400 || res.status === 422) {
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message && (errorJson.message.includes("stock") || errorJson.message.includes("наличи") || errorJson.message.includes("количеств"))) {
                showToast(errorJson.message || "Недостаточно товара в наличии", 3000);
                setAdding(false);
                return;
              }
              // Если есть другое сообщение об ошибке, показываем его
              if (errorJson.message) {
                showToast(errorJson.message, 3000);
                setAdding(false);
                return;
              }
            } catch {
              // Если не JSON, проверяем текст на наличие ключевых слов
              if (errorText && (errorText.includes("stock") || errorText.includes("наличи") || errorText.includes("количеств"))) {
                showToast("Недостаточно товара в наличии", 3000);
                setAdding(false);
                return;
              }
            }
          }
          
          // Для ошибок сервера показываем понятное сообщение
          if (res.status >= 500) {
            showToast("Ошибка сервера. Попробуйте позже", 3000);
            setAdding(false);
            return;
          }
          
          throw new Error(`HTTP ${res.status} ${errorText}`);
        }

        setInCart(true);
        const cartSet = loadSet(cartKey);
        cartSet.add(vidStr);
        saveSet(cartKey, cartSet);
          window.dispatchEvent(new Event("cart:update"));
          try {
            window.dispatchEvent(new Event("cart:changed"));
          } catch {}
        setQty(1);
        showToast("Товар добавлен в корзину");
      } catch (err) {
        console.warn("Ошибка при добавлении в корзину:", err);
        if (!handleApiError(err, "Не удалось добавить в корзину")) {
        showToast("Не удалось добавить в корзину", 2000);
        }
      } finally {
        setAdding(false);
      }
    } else {
      // УДАЛИТЬ (второй клик по кнопке «В корзине»)
      setAdding(true);
      const ok = await apiDeleteFromCart(vidNum, authToken);
      if (ok) {
        setInCart(false);
        const cartSet = loadSet(cartKey);
        cartSet.delete(vidStr);
        saveSet(cartKey, cartSet);
        setQty(1);
      window.dispatchEvent(new Event("cart:update"));
      try {
        window.dispatchEvent(new Event("cart:changed"));
      } catch {}
        showToast("Товар удалён из корзины");
      } else {
        console.warn("Не удалось удалить из корзины");
        showToast("Не получилось удалить. Повторите позже", 2000);
      }
      setAdding(false);
    }
  }, [selectedVariant?.id, adding, inCart, qty, available, authToken, cartKey, totalStock]);

  // ---------- избранное ----------
  const handleToggleFavorite = async () => {
    const vidStr = String(selectedVariant?.id ?? "");
    if (!vidStr) return;

    // Проверка авторизации
    if (!authToken || authToken === "guest") {
      showToast("Для добавления товара в избранное необходимо авторизоваться", 3000);
      return;
    }

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
      showToast(!nowFav ? "Товар добавлен в избранное" : "Товар удалён из избранного");
    } catch (e) {
      // Проверка на 401
      if (e.message && (e.message.includes("401") || e.message.includes("Unauthorized"))) {
        setAuthToastMessage("Для работы с избранным необходимо авторизоваться");
        setShowAuthToast(true);
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
        return;
      }
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
      showToast("Не удалось изменить избранное", 2000);
    }
  };

  // ---------- загрузочные и ошибочные состояния ----------
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
            <div className="space-y-4 animate-pulse">
              <div className="w-40 h-6 bg-gray-200 rounded" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="bg-gray-200 rounded h-80" />
                <div className="space-y-3">
                  <div className="w-2/3 h-6 bg-gray-200 rounded" />
                  <div className="w-1/3 h-6 bg-gray-200 rounded" />
                  <div className="w-40 h-10 bg-gray-200 rounded" />
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
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-10 md:px-10 lg:px-[84px]">
            <Link
              to={catalogLink}
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
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Каталог", to: "/catalog" },
            { label: title || "Товар" }
          ]} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            {/* Карусель изображений */}
            <div className="flex flex-col w-full">
              <div className="rounded-lg border border-[#E6E6E6] bg-white p-2">
                <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-white h-64 md:h-[360px]">
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
                    className={`overflow-hidden rounded-md ${
                      selectedImageIdx === i
                        ? "ring-2 ring-[#6F2A2B]"
                        : ""
                    } bg-white h-16`}
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

              <div className="flex flex-col items-start gap-0 mt-4 sm:flex-row sm:items-center">
                <div className="text-[24px] font-semibold text-[#1E1E1E] whitespace-nowrap min-w-[120px]">
                  {priceStr}
                </div>
                {/* Счетчик количества */}
                {!inCart && available && (
                  <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E] overflow-hidden flex-shrink-0">
                  <button
                    onClick={() => setQty((n) => Math.max(1, n - 1))}
                      className="h-9 w-9 text-[18px] font-semibold text-[#1E1E1E] rounded-l-full flex items-center justify-center"
                  >
                    –
                  </button>
                    <span className="min-w-[36px] text-center text-[15px] font-medium text-[#1E1E1E] px-2">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((n) => {
                      const newQty = n + 1;
                      if (newQty > totalStock) {
                        showToast(`В наличии только ${totalStock} шт.`, 2000);
                        return totalStock;
                      }
                      return newQty;
                    })}
                      className="h-9 w-9 text-[18px] font-semibold text-[#1E1E1E] rounded-r-full flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                )}
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
                          className={`h-9 rounded-full px-4 text-[12px] transition ${
                            active
                              ? "bg-[#6F2A2B] text-white"
                              : "border border-[#D6D6D6] text-[#1E1E1E]"
                          } ${notAvail ? "opacity-50" : ""}`}
                          title={notAvail ? "Ожидает поступления" : ""}
                          aria-pressed={active}
                          aria-label={notAvail ? `${opt.label} (ожидает поступления)` : opt.label}
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
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={adding}
                    className={`
                      flex items-center justify-center
                      rounded-md text-sm sm:text-[15px]
                      transition-colors
                      px-3 py-[10px]
                      h-11
                      min-w-[110px]
                      w-full sm:w-auto
                      ${
                      inCart
                        ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                        : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                      }
                      ${adding ? "opacity-60 cursor-not-allowed" : ""}
                    `}
                    aria-label={inCart ? "Убрать из корзины" : "Добавить в корзину"}
                  >
                    {inCart ? (
                      <span className="flex items-center justify-center gap-1 leading-none whitespace-nowrap">
                        <Check className="w-4 h-4" />
                        <span>В корзине</span>
                      </span>
                    ) : adding ? (
                      "Добавление..."
                    ) : (
                      `Добавить в корзину ${qty > 1 ? `(${qty} шт.)` : ''}`
                    )}
                  </button>
                ) : (
                  <span className="h-11 inline-flex items-center justify-center rounded-lg px-6 text-[14px] w-full sm:w-auto bg-gray-100 text-gray-500">
                    Ожидает поступления
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
            <CardSection title="Описание" defaultOpen>
              <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                {description}
              </p>
            </CardSection>
            <CardSection title="Гарантируемые показатели" defaultOpen>
              <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
              {guaranteedIndicators}
              </p>
            </CardSection>
            <CardSection title="Нормы кормления" defaultOpen>
              <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                {feedingNote}
              </p>
            </CardSection>
          </div>
        </div>
      </main>
      <Footer />
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
      <AuthToast 
        show={showAuthToast} 
        onClose={() => setShowAuthToast(false)}
        message={authToastMessage}
      />
    </div>
  );
}