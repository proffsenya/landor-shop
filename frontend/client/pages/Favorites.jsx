import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { PageFade, ListMotion, ToastMotion } from "@/utils/PageAnimations";
import { AnimatePresence } from "framer-motion";
import { AuthToast } from "@/components/AuthToast";

import { getAuthToken } from "@/utils/auth";
import { useFavorites } from "@/hooks/useFavorites";
import { useFavoritesSelection } from "@/hooks/useFavoritesSelection";
import { useToast } from "@/hooks/useToast";
import { EmptyFavorites } from "@/components/favorites/EmptyFavorites";
import { FavoriteItemDesktop } from "@/components/favorites/FavoriteItemDesktop";
import { FavoriteItemMobile } from "@/components/favorites/FavoriteItemMobile";
import { FavoritesHeader } from "@/components/favorites/FavoritesHeader";

const formatPrice = (price) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
  }).format(price);

export default function Favorites() {
  const authToken = getAuthToken();
  const { toast, showToast } = useToast();
  const {
    favorites,
    loading,
    showAuthToast,
    authToastMessage,
    setShowAuthToast,
    removeItems,
    moveToCart,
  } = useFavorites(authToken);

  const {
    selected,
    toggleOne,
    toggleAll,
    isAllSelected,
    selectedIds,
  } = useFavoritesSelection(favorites);

  const isEmpty = !loading && favorites.length === 0;

  const handleRemoveSelected = async () => {
    if (selectedIds.length === 0) return;
    const { succeeded, failed } = await removeItems(selectedIds);
    if (succeeded.size) showToast("Выбранные товары удалены");
    else if (failed.size === selectedIds.length) showToast("Не удалось удалить выбранные", 2000);
    else showToast(`Удалено: ${succeeded.size}, не удалено: ${failed.size}`, 2000);
  };

  const handleMoveSelectedToCart = async () => {
    const selectedVariants = favorites.filter(f => selected.has(f.id)).map(f => f.variantId);
    if (selectedVariants.length === 0) {
      showToast("Выберите товары");
      return;
    }
    const ok = await moveToCart(selectedVariants);
    if (ok) showToast("Добавлено в корзину");
    else showToast("Не удалось добавить в корзину", 2000);
  };

  const handleSingleMoveToCart = async (variantIds) => {
    const ok = await moveToCart(variantIds);
    if (ok) showToast("Перенесено в корзину");
    else showToast("Не удалось добавить", 1800);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade className="flex flex-col flex-grow">
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-[80px] py-6 sm:py-8 lg:py-10">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Избранное" }
          ]} />
          <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-10 lg:mb-20">
            Избранное
          </h1>

          {loading && (
            <div className="flex justify-center py-20 text-lg text-gray-500">
              Загрузка избранного...
            </div>
          )}

          {!loading && isEmpty && <EmptyFavorites />}

          {!loading && favorites.length > 0 && (
            <>
              {/* Mobile */}
              <div className="space-y-4 md:hidden">
                <FavoritesHeader
                  isAllSelected={isAllSelected}
                  onToggleAll={toggleAll}
                  onRemoveSelected={handleRemoveSelected}
                  selectedCount={selectedIds.length}
                  disabledRemove={selectedIds.length === 0}
                />
                <ListMotion
                  items={favorites}
                  renderItem={(item) => (
                    <FavoriteItemMobile
                      key={item.id}
                      item={item}
                      isSelected={selected.has(item.id)}
                      onToggle={toggleOne}
                      onMoveToCart={handleSingleMoveToCart}
                      formatPrice={formatPrice}
                    />
                  )}
                />
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-hidden rounded-lg border border-[#E8E8E8] bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[#1E1E1E] text-[15px] border-b border-[#E8E8E8]">
                        <th className="px-5 py-3 text-left font-normal w-[160px]">
                          <label className="inline-flex items-center gap-2 cursor-pointer">
                            <span>Выбрать все</span>
                            <input
                              type="checkbox"
                              checked={isAllSelected}
                              onChange={toggleAll}
                              className="w-4 h-4 accent-[#6F2A2B]"
                            />
                          </label>
                        </th>
                        <th className="px-5 py-3 font-normal text-left">Товар</th>
                        <th className="px-5 py-3 font-normal text-center">Вес</th>
                        <th className="px-5 py-3 font-normal text-center">Стоимость</th>
                        <th className="px-5 py-3 font-normal text-center">Дата добавления</th>
                        <th className="px-5 py-3 font-normal text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence mode="sync">
                        {favorites.map((item) => (
                          <FavoriteItemDesktop
                            key={item.id}
                            item={item}
                            isSelected={selected.has(item.id)}
                            onToggle={toggleOne}
                            formatPrice={formatPrice}
                          />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Нижняя панель */}
              <div className="flex-col items-stretch justify-between hidden gap-4 mt-6 md:flex sm:flex-row sm:items-center">
                <Link to="/catalog" className="inline-flex items-center justify-center text-[#5A5A5A] hover:text-[#1E1E1E]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  В каталог
                </Link>
                <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                  <button
                    onClick={handleRemoveSelected}
                    className="text-[#B00020] hover:opacity-80 disabled:opacity-40"
                    disabled={selectedIds.length === 0}
                  >
                    Удалить выбранные
                  </button>
                  <button
                    onClick={handleMoveSelectedToCart}
                    className="inline-flex items-center justify-center h-[44px] px-4 rounded-[10px] bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Добавить в корзину
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <ToastMotion show={!!toast}>{toast}</ToastMotion>
        <AuthToast
          show={showAuthToast}
          onClose={() => setShowAuthToast(false)}
          message={authToastMessage}
        />
      </PageFade>
      <Footer />
    </div>
  );
}