// client/components/ProductsSection.jsx
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

// ---------- utils ----------
const todayKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `productsSection:variants:${yyyy}${mm}${dd}`; // ежедневный ключ
};

// детерминированный shuffle (чтоб весь день были одни и те же)
function seededShuffle(arr, seed = 1) {
  const a = arr.slice();
  let s = seed || 1;
  const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// выбираем 5 случайных уникальных вариантов (без дубликатов)
function selectFiveRandomVariants(cards, seed = 1) {
  if (!Array.isArray(cards) || cards.length === 0) return [];
  // перемешиваем и берем максимум 5 уникальных вариантов
  const shuffled = seededShuffle(cards, seed);
  // убираем дубликаты по комбинации productId:variantId
  const unique = [];
  const seen = new Set();
  for (const card of shuffled) {
    const key = `${card.productId}:${card.variantId}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(card);
      if (unique.length >= 5) break;
    }
  }
  return unique;
}

// безопасно достаём картинку варианта (как в каталоге)
function getFirstImage(product) {
  const images =
    (Array.isArray(product?.images) && product.images) ||
    (Array.isArray(product?.productImageDTOs) && product.productImageDTOs) ||
    [];

  const first =
    images.find((img) => {
      if (typeof img === "string") return true;
      return img?.url || img?.path || img?.src;
    }) || null;

  if (!first) return "/korm1.svg";
  if (typeof first === "string") return first;
  return first.url || first.path || first.src || "/korm1.svg";
}

function resolveImageUrl(product, variant) {
  // приоритет: variant.imageUrl -> первая картинка продукта (как в каталоге)
  const firstImage = getFirstImage(product);
  
  // если у варианта есть своя картинка, используем её
  if (variant?.imageUrl && typeof variant.imageUrl === "string" && variant.imageUrl.length > 0) {
    return variant.imageUrl;
  }
  
  // иначе используем первую картинку продукта
  return firstImage;
}

// как в каталоге: разворачиваем продукт в карточки по каждому варианту
function expandProductToVariantCards(product) {
  const pid = Number(product?.id ?? product?.productId ?? NaN);
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  return variants.map((v, idx) => {
    const vid = Number(v?.id ?? v?.variantId ?? idx);
    const stock = Number(v?.stock ?? v?.quantity ?? product?.stock ?? 0);
    const price = Number(v?.price ?? product?.price ?? 0);

    // заголовок: вариантное имя > имя продукта
    const vName =
      v?.display_name || v?.displayName || v?.name || v?.title || null;
    const pName =
      product?.display_name ||
      product?.displayName ||
      product?.name ||
      product?.title ||
      "Товар";

    // вес/ярлык
    const weight =
      typeof v?.weight === "number"
        ? `${(v.weight % 1 === 0 ? v.weight : v.weight.toFixed(3))} кг`
        : v?.weight || "—";

    const image = resolveImageUrl(product, v);

    return {
      // ВАЖНО: id включает и product, и variant
      id: `${pid}:${vid}`,
      productId: pid,
      variantId: vid,
      image,
      title: vName || pName,
      price: `${price.toLocaleString("ru-RU")} ₽`,
      stock,
      weight,
      // ссылка сразу с выбранным вариантом
      to: `/product/${encodeURIComponent(pid)}?variant=${encodeURIComponent(vid)}`,
    };
  });
}

export default function ProductsSection({ title, linkText = "Все товары" }) {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // 1) кэш на день
      const key = todayKey();
      const cached = sessionStorage.getItem(key);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length) {
            setCards(parsed.slice(0, 5));
            return;
          }
        } catch {}
      }

      // 2) тянем продукты из бэка (любую твою «полную» ручку с variants)
      // если у тебя другая — поменяй ниже url
      let data = [];
      try {
        const res = await fetch("/api/products"); // <- список продуктов с variants
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (e) {
        // попробуем альтернативу, если у тебя есть
        try {
          const res2 = await fetch("/api/products/cards");
          if (!res2.ok) throw new Error(`HTTP ${res2.status}`);
          data = await res2.json();
        } catch (e2) {
          console.warn("[ProductsSection] fetch error", e, e2);
          data = [];
        }
      }

      // 3) разворачиваем в варианты
      const allVariantCards = (Array.isArray(data) ? data : [])
        .flatMap(expandProductToVariantCards)
        // фильтры на всякий - только валидные варианты
        .filter((x) => Number.isFinite(x.productId) && Number.isFinite(x.variantId));

      // 4) выбираем 5 случайных уникальных вариантов
      const seed = Number(todayKey().slice(-8)) || 1;
      const fresh = selectFiveRandomVariants(allVariantCards, seed);

      if (!mounted) return;
      setCards(fresh);

      // 5) кладём в кэш на день
      try {
        sessionStorage.setItem(key, JSON.stringify(fresh));
      } catch {}
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-10 bg-white sm:py-12 md:py-16">
      <div className="container px-3 mx-auto sm:px-4 md:px-6">
        <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl text-[#6F2A2B] text-center sm:text-left">
            {title}
          </h2>
          <a
            href="/catalog"
            className="text-sm sm:text-base text-[#6F2A2B] hover:opacity-70 text-center sm:text-right"
          >
            {linkText}
          </a>
        </div>

        {/* Ровно 5 карточек вариантов */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((c) => (
            <ProductCard
              key={c.id}
              productId={c.productId}
              variantId={c.variantId}
              image={c.image}
              title={c.title}
              price={c.price}
              stock={c.stock}
              to={c.to}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
