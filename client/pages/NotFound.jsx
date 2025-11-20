import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { PageFade } from "@/utils/PageAnimations";
import { SlideFade } from "@/utils/CatalogAnimations";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <PageFade>
        <div className="flex-1 flex items-center justify-center py-8">
          <SlideFade direction="up" delay={0.2}>
            <div className="text-center">
              <h1 className="text-6xl font-bold mb-4 text-[#6F2A2B]">404</h1>
              <p className="text-xl text-gray-600 mb-6">Страница не найдена</p>
              <a 
                href="/" 
                className="inline-block px-6 py-3 bg-[#6F2A2B] text-white rounded-lg hover:bg-[#5a2223] transition-colors"
              >
                Вернуться на главную
              </a>
            </div>
          </SlideFade>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
};

export default NotFound;
