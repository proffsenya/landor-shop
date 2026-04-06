import { motion } from "framer-motion";

export const FavoriteItemDesktop = ({ item, isSelected, onToggle, formatPrice }) => (
  <motion.tr
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.25 }}
    className="border-b border-[#E2E2E2]"
  >
    <td className="px-5 py-6 text-center align-middle">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(item.id)}
        className="w-4 h-4 accent-[#6F2A2B]"
      />
    </td>
    <td className="px-5 py-6">
      <div className="flex items-center gap-6">
        <div className="w-[64px] h-[96px] overflow-hidden flex-shrink-0">
          <img src={item.image} alt={item.name} className="object-contain w-full h-full" onError={(e) => (e.currentTarget.src = "/korm1.svg")} />
        </div>
        <div className="text-[15px] text-[#1E1E1E] leading-tight pr-6 line-clamp-3">
          {item.name}
        </div>
      </div>
    </td>
    <td className="px-5 py-6 text-center">{item.weight}</td>
    <td className="px-5 py-6 text-center">{formatPrice(item.price)}</td>
    <td className="px-5 py-6 text-center text-[#8B8B8B]">{item.dateAdded}</td>
    <td className="px-5 py-6 text-center">
      <span className={item.isInStock ? "text-green-600" : "text-red-600"}>
        {item.isInStock ? "В наличии" : "Нет в наличии"}
      </span>
    </td>
  </motion.tr>
);