import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";
import { initNotifications } from "@/utils/notifications";
import { formatPhone } from "@/utils/formatting";
import { safeError, safeWarn } from "@/utils/logger";
import { ToastMotion } from "@/utils/PageAnimations";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", show: false });
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false);

  useEffect(() => {
    const { isStaff: staff, isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadOrders();

    // Инициализируем систему уведомлений
    const adminToken = getAdminToken();
    if (adminToken && (staff || superUser)) {
      initNotifications(adminToken, staff, superUser).catch((e) => {
        safeError("Error initializing notifications:", e);
      });
    }
  }, [navigate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast({ message: "", type: "success", show: false }), 3000);
  };

  const loadOrders = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data) ? data : [];
        // Нормализуем статусы заказов при загрузке
        const normalizedOrders = ordersList.map(order => ({
          ...order,
          orderStatus: order.orderStatus ? String(order.orderStatus).trim().replace(/^["']|["']$/g, '') : order.orderStatus
        }));
        setOrders(normalizedOrders);
      } else {
        safeError("Failed to load orders:", res.status);
      }
    } catch (e) {
      safeError("Error loading orders:", e);
    } finally {
      setLoading(false);
    }
  };

  // Функция форматирования ФИО клиента
  const formatCustomerName = (customerSnapshot) => {
    if (!customerSnapshot) return "-";
    const parts = [];
    if (customerSnapshot.last_name) parts.push(customerSnapshot.last_name);
    if (customerSnapshot.first_name) parts.push(customerSnapshot.first_name);
    if (customerSnapshot.middle_name) parts.push(customerSnapshot.middle_name);
    return parts.length > 0 ? parts.join(" ") : "-";
  };

  // Функция перевода статуса заказа на русский
  const formatOrderStatus = (status) => {
    if (!status) return "-";
    
    // Убираем кавычки, если они есть
    let cleanStatus = String(status).trim();
    if (cleanStatus.startsWith('"') && cleanStatus.endsWith('"')) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    if (cleanStatus.startsWith("'") && cleanStatus.endsWith("'")) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    
    const normalizedStatus = cleanStatus.toLowerCase().trim();
    const statusMap = {
      created: "Создан",
      processing: "В обработке",
      shipped: "Отправлен",
      delivered: "Доставлен",
      cancelled: "Отменен",
    };
    
    const translated = statusMap[normalizedStatus];
    if (!translated) {
      safeWarn("[AdminOrders] Unknown order status:", status, "normalized:", normalizedStatus);
      return cleanStatus || "-"; // Возвращаем очищенный статус или "-", если не найден перевод
    }
    
    return translated;
  };

  const loadUnpaidOrders = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/admin/payments/unpaid", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        const ordersList = Array.isArray(data) ? data : [];
        // Нормализуем статусы заказов при загрузке
        const normalizedOrders = ordersList.map(order => ({
          ...order,
          orderStatus: order.orderStatus ? String(order.orderStatus).trim().replace(/^["']|["']$/g, '') : order.orderStatus
        }));
        setOrders(normalizedOrders);
      } else {
        safeError("Failed to load unpaid orders:", res.status);
        showToast("Ошибка при загрузке неоплаченных заказов", "error");
      }
    } catch (e) {
      safeError("Error loading unpaid orders:", e);
      showToast("Ошибка при загрузке неоплаченных заказов", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/payments/${orderId}/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderStatus: newStatus }),
      });

      if (res.ok) {
        // Обновляем локальное состояние сразу для мгновенного отображения
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, orderStatus: newStatus }
              : order
          )
        );
        
        // Обновляем selectedOrder, если он открыт
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
        
        // Отправляем событие для обновления профиля пользователя
        window.dispatchEvent(new CustomEvent("order:status-updated", {
          detail: { orderId, newStatus }
        }));
        
        showToast("Статус заказа успешно обновлен");
        
        // Перезагружаем заказы для синхронизации с сервером
        if (showUnpaidOnly) {
          loadUnpaidOrders();
        } else {
          loadOrders();
        }
      } else {
        const errorText = await res.text();
        showToast(`Ошибка при обновлении статуса: ${errorText || res.statusText}`, "error");
      }
    } catch (e) {
      safeError("Error updating order status:", e);
      showToast("Ошибка при обновлении статуса", "error");
    }
  };

  const confirmPayment = async (orderId, amount, paymentMethod) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/admin/payments/${orderId}/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderId: orderId,
          amount: amount,
          paymentMethod: paymentMethod,
        }),
      });

      if (res.ok) {
        // Обновляем локальное состояние
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId
              ? { ...order, paymentStatus: "paid" }
              : order
          )
        );
        
        // Обновляем selectedOrder, если он открыт
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, paymentStatus: "paid" });
        }
        
        showToast("Оплата успешно подтверждена");
        
        // Перезагружаем заказы для синхронизации с сервером
        if (showUnpaidOnly) {
          loadUnpaidOrders();
        } else {
          loadOrders();
        }
      } else {
        const errorText = await res.text();
        showToast(`Ошибка при подтверждении оплаты: ${errorText || res.statusText}`, "error");
      }
    } catch (e) {
      safeError("Error confirming payment:", e);
      showToast("Ошибка при подтверждении оплаты", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader 
        isSuperUser={isSuperUser} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex">
        <AdminSidebar 
          isSuperUser={isSuperUser} 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full lg:w-auto">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Заказы</h1>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnpaidOnly}
                  onChange={(e) => {
                    setShowUnpaidOnly(e.target.checked);
                    setLoading(true);
                    if (e.target.checked) {
                      loadUnpaidOrders();
                    } else {
                      loadOrders();
                    }
                  }}
                  className="w-4 h-4 accent-[#6F2A2B]"
                />
                <span className="text-sm sm:text-base text-gray-700">Только неоплаченные</span>
              </label>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500">
                        Нет заказов
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-[250px]">
                              <div className="font-medium truncate" title={formatCustomerName(order.customerSnapshot)}>
                                {formatCustomerName(order.customerSnapshot)}
                              </div>
                              {order.customerSnapshot?.phone && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatPhone(order.customerSnapshot.phone)}
                                </div>
                              )}
                            </div>
                        </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900">
                          {new Intl.NumberFormat("ru-RU", {
                            style: "currency",
                            currency: "RUB",
                          }).format(order.totalAmount || 0)}
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm text-gray-700 min-w-[100px] font-medium">
                              {formatOrderStatus(order.orderStatus)}
                            </span>
                          <select
                            value={order.orderStatus?.toLowerCase() || "created"}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] w-full sm:w-auto"
                          >
                            <option value="created">Создан</option>
                            <option value="processing">В обработке</option>
                            <option value="shipped">Отправлен</option>
                            <option value="delivered">Доставлен</option>
                            <option value="cancelled">Отменен</option>
                          </select>
                          </div>
                        </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                              className="text-[#6F2A2B] hover:text-[#5a2223] p-1"
                              title="Просмотр"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              </div>
            </div>
            
            <ToastMotion show={toast.show} type={toast.type}>
              {toast.message}
            </ToastMotion>
          </div>
        </main>
      </div>
    </div>
  );
}

function OrderModal({ order, onClose, onUpdateStatus, onConfirmPayment }) {
  // Форматирование статуса заказа
  const formatOrderStatus = (status) => {
    if (!status) return "-";
    
    // Убираем кавычки, если они есть
    let cleanStatus = String(status).trim();
    if (cleanStatus.startsWith('"') && cleanStatus.endsWith('"')) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    if (cleanStatus.startsWith("'") && cleanStatus.endsWith("'")) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    
    const normalizedStatus = cleanStatus.toLowerCase().trim();
    const statusMap = {
      created: "Создан",
      processing: "В обработке",
      shipped: "Отправлен",
      delivered: "Доставлен",
      cancelled: "Отменен",
    };
    
    const translated = statusMap[normalizedStatus];
    if (!translated) {
      safeWarn("[OrderModal] Unknown order status:", status, "normalized:", normalizedStatus);
      return cleanStatus || "-"; // Возвращаем очищенный статус или "-", если не найден перевод
    }
    
    return translated;
  };

  // Форматирование статуса оплаты
  const formatPaymentStatus = (status) => {
    if (!status) return "-";
    
    // Убираем кавычки, если они есть
    let cleanStatus = String(status).trim();
    if (cleanStatus.startsWith('"') && cleanStatus.endsWith('"')) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    if (cleanStatus.startsWith("'") && cleanStatus.endsWith("'")) {
      cleanStatus = cleanStatus.slice(1, -1);
    }
    
    const normalizedStatus = cleanStatus.toLowerCase().trim();
    const statusMap = {
      paid: "Оплачен",
      refunded: "Возвращен",
      unpaid: "Не оплачен",
    };
    
    const translated = statusMap[normalizedStatus];
    return translated || cleanStatus || "-";
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Заказ #{order.id}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Общая информация */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Информация о заказе</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Дата создания:</span> {order.createdAt ? new Date(order.createdAt).toLocaleString("ru-RU") : "-"}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Статус заказа:</span> {formatOrderStatus(order.orderStatus)}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Статус оплаты:</span> {formatPaymentStatus(order.paymentStatus)}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Метод оплаты:</span> {order.paymentMethod || "-"}
                </p>
                <p className="text-sm sm:text-base">
                  <span className="font-medium">Сумма:</span> {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  }).format(order.totalAmount || 0)}
                </p>
              </div>
            </div>

            {/* Информация о клиенте */}
            {order.customerSnapshot && Object.keys(order.customerSnapshot).length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Информация о клиенте</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                  {order.customerSnapshot.last_name && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Фамилия:</span> {order.customerSnapshot.last_name}
                    </p>
                  )}
                  {order.customerSnapshot.first_name && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Имя:</span> {order.customerSnapshot.first_name}
                    </p>
                  )}
                  {order.customerSnapshot.middle_name && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Отчество:</span> {order.customerSnapshot.middle_name}
                    </p>
                  )}
                  {order.customerSnapshot.email && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Email:</span> {order.customerSnapshot.email}
                    </p>
                  )}
                  {order.customerSnapshot.phone && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Телефон:</span> {formatPhone(order.customerSnapshot.phone)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Товары */}
            {order.items && order.items.length > 0 && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Товары</h3>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id || item.productId} className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between gap-2">
                      <div>
                        <p className="text-sm sm:text-base font-medium">{item.productName || "-"}</p>
                        <p className="text-xs sm:text-sm text-gray-500">Количество: {item.quantity || 0}</p>
                        {item.productId && (
                          <p className="text-xs sm:text-sm text-gray-500">ID товара: {item.productId}</p>
                        )}
                      </div>
                      <p className="text-sm sm:text-base font-medium">
                        {new Intl.NumberFormat("ru-RU", {
                          style: "currency",
                          currency: "RUB",
                        }).format(item.totalPrice || 0)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Адрес доставки */}
            {order.shippingAddress && (
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Адрес доставки</h3>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                  {order.shippingAddress.name && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Получатель:</span> {order.shippingAddress.name}
                    </p>
                  )}
                  {order.shippingAddress.phone && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Телефон:</span> {formatPhone(order.shippingAddress.phone)}
                    </p>
                  )}
                  {order.shippingAddress.street && (
                    <p className="text-sm sm:text-base">
                      <span className="font-medium">Адрес:</span> {order.shippingAddress.street}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Управление заказом */}
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">Управление заказом</h3>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Изменить статус заказа:
                  </label>
                  <select
                    value={order.orderStatus?.toLowerCase() || "created"}
                    onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] text-sm"
                  >
                    <option value="created">Создан</option>
                    <option value="processing">В обработке</option>
                    <option value="shipped">Отправлен</option>
                    <option value="delivered">Доставлен</option>
                    <option value="cancelled">Отменен</option>
                  </select>
                </div>
                
                {/* Кнопка подтверждения оплаты */}
                {order.paymentStatus?.toLowerCase() !== "paid" && (
                  <div>
                    <Button
                      onClick={() => {
                        const paymentMethod = order.paymentMethod || "наличными";
                        const amount = order.totalAmount || 0;
                        onConfirmPayment(order.id, amount, paymentMethod);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Подтвердить оплату
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

