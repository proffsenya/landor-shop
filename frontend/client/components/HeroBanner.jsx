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
        // Загружаем все баннеры из API
        const res = await fetch("/api/banners");
        if (res.ok) {
          const data = await res.json();
          const allBanners = Array.isArray(data) ? data : [];
          // Берем первые 3 баннера из API (первый + еще 2)
          const apiBanners = allBanners.slice(0, 3);
          
          // Используем баннеры из API (первый баннер теперь тоже из API)
          setBanners(apiBanners);
        } else {
          // Если API недоступен, показываем пустой массив
          setBanners([]);
        }
      } catch (error) {
        // При ошибке показываем пустой массив
        setBanners([]);
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
            <div className="relative h-[500px] xl:h-[600px] 2xl:h-[750px] flex items-center justify-center">
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
          <div className="relative h-[500px] xl:h-[550px] 2xl:h-[650px] overflow-hidden">
            {banners.map((banner, index) => {
              const imageUrl = getBannerImageUrl(banner);
              const isFirstBanner = index === 0;
              
              // Для первого баннера всегда показываем контент с дефолтными значениями
              const title = banner.title || (isFirstBanner ? "Добро пожаловать на Landor-shop!" : null);
              const heading = banner.heading || (isFirstBanner ? "Ваш любимец — наш главный дегустатор" : null);
              const buttonText = banner.buttonText || (isFirstBanner ? "Заказать сейчас" : null);
              
              const showContent = isFirstBanner || (banner.showContent !== false && (title || heading || buttonText));
              
              return (
                <div
                  key={banner.id || index}
                  className={`absolute inset-0 transition-opacity duration-500 ${
                    currentSlide === index ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center z-0">
                    <img
                      src={imageUrl}
                      alt={title || heading || `Landor Banner ${index + 1}`}
                      className="object-contain w-full h-full max-w-[95%] max-h-[95%] z-0 pointer-events-none"
                      style={{ objectPosition: 'center' }}
                      onError={(e) => {
                        e.currentTarget.src = "/banner2.svg";
                      }}
                    />
                  </div>

                  {/* Текст и кнопка для баннера */}
                  {showContent && currentSlide === index && (
                    <>
                      {heading && (
                        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-8 xl:px-12 2xl:px-16 z-20">
                          <div className="max-w-[400px] lg:max-w-[450px] xl:max-w-[480px] 2xl:max-w-[520px] -translate-x-4 lg:-translate-x-6 xl:-translate-x-8 2xl:-translate-x-10 -translate-y-4 lg:-translate-y-5 xl:-translate-y-6 relative z-30 pr-4 lg:pr-6 xl:pr-8">
                            <h1 className="text-[#6F2A2B] font-bold leading-[1.15] text-[28px] lg:text-[32px] xl:text-[36px] 2xl:text-[40px] mb-3 lg:mb-4 relative z-30 text-center">
                              {heading}
                            </h1>
                            {buttonText && (
                              <div className="text-center">
                                <button 
                                  onClick={() => navigate("/catalog")}
                                  className="bg-[#6F2A2B] text-white px-5 py-2.5 lg:px-6 lg:py-3 xl:px-7 rounded-full hover:bg-[#5a2223] transition-colors text-[14px] lg:text-[15px] xl:text-[16px] font-semibold shadow-md cursor-pointer relative z-50 pointer-events-auto"
                                >
                                  {buttonText}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Заголовок сверху */}
                      {title && (
                        <div className="absolute top-4 lg:top-6 xl:top-8 2xl:top-[30px] left-1/2 -translate-x-1/2 text-center z-20 px-4">
                          <p className="text-[#6F2A2B] font-bold text-[24px] lg:text-[28px] xl:text-[32px] 2xl:text-[34px]">
                            {title}
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
