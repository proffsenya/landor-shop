import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";

export default function AboutCompany() {

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="container max-w-6xl px-4 py-8 mx-auto">
          <BreadcrumbNav items={[
            { label: "Главная", to: "/" },
            { label: "О компании" }
          ]} />
          
          <div className="p-6 bg-white border border-gray-200 rounded-lg sm:p-8 lg:p-12">
            {/* Заголовок */}
            <PageFade>
              <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-8">
                О компании Landor
              </h1>
            </PageFade>

            {/* Основной текст */}
            <PageFade>
              <div className="mb-8 space-y-6 text-gray-700">
                <p className="text-base leading-relaxed sm:text-lg">
                  Добро пожаловать в <strong>Landor</strong> — интернет-магазин премиальных кормов для кошек и собак. 
                  Мы специализируемся на продаже качественных холистик и суперпремиум кормов от ведущих мировых производителей.
                </p>
                
                <p className="text-base leading-relaxed sm:text-lg">
                  Наша компания была основана с целью предоставить владельцам домашних животных доступ к 
                  <strong> лучшему питанию для их питомцев</strong>. Мы понимаем, что правильное питание — 
                  это основа здоровья и долголетия ваших четвероногих друзей, поэтому тщательно отбираем 
                  каждый товар в нашем ассортименте.
                </p>

                <p className="text-base leading-relaxed sm:text-lg">
                  Мы работаем напрямую с производителями и официальными дистрибьюторами, что гарантирует 
                  <strong> подлинность продукции и выгодные цены</strong> для наших клиентов. Наш ассортимент 
                  включает корма для кошек и собак различных пород, возрастов и особенностей здоровья.
                </p>
              </div>
            </PageFade>

            {/* Контакты */}
            <PageFade>
              <section className="pt-8 mt-10 border-t border-gray-200">
                <h2 className="text-[#6F2A2B] text-xl sm:text-2xl lg:text-[28px] font-semibold mb-4">
                  Контакты
                </h2>
                <p className="mb-4 text-base leading-relaxed text-gray-700 sm:text-lg">
                  Мы всегда рады ответить на ваши вопросы и помочь с выбором. Свяжитесь с нами любым удобным способом:
                </p>
                <ul className="pl-6 space-y-2 text-gray-700">
                  <li className="text-base sm:text-lg">
                    <strong>Телефон:</strong> +7 (999) 999-99-99
                  </li>
                  <li className="text-base sm:text-lg">
                    <strong>Email:</strong> info@landor-shop.ru
                  </li>
                  <li className="text-base sm:text-lg">
                    <strong>Часы работы:</strong> ежедневно с 9:00 до 21:00
                  </li>
                </ul>
              </section>
            </PageFade>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}

