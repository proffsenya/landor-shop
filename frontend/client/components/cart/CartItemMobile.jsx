import { Trash2 } from "lucide-react";
import { fmtMoney } from "@/utils/cartUtils";

export const CartItemMobile = ({ item, selected, onToggle, onIncrease, onDecrease, onRemove }) => {
  const isOutOfStock = item.stock > 0 && item.quantity >= item.stock;
  return (
    <div className="border-b border-[#E2E2E2] py-4">
      <div className="grid grid-cols-[36px_auto] gap-3">
        <div className="pt-1">
          <input type="checkbox" checked={selected} onChange={() => onToggle(item.id)} className="w-4 h-4 accent-[#6F2A2B]" />
        </div>
        <div>
          <div className="flex gap-3">
            <img src={item.image} className="object-contain w-16 h-24" onError={(e) => (e.currentTarget.src = "/korm1.svg")} />
            <div className="flex-1">
              <p className="text-[15px] text-[#1E1E1E] leading-tight">{item.name}</p>
              {item.weight && <p className="text-sm text-[#7A7A7A] mt-1">Вес: {item.weight}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center justify-between w-[110px] h-[36px] border border-[#1E1E1E] rounded-full">
              <button onClick={() => onIncrease(item)} disabled={isOutOfStock} className={`w-10 text-lg ${isOutOfStock ? "opacity-50" : ""}`}>+</button>
              <span>{item.quantity}</span>
              <button onClick={() => onDecrease(item)} className="w-10 text-lg">–</button>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-[#6F2A2B]">{fmtMoney(item.price * item.quantity)}</div>
              <button onClick={() => onRemove(item.id)}><Trash2 className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};