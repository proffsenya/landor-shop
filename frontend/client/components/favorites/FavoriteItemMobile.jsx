export const FavoriteItemMobile = ({ item, isSelected, onToggle, onMoveToCart, formatPrice }) => (
  <div className="rounded-xl border border-[#E8E8E8] p-4 bg-white">
    <div className="flex items-start gap-3">
      <div className="pt-1">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggle(item.id)}
          className="w-4 h-4 accent-[#6F2A2B]"
        />
      </div>
      <div className="flex-shrink-0 w-20 overflow-hidden rounded-md h-28 bg-gray-50">
        <img src={item.image} alt={item.name} className="object-contain w-full h-full" onError={(e) => (e.currentTarget.src = "/korm1.svg")} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] text-[#1E1E1E] leading-tight line-clamp-3">{item.name}</div>
        <div className="flex flex-wrap items-center mt-2 text-sm gap-x-4 gap-y-1">
          <span className="text-[#1E1E1E]">Вес: {item.weight}</span>
          <span className="text-[#8B8B8B]">{item.dateAdded}</span>
        </div>
        <div className="mt-2 text-sm">
          <span className={item.isInStock ? "text-green-600" : "text-red-600"}>
            {item.isInStock ? "В наличии" : "Нет в наличии"}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="text-base font-medium text-[#1E1E1E]">{formatPrice(item.price)}</div>
          {item.isInStock && (
            <button
              className="h-[40px] px-4 rounded-[10px] bg-[#6F2A2B] text-white text-[15px] hover:bg-[#5a2223]"
              onClick={() => onMoveToCart([item.variantId])}
            >
              В корзину
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);