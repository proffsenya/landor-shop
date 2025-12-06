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

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      pending: "Ожидает обработки",
      processing: "В обработке",
      shipped: "Отправлен",
      delivered: "Доставлен",
      cancelled: "Отменен",
      canceled: "Отменен", // альтернативное написание
    };
    
    const translated = statusMap[normalizedStatus];
    if (!translated) {
      safeWarn("[AdminOrders] Unknown order status:", status, "normalized:", normalizedStatus);
      return status; // Возвращаем оригинальный статус, если не найден перевод
    }
    
    return translated;
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(newStatus),
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
        
        // Перезагружаем заказы для синхронизации с сервером
        loadOrders();
      } else {
        const errorText = await res.text();
        alert(`Ошибка при обновлении статуса: ${errorText || res.statusText}`);
      }
    } catch (e) {
      safeError("Error updating order status:", e);
      alert("Ошибка при обновлении статуса");
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
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Заказы</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Клиент</th>
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
                      <tr key={order.id}>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                            <span className="truncate block max-w-[200px]" title={
                              order.customerSnapshot?.email || 
                              order.customerSnapshot?.phone || 
                              (order.customerSnapshot?.first_name && order.customerSnapshot?.last_name 
                                ? `${order.customerSnapshot.last_name} ${order.customerSnapshot.first_name}` 
                                : "-")
                            }>
                          {order.customerSnapshot?.email || 
                           order.customerSnapshot?.phone || 
                           (order.customerSnapshot?.first_name && order.customerSnapshot?.last_name 
                             ? `${order.customerSnapshot.last_name} ${order.customerSnapshot.first_name}` 
                             : "-")}
                            </span>
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
                            value={order.orderStatus?.toLowerCase() || "pending"}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className="text-xs sm:text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] w-full sm:w-auto"
                          >
                            <option value="pending">Ожидает</option>
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

            {selectedOrder && (
              <OrderModal
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onUpdateStatus={updateOrderStatus}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function OrderModal({ order, onClose, onUpdateStatus }) {
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
      pending: "Ожидает обработки",
      processing: "В обработке",
      shipped: "Отправлен",
      delivered: "Доставлен",
      cancelled: "Отменен",
      canceled: "Отменен", // альтернативное написание
    };
    
    const translated = statusMap[normalizedStatus];
    if (!translated) {
      safeWarn("[OrderModal] Unknown order status:", status, "normalized:", normalizedStatus);
      return status; // Возвращаем оригинальный статус, если не найден перевод
    }
    
    return translated;
  };

  // Форматирование статуса оплаты
  const formatPaymentStatus = (status) => {
    const statusMap = {
      pending: "Ожидает оплаты",
      paid: "Оплачен",
      failed: "Ошибка оплаты",
      refunded: "Возвращен",
    };
    return statusMap[status?.toLowerCase()] || status || "-";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          </div>
        </div>
      </div>
    </div>
  );
}

