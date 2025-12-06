import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";

export default function DeliveryPayment() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
      <div className="container flex-grow px-4 py-8 mx-auto">
        <BreadcrumbNav items={[
          { label: "Главная", to: "/" },
          { label: "Доставка и оплата" }
        ]} />
        <div className="p-6 bg-white border border-gray-200 rounded-lg">
          <PageFade>
          <h2 className=" text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-7 lg:mb-15">Условия доставки и оплаты</h2>
          </PageFade>
          <PageFade>
          <section className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Условия доставки:</h3>
            <ul className="pl-6 text-gray-700 list-disc">
              <li>Мы предлагаем удобную и быструю доставку заказов <strong>ежедневно с понедельника по субботу</strong>. Время и дату доставки согласовываем с оператором при подтверждении заказа.</li>
              <li><strong>Оплата заказа осуществляется только после согласования и подтверждения заказа.</strong></li>
              <li>Отправка товара осуществляется <strong>только по России</strong>. В Страны СНГ и Дальнего зарубежья товар не доставляется.</li>
              <li>Доставка в офисы и зоны платной парковки: Просим Вас обеспечить удобный подъезд к офису/дому и бесплатную парковку не далее, чем в 20 метров от подъезда. Если такой возможности нет, заказ необходимо самостоятельно забрать из машины. <strong>Максимальное бесплатное время ожидания водителя — 15 минут</strong>. Если ожидание составляет более 15 минут, то стоимость платной парковки, оплачивает покупатель.</li>
              <li>Доставка в многоэтажных зданиях осуществляется до квартиры в случае наличия исправного лифта. В доме без лифта, подъём товара весом более 10 кг осуществляется за доп. плату: <strong>+ 50 руб / этаж (за один раз)</strong>.</li>
              <li>Километраж считается по кратчайшему маршруту от МКАД до вашего адреса по Яндекс картам.</li>
              <li><strong>Доставка по Московской области дальше 10 км от МКАД по пятницам не осуществляется.</strong></li>
              <li><strong>Минимальный заказ для регионов от 1000 рублей.</strong></li>
            </ul>
          </section>
          </PageFade>
          <PageFade>
          <section className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Способы оплаты:</h3>
            <ul className="pl-6 text-gray-700 list-disc">
              <li><strong>Наличными курьеру</strong> при получении заказа - только для Москвы и Московской области.</li>
              <li><strong>Оплата по QR-коду через СБП</strong></li>
              <li><strong>По реквизитам</strong> на р/с ИП реквизиты:</li>
            </ul>
          </section>
          </PageFade>
          <PageFade>
          <section className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Стоимость доставки по Москве (в пределах МКАД):</h3>
            <ul className="pl-6 text-gray-700 list-disc">
              <li><strong>Бесплатно</strong> - для заказов на сумму <strong>более 3 000 рублей</strong>.</li>
              <li><strong>300 рублей</strong> - для заказов на сумму менее 3 000 рублей.</li>
            </ul>
          </section>
          </PageFade>
          <PageFade>
          <section className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Стоимость доставки по Московской области:</h3>
            <ul className="pl-6 text-gray-700 list-disc">
              <li>Расстояние от МКАД <strong>до 10 км</strong>: <strong>бесплатно от 4000 руб</strong>, заказ менее 4000 руб – <strong>350 руб</strong></li>
              <li>Расстояние от МКАД <strong>от 10 до 20 км</strong>: <strong>бесплатно от 6000 руб</strong>, заказ менее 6000 руб – <strong>400 руб</strong></li>
              <li>Расстояние от МКАД <strong>от 20 до 30 км</strong>: <strong>бесплатно от 10000 руб</strong>, заказ менее 10000 руб – <strong>450 руб</strong></li>
              <li>Расстояние от МКАД <strong>от 30 км</strong> рассчитывается индивидуально менеджером при оформлении заказа.</li>
            </ul>
          </section>
          </PageFade>
          <PageFade>
          <section className="mb-6">
            <h3 className="mb-2 text-xl font-semibold text-gray-900">Доставка в регионы России:</h3>
            <ul className="pl-6 text-gray-700 list-disc">
              <li>В регионы России доставляем сторонними курьерскими службами и транспортными компаниями <strong>после 100% оплаты заказа</strong>. Услуга доставки не входит в стоимость товара. Стоимость зависит от объема и веса заказа и окончательно рассчитывается менеджером при его подтверждении.</li>
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
