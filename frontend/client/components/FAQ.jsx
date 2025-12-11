import { useState } from "react";
import AccordionMotion from "@/utils/AccordionMotion"; // ✅ импортируем плавный контейнер

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState();

  const faqs = [
    {
      question: "Как мне перевести питомца на корм ТМ Landor®",
      answer:
        "Переводить питомца на новый корм рекомендуется в течение 7 дней, увеличивая долю нового корма на 1/4 суточной дозы каждые 2 дня.",
    },
    {
      question: "Можно ли смешивать Ваши сухие корма с консервами других производителей?",
      answer:
        "Да, можно. Не забывайте о суточных нормах кормления и пересчитывайте их пропорционально рекомендациям.",
    },
    {
      question: "Сколько воды необходимо моей собаке/кошке?",
      answer:
        "Миска со свежей водой всегда должна быть в свободном доступе для животного.",
    },
    {
      question: "Сколько корма необходимо давать моей собаке или кошке?",
      answer:
        "Рекомендации по кормлению своего питомца Вы найдете на каждой упаковке корма. Обращаем Ваше внимание, что указанные производителем нормы кормления — это отправная точка. Чтобы Ваш питомец всегда был в отличной форме необходимо регулярно оценивать его физическое состояние и при необходимости корректировать рацион в большую или меньшую сторону.",
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
