import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PageFade } from "@/utils/PageAnimations";

export default function ExchangeReturn() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] py-8">
          <div className="container w-full max-w-4xl px-4 mx-auto">
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-7 lg:mb-15">Обмен и возврат</h2>
              
              <section className="mb-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">ВНИМАНИЕ!!!</h3>
                <p className="text-gray-700">
                  Обмен / Возврат производится при условии сохранности товара, упаковки, бирок, наклеек, с описанием и инструкцией товара.
                </p>
              </section>

              <section className="mb-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Варианты обмена / возврата:</h3>
                <ol className="pl-6 text-gray-700 list-decimal">
                  <li>Доставляете товар своими силами.</li>
                  <li>Приедет курьер, который произведет обмен. Стоимость услуги курьера составит 600 руб. (Москва: в пределах МКАД + до 5 км, далее 5 км от МКАД + 25 руб / за 1км)</li>
                  <li>
                    Если товар был отправлен транспортной компанией и груз прибыл в город назначения, но клиент отказался от посылки и делает возврат товара, то все транспортные расходы в обе стороны полностью оплачиваются заказчиком.
                  </li>
                </ol>
              </section>

              <section className="mb-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">Права и обязанности:</h3>
                <ul className="pl-6 text-gray-700 list-disc">
                  <li>
                    Если Вы подтвердили доставку, но по приезду водителя, не можете принять заказ по не зависящим от нас причинам, то в соответствии с п. 3 ст. 497 ГК РФ с Гражданским Кодексом РФ, требуется возместить интернет-магазину расходы по доставке, осуществленные в связи с совершением действий по выполнению договора, в размере 450 рублей.
                  </li>
                  <li>
                    Указывая контактный телефон, держите его включённым и в зоне вашей к нему доступности. Курьер будет связываться с Вами за 20-30 минут до приезда. Если у курьера не получается дозвониться до Вас по указанному номеру телефона (не берут трубку, выключен, недоступен, села батарея и прочее, Ваш заказ будет перенесён на другой ближайший день доставки или отменён.
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}