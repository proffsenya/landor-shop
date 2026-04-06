import { useState, useEffect } from "react";
import { fetchUserOrders, fetchOrderDetails } from "@/services/orderService";

export const useUserOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchUserOrders();
      const normalized = (Array.isArray(data) ? data : []).map(order => ({
        ...order,
        orderStatus: normalizeStatus(order.orderStatus),
        paymentStatus: normalizeStatus(order.paymentStatus),
      }));
      normalized.sort((a, b) => (b.createdAt ? new Date(b.createdAt) : b.id || 0) - (a.createdAt ? new Date(a.createdAt) : a.id || 0));
      setOrders(normalized);
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOrderDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const data = await fetchOrderDetails(orderId);
      setOrderDetails({
        ...data,
        orderStatus: normalizeStatus(data.orderStatus),
        paymentStatus: normalizeStatus(data.paymentStatus),
      });
    } catch {
      setOrderDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const openOrder = async (orderId) => {
    setSelectedOrder(orderId);
    await loadOrderDetails(orderId);
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // слушатель обновления статуса заказа из админки
  useEffect(() => {
    const handler = (event) => {
      const { orderId, newStatus } = event.detail;
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: normalizeStatus(newStatus) } : o));
      if (selectedOrder === orderId && orderDetails) {
        setOrderDetails(prev => ({ ...prev, orderStatus: normalizeStatus(newStatus) }));
      }
    };
    window.addEventListener("order:status-updated", handler);
    return () => window.removeEventListener("order:status-updated", handler);
  }, [selectedOrder, orderDetails]);

  return { orders, loading, selectedOrder, orderDetails, detailsLoading, openOrder, closeOrder, refetch: loadOrders };
};

function normalizeStatus(status) {
  if (!status) return status;
  let s = String(status).trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);
  if (s.startsWith("'") && s.endsWith("'")) s = s.slice(1, -1);
  return s;
}