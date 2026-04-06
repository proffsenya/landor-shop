import { Heart, Check } from "lucide-react";

export const ProductInfo = ({
  title,
  priceStr,
  variants,
  selectedIdx,
  onSelectWeight,
  available,
  totalStock,
  inCart,
  adding,
  qty,
  setQty,
  onToggleCart,
  isFav,
  onToggleFav,
  skuText,
  countryText,
  isFiller,
  scentsText,
  tastesText,
  weightLabel,
  stockText,
}) => {
  return (
    <div className="md:pl-6 lg:pl-8">
      <h1 className="text-[20px] md:text-[24px] font-semibold text-[#1E1E1E] leading-snug">{title}</h1>

      <div className="flex flex-col items-start gap-0 mt-4 sm:flex-row sm:items-center">
        <div className="text-[24px] font-semibold text-[#1E1E1E] whitespace-nowrap min-w-[120px]">{priceStr}</div>
        {!inCart && available && (
          <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E] overflow-hidden flex-shrink-0">
            <button onClick={() => setQty(n => Math.max(1, n - 1))} className="h-9 w-9 text-[18px] font-semibold rounded-l-full flex items-center justify-center">–</button>
            <span className="min-w-[36px] text-center text-[15px] font-medium px-2">{qty}</span>
            <button onClick={() => setQty(n => (n + 1 > totalStock ? (alert(`В наличии только ${totalStock} шт.`), totalStock) : n + 1))} className="h-9 w-9 text-[18px] font-semibold rounded-r-full flex items-center justify-center">+</button>
          </div>
        )}
      </div>

      {variants.length > 0 && (
        <div className="mt-5">
          <div className="mb-2 text-[13px] font-medium text-[#1E1E1E]">Вес:</div>
          <div className="flex flex-wrap gap-2">
            {variants.map((opt, idx) => (
              <button key={opt.id} onClick={() => onSelectWeight(idx)} className={`h-9 rounded-full px-4 text-[12px] transition ${idx === selectedIdx ? "bg-[#6F2A2B] text-white" : "border border-[#D6D6D6] text-[#1E1E1E]"} ${!opt.available ? "opacity-50" : ""}`} title={!opt.available ? "Ожидает поступления" : ""}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-5 sm:flex-row">
        {available ? (
          <button onClick={onToggleCart} disabled={adding} className={`flex items-center justify-center rounded-md text-sm sm:text-[15px] transition-colors px-3 py-[10px] h-11 min-w-[110px] w-full sm:w-auto ${inCart ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]" : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"} ${adding ? "opacity-60 cursor-not-allowed" : ""}`}>
            {inCart ? (<span className="flex items-center gap-1"><Check className="w-4 h-4" /><span>В корзине</span></span>) : adding ? "Добавление..." : `Добавить в корзину ${qty > 1 ? `(${qty} шт.)` : ''}`}
          </button>
        ) : (
          <span className="h-11 inline-flex items-center justify-center rounded-lg px-6 text-[14px] w-full sm:w-auto bg-gray-100 text-gray-500">Ожидает поступления</span>
        )}
        <button onClick={onToggleFav} className={`flex h-11 items-center justify-center rounded-lg border sm:w-11 ${isFav ? "border-[#6F2A2B] text-[#6F2A2B]" : "border-[#DADADA] text-[#9B9B9B]"}`}>
          <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
          <span className="ml-2 text-[14px] sm:hidden">{isFav ? "В избранном" : "В избранное"}</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-2 text-[14px]">
        <div className="text-[#6B6B6B]">Артикул (SKU):</div><div>{skuText}</div>
        <div className="text-[#6B6B6B]">Страна производства:</div><div>{countryText}</div>
        {isFiller ? (<><div className="text-[#6B6B6B]">Запах:</div><div>{scentsText}</div></>) : (<><div className="text-[#6B6B6B]">Вкус:</div><div>{tastesText}</div></>)}
        <div className="text-[#6B6B6B]">Вес:</div><div>{weightLabel}</div>
        <div className="text-[#6B6B6B]">Наличие:</div><div className={stockText === "Есть в наличии" ? "text-green-600" : ""}>{stockText}</div>
      </div>
    </div>
  );
};