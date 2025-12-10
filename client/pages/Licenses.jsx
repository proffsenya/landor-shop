import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";

export default function Licenses() {
  const licenses = [
    {
      name: "Декларация Landor Бадис",
      image: "/documents/Декларация_Landor_Бадис.jpg"
    },
    {
      name: "ДС влажный Landor от 23.05.2025",
      image: "/documents/ДС влажный Landor от 23.05.2025.jpg"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="flex-grow container max-w-6xl px-4 py-8 mx-auto">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Лицензии и сертификаты" }
          ]} />
          
          <div className="p-6 bg-white border border-gray-200 rounded-lg sm:p-8 lg:p-12">
            {/* Заголовок */}
            <PageFade>
              <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-8">
                Лицензии и сертификаты
              </h1>
            </PageFade>

            {/* Описание */}
            <PageFade>
              <div className="mb-8 space-y-6 text-gray-700">
                <p className="text-base leading-relaxed sm:text-lg">
                  Наша компания предоставляет все необходимые документы, подтверждающие качество и соответствие 
                  продукции установленным стандартам. Ниже представлены лицензии и сертификаты на нашу продукцию.
                </p>
              </div>
            </PageFade>

            {/* Галерея лицензий */}
            <PageFade>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {licenses.map((license, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-full mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                      <img 
                        src={license.image} 
                        alt={license.name}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                    <h3 className="text-center text-[#6F2A2B] text-base sm:text-lg font-medium">
                      {license.name}
                    </h3>
                  </div>
                ))}
              </div>
            </PageFade>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}

