import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function HeroBanner() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const banners = [
    {
      image: "/banner2.svg",
      title: "Добро пожаловать на Landor Shop!",
      heading: "Ваш любимец — наш главный дегустатор",
      buttonText: "Заказать сейчас",
      showContent: true,
    },
    {
      image: "/banner4.svg",
      title: "",
      heading: "",
      buttonText: "",
      showContent: false,
    },
  ];

  useEffect(() => {
    // Автоматическая прокрутка каждые 5 секунд
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Сброс таймера при ручном переключении
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
  };

  return (
    <section className="relative overflow-hidden bg-[#FFF1DA]">
      <div className="w-full">
        {/* Баннер показывается только на lg и выше */}
        <div className="relative hidden w-full overflow-hidden lg:block">
          {/* Карусель */}
          <div className="relative h-[500px] xl:h-[500px] 2xl:h-[750px]">
            {banners.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={banner.image}
                  alt={`Landor Banner ${index + 1}`}
                  className="object-cover w-full h-full"
                />

                {/* Текст и кнопка для первого баннера */}
                {banner.showContent && currentSlide === index && (
                  <>
                    <div className="absolute inset-0 flex flex-col justify-center px-8 xl:px-12 2xl:px-16">
                      <div className="max-w-[560px] -translate-x-10 -translate-y-6">
                        <h1 className="text-[#6F2A2B] font-bold leading-[1.15] text-[40px] xl:text-[40px] mb-4">
                          Ваш любимец — наш{" "}
                          <span className="block">главный дегустатор</span>
                        </h1>
                        <button 
                          onClick={() => navigate("/catalog")}
                          className="bg-[#6F2A2B] text-white px-7 py-3 rounded-full translate-x-[80px] hover:bg-[#5a2223] transition-colors text-[16px] font-semibold shadow-md cursor-pointer z-10 relative"
                        >
                          {banner.buttonText}
                        </button>
                      </div>
                    </div>

                    {/* Заголовок сверху */}
                    <div className="absolute top-[30px] left-1/2 -translate-x-1/2 text-center">
                      <p className="text-[#6F2A2B] font-bold text-[30px] xl:text-[34px]">
                        {banner.title}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Индикаторы */}
          <div className="absolute flex gap-2 -translate-x-1/2 bottom-4 left-1/2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index
                    ? "w-8 bg-[#6F2A2B]"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
