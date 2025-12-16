import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function HeroBanner() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Загружаем баннеры для главной страницы
    const loadBanners = async () => {
      try {
        // Статический первый баннер (всегда присутствует)
        const staticBanner = {
          image: "/banner2.svg",
          title: "Добро пожаловать на Landor-shop!",
          heading: "Ваш любимец — наш главный дегустатор",
          buttonText: "Заказать сейчас",
          showContent: true,
        };

        // Загружаем все баннеры из API
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();
          const allBanners = Array.isArray(data) ? data : [];
          // Берем первые 2 баннера из API
          const apiBanners = allBanners.slice(0, 2);
          
          // Объединяем: статический первый + баннеры из API
          setBanners([staticBanner, ...apiBanners]);
        } else {
          // Если API недоступен, показываем только статический баннер
          setBanners([staticBanner]);
        }
      } catch (error) {
        // При ошибке показываем только статический баннер
        setBanners([{
          image: "/banner2.svg",
          title: "Добро пожаловать на Landor Shop!",
          heading: "Ваш любимец — наш главный дегустатор",
          buttonText: "Заказать сейчас",
          showContent: true,
        }]);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    // Автоматическая прокрутка каждые 5 секунд (только если есть баннеры)
    if (banners.length > 0 && !loading) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length, loading]);

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

  // Получаем URL изображения баннера
  const getBannerImageUrl = (banner) => {
    if (banner.imageUrl) {
      return banner.imageUrl;
    }
    if (banner.id) {
      return `/api/banners/${banner.id}/image`;
    }
    return banner.image || "/banner2.svg";
  };

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-[#FFF1DA]">
        <div className="w-full">
          <div className="relative hidden w-full overflow-hidden lg:block">
            <div className="relative h-[500px] xl:h-[500px] 2xl:h-[750px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F2A2B]"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-[#FFF1DA]">
      <div className="w-full">
        {/* Баннер показывается только на lg и выше */}
        <div className="relative hidden w-full overflow-hidden lg:block">
          {/* Карусель */}
          <div className="relative h-[500px] xl:h-[500px] 2xl:h-[750px]">
            {banners.map((banner, index) => {
              const imageUrl = getBannerImageUrl(banner);
              const showContent = banner.showContent !== false && (banner.title || banner.heading || banner.buttonText);
              
              return (
                <div
                  key={banner.id || index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <img
                    src={imageUrl}
                    alt={banner.title || banner.heading || `Landor Banner ${index + 1}`}
                    className="object-cover w-full h-full z-0 pointer-events-none"
                    onError={(e) => {
                      e.currentTarget.src = "/banner2.svg";
                    }}
                  />

                  {/* Текст и кнопка для баннера */}
                  {showContent && currentSlide === index && (
                    <>
                      {banner.heading && (
                        <div className="absolute inset-0 flex flex-col justify-center px-8 xl:px-12 2xl:px-16 z-20">
                          <div className="max-w-[560px] -translate-x-10 -translate-y-6 relative z-30">
                            <h1 className="text-[#6F2A2B] font-bold leading-[1.15] text-[40px] xl:text-[40px] mb-4 relative z-30">
                              {banner.heading}
                            </h1>
                            {banner.buttonText && (
                              <button 
                                onClick={() => navigate("/catalog")}
                                className="bg-[#6F2A2B] text-white px-7 py-3 rounded-full translate-x-[80px] hover:bg-[#5a2223] transition-colors text-[16px] font-semibold shadow-md cursor-pointer relative z-50 pointer-events-auto"
                              >
                                {banner.buttonText}
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Заголовок сверху */}
                      {banner.title && (
                        <div className="absolute top-[30px] left-1/2 -translate-x-1/2 text-center z-20">
                          <p className="text-[#6F2A2B] font-bold text-[30px] xl:text-[34px]">
                            {banner.title}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Индикаторы */}
          <div className="absolute flex gap-2 -translate-x-1/2 bottom-4 left-1/2 z-40 pointer-events-auto">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`h-2 rounded-full transition-all cursor-pointer pointer-events-auto ${
                  currentSlide === index
                    ? "w-8 bg-[#6F2A2B]"
                    : "w-2 bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Перейти к слайду ${index + 1}`}
                type="button"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
