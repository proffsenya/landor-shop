import { Heart } from "lucide-react";

export default function ProductCard({ image, title, price }) {
  return (
    <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
      {/* Product image */}
      <div className="relative p-8 bg-white border-b border-gray-200">
        <button className="absolute z-10 transition-transform top-4 right-4 hover:scale-110">
          <Heart className="w-6 h-6 text-[#6F2A2B]" />
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
          <button  className="bg-[#6F2A2B] text-white px-4 py-2 rounded-md hover:bg-[#5a2223] transition-colors text-sm">
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
