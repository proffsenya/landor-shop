import { Trash2 } from "lucide-react";
import { fmtMoney } from "@/utils/cartUtils";

export const CartItemDesktop = ({ item, selected, onToggle, onIncrease, onDecrease, onRemove }) => {
  const isOutOfStock = item.stock > 0 && item.quantity >= item.stock;
  return (
    <div className="border-b border-[#E2E2E2] py-4 lg:py-6">
      <div className="grid grid-cols-[50px_110px_1fr_200px_150px_60px] items-center">
        <div className="pl-1">
          <input type="checkbox" checked={selected} onChange={() => onToggle(item.id)} className="w-4 h-4 accent-[#6F2A2B]" />
        </div>
        <div className="pl-4">
          <img src={item.image} alt={item.name} className="w-[80px] h-[110px] object-contain" onError={(e) => (e.currentTarget.src = "/korm1.svg")} />
        </div>
        <div className="pl-2">
          <p className="text-[15px] text-[#1E1E1E] leading-tight">{item.name}</p>
          {item.weight && <p className="text-sm text-[#7A7A7A] mt-2">Вес: {item.weight}</p>}
        </div>
        <div className="flex justify-center">
          <div className="flex items-center justify-between w-[120px] h-[38px] border border-[#1E1E1E] rounded-full text-[16px]">
            <button onClick={() => onIncrease(item)} disabled={isOutOfStock} className={`w-10 text-lg ${isOutOfStock ? "opacity-50 cursor-not-allowed" : "hover:opacity-70"}`}>+</button>
            <span>{item.quantity}</span>
            <button onClick={() => onDecrease(item)} className="w-10 text-lg hover:opacity-70">–</button>
          </div>
        </div>
        <div className="text-center text-[#6F2A2B] text-[16px]">{fmtMoney(item.price * item.quantity)}</div>
        <div className="flex justify-center">
          <button onClick={() => onRemove(item.id)} className="hover:opacity-70"><Trash2 className="w-5 h-5 text-[#1E1E1E]" /></button>
        </div>
      </div>
    </div>
  );
};