import { useState } from "react";
import AccordionMotion from "@/utils/AccordionMotion"; // ✅ импортируем плавный контейнер

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState();

  const faqs = [
    {
      question: "Могу ли я получить консультацию по выбору товара перед покупкой?",
      answer:
        "Да, конечно! Мы всегда рады помочь вам с выбором товара. Вы можете связаться с нами через онлайн-чат на сайте или по телефону. Наши консультанты помогут подобрать идеальный товар, учитывая ваши потребности, предпочтения и особенности.",
    },
    {
      question: "Что делать, если я ошибся с выбором товара после оформления заказа?",
      answer:
        "Если вы осознали ошибку в заказе, не переживайте! Свяжитесь с нами как можно скорее, и мы постараемся изменить или отменить ваш заказ до его отправки. Если товар уже в пути, вы можете воспользоваться услугой обмена или возврата в соответствии с нашими условиями.",
    },
    {
      question: "Могу ли я заказать товар в подарок и оформить доставку на другой адрес?",
      answer:
        "Да, конечно! При оформлении заказа вы можете указать любой адрес для доставки, а также оставить специальное сообщение для подарочной упаковки. Просто напишите нам, и мы сделаем все, чтобы ваш подарок был доставлен вовремя и красиво упакован!",
    },
    {
      question: "Как узнать, когда мой заказ будет доставлен?",
      answer:
        "После оформления заказа мы свяжемся с вами для подтверждения времени доставки. За 20-30 минут до приезда курьер свяжется с вами для уточнения точного времени. Вы всегда будете в курсе статуса вашего заказа, так что можете не переживать о доставке!",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <h2 className="mb-8 text-2xl text-[#6F2A2B]">
          Часто задаваемые вопросы
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index} className="border-t border-gray-300">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex items-center justify-between w-full py-6 text-left transition-opacity hover:opacity-70"
                >
                  <h3 className="text-xl text-[#1E1E1E]">{faq.question}</h3>
                  <span className="ml-4 text-2xl text-black">
                    {isOpen ? "_" : "+"}
                  </span>
                </button>

                {/* ✅ плавная анимация открытия */}
                <AccordionMotion isOpen={isOpen}>
                  <div className="pb-6 pr-12">
                    <p className="text-base leading-relaxed text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                </AccordionMotion>
              </div>
            );
          })}
          <div className="border-t border-gray-300"></div>
        </div>
      </div>
    </section>
  );
}
