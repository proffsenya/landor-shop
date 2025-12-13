import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";

export default function PrivacyPolicy() {
  // Path to the PDF file - update this when you have the actual privacy policy PDF
  const pdfPath = "/documents/privacy-policy.pdf";

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="flex-grow container max-w-6xl px-4 py-8 mx-auto">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "Политика конфиденциальности" }
          ]} />
          
          <div className="p-6 bg-white border border-gray-200 rounded-lg sm:p-8 lg:p-12">
            {/* Заголовок */}
            <PageFade>
              <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-8">
                Политика конфиденциальности
              </h1>
            </PageFade>

            {/* Описание */}
            <PageFade>
              <div className="mb-8 space-y-6 text-gray-700">
                <p className="text-base leading-relaxed sm:text-lg">
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей 
                  интернет-магазина. Ознакомьтесь с документом ниже.
                </p>
              </div>
            </PageFade>

            {/* PDF Viewer */}
            <PageFade>
              <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <iframe
                  src={pdfPath}
                  title="Политика конфиденциальности"
                  className="w-full h-[600px] sm:h-[700px] lg:h-[800px]"
                  style={{ border: 'none' }}
                >
                  <p>
                    Ваш браузер не поддерживает отображение PDF файлов. 
                    <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="text-[#6F2A2B] underline ml-1">
                      Скачайте документ
                    </a>
                  </p>
                </iframe>
              </div>
            </PageFade>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}

