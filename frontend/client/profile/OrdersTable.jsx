import { formatDate, formatOrderStatus, formatPaymentStatus, formatPrice } from "@/utils/formatters";

export const OrdersTable = ({ orders, onOpenOrder }) => (
  <div className="mt-3 overflow-x-auto">
    <table className="w-full min-w-[550px]">
      <thead>
        <tr className="text-[#1E1E1E] border-b border-[#E8E8E8]">
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]">Номер</th>
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]">Дата</th>
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]">Сумма</th>
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]">Статус оплаты</th>
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]">Статус</th>
          <th className="py-2 text-center font-normal text-[13px] sm:text-[14px]"></th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} className="border-b border-[#F3F3F3]">
            <td className="py-2 text-center text-[13px] sm:text-[14px]">#{order.id}</td>
            <td className="py-2 text-center text-[13px] sm:text-[14px] text-[#6F6F6F]">{formatDate(order.createdAt)}</td>
            <td className="py-2 text-center text-[13px] sm:text-[14px] text-[#6F6F6F]">{order.totalAmount ? formatPrice(order.totalAmount) : "-"}</td>
            <td className="py-2 text-center">
              <span className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                order.paymentStatus?.toLowerCase() === "paid" ? "bg-green-100 text-green-800" :
                order.paymentStatus?.toLowerCase() === "refunded" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
              }`}>{formatPaymentStatus(order.paymentStatus)}</span>
            </td>
            <td className="py-2 text-center text-[13px] sm:text-[14px] text-[#6F6F6F]">{formatOrderStatus(order.orderStatus)}</td>
            <td className="py-2 text-center">
              <button onClick={() => onOpenOrder(order.id)} className="text-[#6F2A2B] text-[13px] sm:text-[14px] hover:opacity-80">Открыть</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);