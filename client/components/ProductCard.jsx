import { useState } from "react";
import { Heart, Check } from "lucide-react";
import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
import { ScalePulse, FadeSwitch } from "../utils/ActionAnimations";

export default function ProductCard({ image, title, price }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  return (
    <StaggerItem>
      <HoverLift>
        <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
          {/* Product image */}
          <div className="relative p-4 bg-white border-b border-gray-200 sm:p-6 lg:p-8">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="absolute z-10 transition-transform top-3 right-3 sm:top-4 sm:right-4 hover:scale-110"
              aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
            >
              <ScalePulse active={isFavorite}>
                <FadeSwitch active={isFavorite}>
                  <Heart
                    className={`transition-colors ${
                      isFavorite ? "text-red-500 fill-red-500" : "text-[#6F2A2B]"
                    } w-5 h-5 sm:w-6 sm:h-6`}
                  />
                </FadeSwitch>
              </ScalePulse>
            </button>

            <img
              src={image}
              alt={title}
              className="object-contain w-24 mx-auto h-44 sm:h-56 sm:w-28 lg:h-64 lg:w-32"
            />
          </div>

          {/* Product info */}
          <div className="p-3 sm:p-4">
            <p
              className="
                text-[#1E1E1E]
                text-sm sm:text-base
                mb-3 sm:mb-4
                line-clamp-2 lg:line-clamp-3
              "
              title={title}
            >
              {title}
            </p>

            {/* На мобиле стекаем цену и кнопку, на md+ в ряд */}
            <div className="flex flex-col gap-3 pt-4 sm:pt-6 md:pt-7 md:flex-row md:items-center md:justify-between">
              <span className="text-xl sm:text-2xl text-[#6F2A2B]">{price}</span>


                <button
                  onClick={() => setInCart(!inCart)}
                  className={`
                    flex items-center justify-center gap-2
                    rounded-md text-sm sm:text-[15px]
                    transition-colors
                    px-3 py-2 sm:px-4
                    ${
                      inCart
                        ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                        : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                    }
                    w-full md:w-auto
                  `}
                >
                  <FadeSwitch active={inCart}>
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" /> В корзине
                      </>
                    ) : (
                      "В корзину"
                    )}
                  </FadeSwitch>
                </button>
            </div>
          </div>
        </div>
      </HoverLift>
    </StaggerItem>
  );
}
