import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserOrders } from "@/hooks/useUserOrders";
import { useProfileEditing } from "@/hooks/useProfileEditing";
import { useToast } from "@/hooks/useToast";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { ProfileFormFields } from "@/components/profile/ProfileFormFields";
import { PasswordEditSection } from "@/components/profile/PasswordEditSection";
import { ProfileActions } from "@/components/profile/ProfileActions";
import { OrdersTable } from "@/components/profile/OrdersTable";
import { OrderDetailsDialog } from "@/components/profile/OrderDetailsDialog";

export default function Profile() {
  const navigate = useNavigate();
  const { toast, showToast } = useToast();
  const { user, loading, error, isStaff, isSuperUser, updateField, changePassword } = useUserProfile();
  const { orders, loading: ordersLoading, selectedOrder, orderDetails, detailsLoading, openOrder, closeOrder } = useUserOrders();
  const { editing, startEditing, stopEditing, errors, setFieldError, clearFieldError, passwordData, updatePasswordData } = useProfileEditing();

  const handleFieldChange = (field, rawValue) => {
    const formatted = field === "phone" ? rawValue : rawValue; // форматирование внутри updateField
    if (field === "firstName" || field === "lastName" || field === "middleName") {
      // оптимистично обновляем UI для плавности
      user[field] = rawValue;
    }
    clearFieldError(field);
  };

  const handleFieldBlur = async (field) => {
    const value = user[field];
    if (!value && field !== "middleName") {
      setFieldError(field, "Поле обязательно для заполнения");
      return;
    }
    const result = await updateField(field, value);
    if (!result.success) {
      setFieldError(field, result.error);
      showToast(result.error, 3000);
    } else {
      stopEditing(field);
    }
  };

  const handleToggleEdit = (field) => {
    if (editing[field]) {
      // если уже в режиме редактирования, то сохраняем
      handleFieldBlur(field);
    } else {
      startEditing(field);
    }
  };

  const handlePasswordSave = async () => {
    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword, passwordData.confirmPassword);
    if (result.success) {
      stopEditing("password");
      showToast("Пароль успешно изменён");
    } else {
      setFieldError("password", result.error);
    }
  };

  const handlePasswordCancel = () => {
    stopEditing("password");
    clearFieldError("password");
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-[64px] py-6 sm:py-8">
        <BreadcrumbNav items={[{ label: "Главная", to: "/" }, { label: "Профиль" }]} />
        <PageFade>
          {loading && <div className="py-12 text-center text-gray-500">Загрузка профиля…</div>}
          {!loading && error && <div className="py-12 text-center text-red-600">{error}</div>}
          {!loading && !error && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.2fr]">
              {/* Левая колонка — профиль */}
              <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
                <h2 className="text-[18px] sm:text-[22px] font-semibold text-center">Профиль</h2>
                <ProfileAvatar firstName={user.firstName} />
                <ProfileFormFields
                  user={user}
                  editing={editing}
                  errors={errors}
                  onFieldChange={handleFieldChange}
                  onFieldBlur={handleFieldBlur}
                  onToggle={handleToggleEdit}
                />
                <PasswordEditSection
                  editing={editing}
                  passwordData={passwordData}
                  errors={errors}
                  onPasswordChange={updatePasswordData}
                  onSave={handlePasswordSave}
                  onCancel={handlePasswordCancel}
                />
                <ProfileActions isStaff={isStaff} isSuperUser={isSuperUser} onLogout={handleLogout} />
              </div>

              {/* Правая колонка — заказы */}
              <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
                <h2 className="text-[18px] sm:text-[22px] font-semibold">История заказов</h2>
                {ordersLoading ? (
                  <div className="py-8 text-center text-gray-500">Загрузка заказов…</div>
                ) : orders.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">У вас пока нет заказов</div>
                ) : (
                  <OrdersTable orders={orders} onOpenOrder={openOrder} />
                )}
              </div>
            </div>
          )}
        </PageFade>
      </div>
      <Footer />
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
      <OrderDetailsDialog
        open={!!selectedOrder}
        onClose={closeOrder}
        orderDetails={orderDetails}
        loading={detailsLoading}
      />
    </div>
  );
}