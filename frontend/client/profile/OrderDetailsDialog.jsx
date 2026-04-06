import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatOrderStatus, formatPaymentStatus, formatPrice, formatWeight, formatPhone } from "@/utils/formatters";
import { DEFAULT_PAYMENT_QR } from "@/constants/profileConstants";

export const OrderDetailsDialog = ({ open, onClose, orderDetails, loading }) => (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>Заказ №{orderDetails?.id}</DialogTitle></DialogHeader>
      {loading ? (
        <div className="py-8 text-center text-gray-500">Загрузка деталей заказа…</div>
      ) : orderDetails ? (
        <div className="space-y-6">
          {/* Общая информация */}
          <div className="pb-4 border-b">
            <h3 className="mb-3 text-lg font-semibold">Общая информация</h3>
            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
              <div><span className="text-[#6F6F6F]">Статус заказа:</span> <span className="ml-2 font-medium">{formatOrderStatus(orderDetails.orderStatus)}</span></div>
              <div><span className="text-[#6F6F6F]">Статус оплаты:</span> <span className="ml-2 font-medium">{formatPaymentStatus(orderDetails.paymentStatus)}</span></div>
              <div><span className="text-[#6F6F6F]">Метод оплаты:</span> <span className="ml-2 font-medium">{orderDetails.paymentMethod || "-"}</span></div>
              <div><span className="text-[#6F6F6F]">Способ доставки:</span> <span className="ml-2 font-medium">{orderDetails.deliveryMethod || "-"}</span></div>
              <div><span className="text-[#6F6F6F]">Дата создания:</span> <span className="ml-2 font-medium">{formatDate(orderDetails.createdAt)}</span></div>
              <div><span className="text-[#6F6F6F]">Сумма заказа:</span> <span className="ml-2 font-medium">{orderDetails.totalAmount ? formatPrice(orderDetails.totalAmount) : "-"}</span></div>
            </div>
          </div>
          {/* Товары */}
          {orderDetails.items?.length > 0 && (
            <div className="pb-4 border-b">
              <h3 className="mb-3 text-lg font-semibold">Товары</h3>
              <div className="space-y-3">
                {orderDetails.items.map(item => (
                  <div key={item.id} className="flex justify-between p-3 rounded-lg bg-gray-50">
                    <div><div className="font-medium">{item.productName}</div><div className="text-sm text-[#6F6F6F]">Количество: {item.quantity}</div>{item.weight && <div className="text-sm text-[#6F6F6F]">Вес: {formatWeight(item.weight)}</div>}</div>
                    <div className="font-medium">{item.totalPrice ? formatPrice(item.totalPrice) : "-"}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Адрес доставки */}
          {orderDetails.shippingAddress && (
            <div className="pb-4 border-b">
              <h3 className="mb-3 text-lg font-semibold">Адрес доставки</h3>
              <div className="space-y-1 text-sm">
                {orderDetails.shippingAddress.name && <div><strong>Получатель:</strong> {orderDetails.shippingAddress.name}</div>}
                {orderDetails.shippingAddress.phone && <div><strong>Телефон:</strong> {orderDetails.shippingAddress.phone}</div>}
                {orderDetails.shippingAddress.street && <div><strong>Адрес:</strong> {orderDetails.shippingAddress.street}</div>}
              </div>
            </div>
          )}
          {/* Информация о клиенте */}
          {orderDetails.customerSnapshot && Object.keys(orderDetails.customerSnapshot).length > 0 && (
            <div className="pb-4 border-b">
              <h3 className="mb-3 text-lg font-semibold">Информация о клиенте</h3>
              <div className="space-y-1 text-sm">
                {orderDetails.customerSnapshot.last_name && <div><strong>Фамилия:</strong> {orderDetails.customerSnapshot.last_name}</div>}
                {orderDetails.customerSnapshot.first_name && <div><strong>Имя:</strong> {orderDetails.customerSnapshot.first_name}</div>}
                {orderDetails.customerSnapshot.middle_name && <div><strong>Отчество:</strong> {orderDetails.customerSnapshot.middle_name}</div>}
                {orderDetails.customerSnapshot.email && <div><strong>Email:</strong> {orderDetails.customerSnapshot.email}</div>}
                {orderDetails.customerSnapshot.phone && <div><strong>Телефон:</strong> {formatPhone(orderDetails.customerSnapshot.phone)}</div>}
              </div>
            </div>
          )}
          {/* Оплата */}
          <div>
            <div className="p-3 mt-4 mb-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-xs text-blue-800"><strong>Важно:</strong> Оплата производится только после подтверждения заказа администратором. Ожидайте, скоро с вами свяжутся.</p>
            </div>
            <h3 className="mb-4 text-lg font-semibold">Оплата заказа</h3>
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <div className="flex-1">
                <h4 className="mb-3 text-base font-medium">Инструкция по оплате:</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Откройте приложение вашего банка на смартфоне</li>
                  <li>Найдите раздел "Переводы" или "Платежи"</li>
                  <li>Выберите "Оплата по QR-коду" или "Сканировать QR"</li>
                  <li>Отсканируйте QR-код, изображенный справа</li>
                  <li>Введите сумму заказа и подтвердите оплату</li>
                  <li>Ожидайте изменения статуса платежа.</li>
                </ol>
              </div>
              <div className="flex justify-center flex-1">
                <img src={DEFAULT_PAYMENT_QR} alt="QR код для оплаты через СБП" className="object-contain w-64 h-64" onError={(e) => e.currentTarget.style.display = "none"} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center text-gray-500">Не удалось загрузить детали заказа</div>
      )}
    </DialogContent>
  </Dialog>
);