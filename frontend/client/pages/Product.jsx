import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { AuthToast } from "@/components/AuthToast";
import { getAuthToken } from "@/utils/auth";
import { useToast } from "@/hooks/useToast";
import { useProductData } from "@/hooks/useProductData";
import { useProductImages } from "@/hooks/useProductImages";
import { useProductVariants } from "@/hooks/useProductVariants";
import { useProductCart } from "@/hooks/useProductCart";
import { useProductFavorites } from "@/hooks/useProductFavorites";
import { ProductImageGallery } from "@/components/product/ProductImageGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductSections } from "@/components/product/ProductSections";
import { ProductSkeleton } from "@/components/product/ProductSkeleton";
import { ProductError } from "@/components/product/ProductError";
import { pickName, pickDisplayName, pickSKU } from "@/utils/productUtils";

export default function Product() {
  const { id: productId } = useParams();
  const authToken = getAuthToken();
  const { toast, showToast } = useToast();
  const catalogLink = sessionStorage.getItem("catalog:lastQuery") ? `/catalog${sessionStorage.getItem("catalog:lastQuery")}` : "/catalog";

  const { product, loading, failed } = useProductData(productId);
  const { variants, selectedIdx, selectedVariant, handleSelectWeight } = useProductVariants(product, productId);
  const { gallery, selectedImageIdx, relevantThumbnails, handleSelectImage } = useProductImages(productId, authToken, selectedVariant?.id);
  const { inCart, adding, qty, setQty, toggleCart } = useProductCart(selectedVariant?.id, authToken, selectedVariant?.raw?.stock ?? 0);
  const { isFav, toggleFavorite } = useProductFavorites(selectedVariant?.id, authToken);

  if (loading) return <><Header /><ProductSkeleton /><Footer /></>;
  if (failed || !product) return <><Header /><ProductError catalogLink={catalogLink} /><Footer /></>;

  const title = (() => {
    const variantName = selectedVariant?.raw?.display_name ?? selectedVariant?.raw?.displayName;
    if (variantName) return variantName;
    return pickDisplayName(product) ?? pickName(product, "Товар");
  })();
  const priceStr = `${(selectedVariant?.price ?? product?.price ?? 0).toLocaleString("ru-RU")}₽`;
  const brand = product?.brandDTO ? pickName(product.brandDTO, "—") : (product?.brand ? pickName(product.brand, "—") : "—");
  const tastesText = (() => {
    const flavors = Array.isArray(product?.flavorIds) ? product.flavorIds : (Array.isArray(product?.flavors) ? product.flavors : []);
    return flavors.map(f => pickName(f)).filter(Boolean).join(", ") || "—";
  })();
  const scentsText = (() => {
    if (!selectedVariant?.raw) return "—";
    const scents = selectedVariant.raw.scentIds || selectedVariant.raw.scentDTOs || [];
    if (!Array.isArray(scents)) return "—";
    return scents.map(s => pickName(s)).filter(Boolean).join(", ") || "—";
  })();
  const isFiller = product?.productTypeId === 2 || product?.productType?.id === 2;
  const countryText = (() => {
    const countries = Array.isArray(product?.countryDTOs) ? product.countryDTOs : (Array.isArray(product?.countries) ? product.countries : []);
    return countries.map(c => pickName(c)).filter(Boolean).join(" / ") || "—";
  })();
  const skuText = pickSKU(selectedVariant?.raw) || pickSKU(product) || "—";
  const weightLabel = selectedVariant?.label || "—";
  const totalStock = Number(selectedVariant?.raw?.stock ?? product?.stock ?? 0);
  const available = totalStock > 0;
  const stockText = available ? "Есть в наличии" : "Нет в наличии";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Каталог", to: catalogLink },
            { label: title || "Товар" }
          ]} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <ProductImageGallery
              gallery={gallery}
              selectedImageIdx={selectedImageIdx}
              relevantThumbnails={relevantThumbnails}
              onSelectImage={handleSelectImage}
            />
            <ProductInfo
              title={title}
              priceStr={priceStr}
              variants={variants}
              selectedIdx={selectedIdx}
              onSelectWeight={handleSelectWeight}
              available={available}
              totalStock={totalStock}
              inCart={inCart}
              adding={adding}
              qty={qty}
              setQty={setQty}
              onToggleCart={toggleCart}
              isFav={isFav}
              onToggleFav={toggleFavorite}
              skuText={skuText}
              countryText={countryText}
              isFiller={isFiller}
              scentsText={scentsText}
              tastesText={tastesText}
              weightLabel={weightLabel}
              stockText={stockText}
            />
          </div>

          <ProductSections
            description={product?.description ?? "—"}
            guaranteedIndicators={product?.guaranteedIndicators ?? "—"}
            feedingNote={product?.feedingNote ?? "—"}
          />
        </div>
      </main>
      <Footer />
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
      <AuthToast show={false} onClose={() => {}} message="" />
    </div>
  );
}