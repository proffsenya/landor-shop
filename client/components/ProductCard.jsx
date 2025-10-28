import { useState } from "react";
import { Heart, Check } from "lucide-react";

export default function ProductCard({ image, title, price }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  return (
    <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
      {/* Product image */}
      <div className="relative p-8 bg-white border-b border-gray-200">
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute z-10 transition-transform top-4 right-4 hover:scale-110"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              isFavorite ? "text-red-500 fill-red-500" : "text-[#6F2A2B]"
            }`}
          />
        </button>

        <img
          src={image}
          alt={title}
          className="object-contain w-32 h-64 mx-auto"
        />
      </div>

      {/* Product info */}
      <div className="p-4">
        <p className="text-[#1E1E1E] text-base mb-4 line-clamp-3">
          {title}
        </p>

        <div className="flex items-center justify-between pt-7">
          <span className="text-2xl text-[#6F2A2B]">{price}</span>

          <button
            onClick={() => setInCart(!inCart)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              inCart
                ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            }`}
          >
            {inCart ? (
              <>
                <Check className="w-4 h-4" />В корзине
              </>
            ) : (
              "В корзину"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
