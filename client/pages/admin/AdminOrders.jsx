import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { checkAdminAccess, getAdminToken } from "@/utils/adminAuth";

export default function AdminOrders() {
  const navigate = useNavigate();
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const { isSuperUser: superUser, hasAccess } = checkAdminAccess();

    if (!hasAccess) {
      navigate("/admin/login");
      return;
    }

    setIsSuperUser(superUser);
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error loading orders:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const adminToken = getAdminToken();
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        loadOrders();
        setSelectedOrder(null);
      } else {
        alert("Ошибка при обновлении статуса");
      }
    } catch (e) {
      console.error("Error updating order status:", e);
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
      <AdminHeader isSuperUser={isSuperUser} />
      <div className="flex">
        <AdminSidebar isSuperUser={isSuperUser} />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Заказы</h1>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        Нет заказов
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {order.customerSnapshot?.email || order.customerEmail || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Intl.NumberFormat("ru-RU", {
                            style: "currency",
                            currency: "RUB",
                          }).format(order.totalAmount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={order.orderStatus || "PENDING"}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="text-sm px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
                          >
                            <option value="PENDING">Ожидает</option>
                            <option value="PROCESSING">В обработке</option>
                            <option value="SHIPPED">Отправлен</option>
                            <option value="DELIVERED">Доставлен</option>
                            <option value="CANCELLED">Отменен</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-[#6F2A2B] hover:text-[#5a2223]"
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Заказ #{order.id}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Информация о заказе</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Дата:</span> {new Date(order.createdAt).toLocaleString("ru-RU")}</p>
                <p><span className="font-medium">Статус:</span> {order.orderStatus}</p>
                <p><span className="font-medium">Сумма:</span> {new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                }).format(order.totalAmount || 0)}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Товары</h3>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4 flex justify-between">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-gray-500">Количество: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      {new Intl.NumberFormat("ru-RU", {
                        style: "currency",
                        currency: "RUB",
                      }).format(item.totalPrice || 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Адрес доставки</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p>{order.shippingAddress?.fullAddress || order.shippingAddress?.city || "-"}</p>
              </div>
            </div>

            {order.customerNotes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Примечания клиента</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>{order.customerNotes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

