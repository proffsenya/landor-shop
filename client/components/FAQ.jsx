import { useState } from "react";
import AccordionMotion from "@/utils/AccordionMotion"; // ✅ импортируем плавный контейнер

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(1);

  const faqs = [
    {
      question: "Вопрос 1",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
    {
      question: "Вопрос 2",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
    {
      question: "Вопрос 3",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
    },
    {
      question: "Вопрос 4",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry...",
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
