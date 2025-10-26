import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(1);

  const faqs = [
    {
      question: "Вопрос 1",
      answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      question: "Вопрос 2",
      answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      question: "Вопрос 3",
      answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      question: "Вопрос 4",
      answer: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <h2 className="text-2xl text-[#6F2A2B] mb-8">Часто задаваемые вопросы</h2>
        
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div key={index} className="border-t border-gray-300">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex items-center justify-between w-full py-6 text-left transition-opacity hover:opacity-70"
              >
                <h3 className="text-xl text-[#1E1E1E]">{faq.question}</h3>
                <span className="ml-4 text-2xl text-black">
                  {openIndex === index ? "_" : "+"}
                </span>
              </button>
              
              {openIndex === index && faq.answer && (
                <div className="pb-6 pr-12">
                  <p className="text-base leading-relaxed text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-gray-300"></div>
        </div>
      </div>
    </section>
  );
}
