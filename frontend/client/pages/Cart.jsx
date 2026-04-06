import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade, ListMotion, ToastMotion } from "@/utils/PageAnimations";
import { AuthToast } from "@/components/AuthToast";
import { useCart } from "@/hooks/useCart";
import { useCartSelection } from "@/hooks/useCartSelection";
import { useOrderForm } from "@/hooks/useOrderForm";
import { useToast } from "@/hooks/useToast";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { CartItemDesktop } from "@/components/cart/CartItemDesktop";
import { CartItemMobile } from "@/components/cart/CartItemMobile";
import { CartSummary } from "@/components/cart/CartSummary";
import { getAuthToken } from "@/utils/auth";

export default function Cart() {
  const authToken = getAuthToken();
  const { toast, toastType, showToast } = useToast();
  const {
    items, loading, error,
    showAuthToast, authToastMessage, setShowAuthToast,
    changeQuantity, removeItem, refetch,
  } = useCart();

  const {
    selected, toggleAll, toggleOne, isAllSelected,
    selectedItems, totalCount, totalPrice,
  } = useCartSelection(items);

  const {
    payMethod, setPayMethod,
    deliveryMethod, setDeliveryMethod,
    receiver, handleReceiverChange,
    phone, handlePhoneChange,
    address, handleAddressChange,
    customerNotes, setCustomerNotes,
    consent, setConsent,
    errors, submitOrder,
  } = useOrderForm(authToken, selectedItems, 
    () => {
      showToast("Заказ успешно оформлен!");
      setTimeout(() => refetch(), 1500);
    },
    (msg) => showToast(msg, 3000, "error")
  );

  const isEmpty = !loading && items.length === 0;

  const handleIncrease = async (item) => {
    const result = await changeQuantity(item, "inc");
    if (!result.ok && result.error) showToast(result.error, 5000, "error");
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) return;
    const result = await changeQuantity(item, "dec");
    if (!result.ok && result.error) showToast(result.error, 5000, "error");
  };

  const handleRemove = async (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      const ok = await removeItem(item);
      if (!ok) showToast("Не удалось удалить товар", 3000, "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade className="flex flex-col flex-grow">
        <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-[80px] py-8 lg:py-10">
          <BreadcrumbNav items={[{ label: "Главная", to: "/" }, { label: "Корзина" }]} />
          <h1 className="text-[#6F2A2B] text-2xl sm:text-3xl mb-8 lg:mb-20">Ваша корзина</h1>

          {loading && <div className="py-12 text-center text-gray-500">Загрузка…</div>}
          {!loading && error && <div className="py-12 text-center text-red-600">{error}</div>}
          {!loading && !error && isEmpty && <EmptyCart />}

          {!loading && !error && !isEmpty && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
              <div>
                {/* Десктоп шапка */}
                <div className="hidden lg:grid grid-cols-[150px_200px_1fr_200px_150px_60px] items-center border-b pb-2 text-[#1E1E1E]">
                  <div className="flex items-center gap-2 pl-1">
                    <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="accent-[#6F2A2B]" />
                    <span>Выбрать всё</span>
                  </div>
                  <div>Товар</div><div /><div className="text-center">Количество</div>
                  <div className="text-center">Стоимость</div><div className="text-center">Удалить</div>
                </div>

                <div className="mb-3 lg:hidden">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={isAllSelected} onChange={toggleAll} className="accent-[#6F2A2B]" />
                    <span>Выбрать всё</span>
                  </label>
                </div>

                {/* Десктоп строки */}
                <div className="hidden lg:block">
                  {items.map(item => (
                    <CartItemDesktop
                      key={item.id}
                      item={item}
                      selected={selected.has(item.id)}
                      onToggle={toggleOne}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>

                {/* Мобильные карточки */}
                <div className="lg:hidden">
                  <ListMotion
                    items={items}
                    renderItem={item => (
                      <CartItemMobile
                        item={item}
                        selected={selected.has(item.id)}
                        onToggle={toggleOne}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                        onRemove={handleRemove}
                      />
                    )}
                  />
                </div>

                <div className="mt-6">
                  <Link to="/catalog" className="text-[#1E1E1E] hover:text-[#6F2A2B]">← В каталог</Link>
                </div>
              </div>

              <CartSummary
                totalCount={totalCount}
                totalPrice={totalPrice}
                payMethod={payMethod} setPayMethod={setPayMethod}
                deliveryMethod={deliveryMethod} setDeliveryMethod={setDeliveryMethod}
                receiver={receiver} onReceiverChange={handleReceiverChange}
                phone={phone} onPhoneChange={handlePhoneChange}
                address={address} onAddressChange={handleAddressChange}
                customerNotes={customerNotes} setCustomerNotes={setCustomerNotes}
                consent={consent} setConsent={setConsent}
                errors={errors}
                onSubmit={submitOrder}
              />
            </div>
          )}
        </div>

        <ToastMotion show={!!toast} type={toastType}>{toast}</ToastMotion>
        <AuthToast show={showAuthToast} onClose={() => setShowAuthToast(false)} message={authToastMessage} />
      </PageFade>
      <Footer />
    </div>
  );
}