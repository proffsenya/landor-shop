import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Check } from "lucide-react";
import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
import { ScalePulse, FadeSwitch } from "../utils/ActionAnimations";

export default function ProductCard({ productId, variantId, image, title, price, to }) {
  // Если из Catalog пришёл готовый to — используем его.
  // Иначе строим URL так: /product/{variantId}?product={productId}
  const productUrl =
    to ??
    (variantId != null && productId != null
      ? `/product/${encodeURIComponent(variantId)}?product=${encodeURIComponent(productId)}`
      : "#");

  const [isFavorite, setIsFavorite] = useState(false);
  const [inCart, setInCart] = useState(false);

  const stop = (e) => e.stopPropagation();

  return (
    <StaggerItem>
      <HoverLift>
        <div className="overflow-hidden transition-shadow bg-white border border-gray-200 rounded-xl hover:shadow-lg">
          {/* Кликабельное изображение */}
          <Link
            to={productUrl}
            className="relative block p-4 bg-white border-b border-gray-200 sm:p-6 lg:p-8 focus:outline-none focus:ring-2 focus:ring-[#6F2A2B]"
            aria-label={title || "Товар"}
          >
            {/* Избранное */}
            <button
              onClick={(e) => {
                stop(e);
                setIsFavorite((v) => !v);
              }}
              className="absolute z-10 transition-transform top-3 right-3 sm:top-4 sm:right-4 hover:scale-110"
              aria-label={isFavorite ? "Убрать из избранного" : "В избранное"}
              type="button"
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
              loading="lazy"
            />
          </Link>

          {/* Инфо-блок */}
          <div className="p-3 sm:p-4">
            <Link
              to={productUrl}
              className="block focus:outline-none focus:ring-2 focus:ring-[#6F2A2B] rounded"
              title={title}
              aria-label={title || "Товар"}
            >
              <p className="text-[#1E1E1E] text-sm sm:text-base mb-3 sm:mb-4 line-clamp-2 lg:line-clamp-3">
                {title}
              </p>
            </Link>

            <div className="flex flex-col gap-3 pt-4 sm:pt-6 md:pt-7 md:flex-row md:items-center md:justify-between">
              <span className="text-xl sm:text-2xl text-[#6F2A2B]">{price}</span>

              <button
                type="button"
                onClick={(e) => {
                  stop(e);
                  setInCart((v) => !v);
                }}
                className={`
                  flex items-center justify-center
                  rounded-md text-sm sm:text-[15px]
                  transition-colors
                  px-4 py-3 sm:px-3
                  ${
                    inCart
                      ? "bg-white border border-[#6F2A2B] text-[#6F2A2B]"
                      : "bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
                  }
                  w-full md:w-auto
                `}
                aria-label={inCart ? "Убрать из корзины" : "Добавить в корзину"}
              >
                <FadeSwitch active={inCart}>
                  <span className="flex items-center justify-center gap-1 leading-none">
                    {inCart ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>В корзине</span>
                        
                      </>
                    ) : (
                      <span>В корзину</span>
                    )}
                  </span>
                </FadeSwitch>
              </button>
            </div>
          </div>
        </div>
      </HoverLift>
    </StaggerItem>
  );
}
