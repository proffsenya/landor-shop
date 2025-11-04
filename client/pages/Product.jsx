import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";
import ScrollReveal from "@/utils/ScrollAnimations";

// Моковые данные: два производителя
const mockProduct = {
  id: 1,
  name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
  images: ["/korm1.svg", "/korm1.svg", "/korm1.svg", "/korm1.svg"],
  producers: [
    {
      name: "LANDOR Россия",
      weightOptions: [
        { weight: "1 кг", price: 2000, available: true },
        { weight: "3 кг", price: 3000, available: true },
      ],
    },
    {
      name: "LANDOR Испания",
      weightOptions: [{ weight: "2 кг", price: 2500, available: true }],
    },
  ],
  country: "Россия / Испания",
  tastes: ["Индейка", "Лосось"],
  animalType: "Котёнок",
  size: "Все породы",
  age: "Котята",
  nutritionalValue:
    "422 ккал/100 г. Хранить в сухом прохладном месте при комнатной температуре и относительной влажности воздуха не более 75 %.",
  guaranteedIndicators:
    "Сырой протеин 34 %, жир 19 %, клетчатка 2,3 %, зола 8 %, углеводы 28,7 %, влага 8 %.",
  feedingNote:
    "Количество корма зависит от сезона, активности и индивидуальных особенностей животного. Вводить постепенно 5–10 дней. Всегда должна быть свежая вода.",
};

function CardSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#E6E6E6]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-medium text-[#1E1E1E]"
      >
        {title}
        <span className="inline-flex h-6 w-6 items-center justify-center text-[#6F2A2B] text-[18px]">
          {open ? "–" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-[14px] leading-relaxed text-[#2a2a2a]">
          {children}
        </div>
      )}
    </div>
  );
}

export default function Product() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  // Выбор производителя и веса
  const [selectedProducer, setSelectedProducer] = useState(mockProduct.producers[0]);
  const [selectedWeight, setSelectedWeight] = useState(
    selectedProducer.weightOptions[0]
  );

  const price = selectedWeight.price.toLocaleString("ru-RU") + "₽";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ScrollReveal>
      <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
        <Link
          to="/catalog"
          className="mb-4 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          В каталог
        </Link>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {/* Изображения */}
          <div className="flex flex-col w-full">
            <div className="rounded-lg border border-[#E6E6E6] bg-white p-2">
              <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-[#F2F2F2] h-64 md:h-[360px]">
                <img
                  src={mockProduct.images[selectedImage]}
                  alt={mockProduct.name}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mt-3">
              {mockProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-md border ${
                    selectedImage === i
                      ? "border-[#6F2A2B]"
                      : "border-[#E6E6E6]"
                  } bg-[#F7F7F7] h-16`}
                >
                  <img src={img} alt={`img-${i}`} className="object-contain w-full h-full" />
                </button>
              ))}
            </div>
          </div>

          {/* Информация */}
          <div className="md:pl-6 lg:pl-8">
            <h1 className="text-[20px] md:text-[24px] font-semibold text-[#1E1E1E] leading-snug">
              {mockProduct.name}
            </h1>

            {/* Цена и количество */}
            <div className="flex flex-col items-start gap-4 mt-4 sm:flex-row sm:items-center">
              <div className="text-[24px] font-semibold text-[#1E1E1E]">
                {price}
              </div>
              <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E]">
                <button
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  className="h-9 w-9 text-[18px]"
                >
                  –
                </button>
                <span className="min-w-[36px] text-center text-[15px]">{qty}</span>
                <button
                  onClick={() => setQty((n) => n + 1)}
                  className="h-9 w-9 text-[18px]"
                >
                  +
                </button>
              </div>
            </div>

            {/* --- Переключатель производителя --- */}
            <div className="mt-5">
              <div className="mb-2 text-[13px] font-medium text-[#1E1E1E]">
                Выберите производителя:
              </div>
              <div className="flex flex-wrap gap-2">
                {mockProduct.producers.map((p) => {
                  const active = p.name === selectedProducer.name;
                  return (
                    <button
                      key={p.name}
                      onClick={() => {
                        setSelectedProducer(p);
                        setSelectedWeight(p.weightOptions[0]);
                      }}
                      className={`rounded-full px-4 py-2 text-[13px] ${
                        active
                          ? "bg-[#6F2A2B] text-white"
                          : "border border-[#D6D6D6] text-[#1E1E1E]"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- Выбор веса --- */}
            <div className="mt-4">
              <div className="mb-2 text-[13px] font-medium text-[#1E1E1E]">
                Вес ({selectedProducer.name}):
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedProducer.weightOptions.map((opt) => {
                  const active = opt.weight === selectedWeight.weight;
                  return (
                    <button
                      key={opt.weight}
                      disabled={!opt.available}
                      onClick={() => setSelectedWeight(opt)}
                      className={`h-9 rounded-full px-4 text-[12px] ${
                        active
                          ? "bg-[#6F2A2B] text-white"
                          : "border border-[#D6D6D6] text-[#1E1E1E]"
                      } disabled:opacity-40`}
                    >
                      {opt.weight}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex flex-col gap-3 mt-5 sm:flex-row">
              <Button className="h-11 rounded-lg bg-[#6F2A2B] px-6 text-[14px] text-white hover:bg-[#5a2223] w-full sm:w-auto">
                Добавить в корзину
              </Button>
              <button
                onClick={() => setIsFav((v) => !v)}
                className={`flex h-11 items-center justify-center rounded-lg border sm:w-11 ${
                  isFav
                    ? "border-[#6F2A2B] text-[#6F2A2B]"
                    : "border-[#DADADA] text-[#9B9B9B]"
                }`}
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                <span className="ml-2 text-[14px] sm:hidden">
                  {isFav ? "В избранном" : "В избранное"}
                </span>
              </button>
            </div>

            {/* Характеристики */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-y-2 text-[14px]">
              <div className="text-[#6B6B6B]">Страна производства:</div>
              <div>{mockProduct.country}</div>
              <div className="text-[#6B6B6B]">Вкус:</div>
              <div>{mockProduct.tastes.join(", ")}</div>
              <div className="text-[#6B6B6B]">Вид животного:</div>
              <div>{mockProduct.animalType}</div>
              <div className="text-[#6B6B6B]">Размер:</div>
              <div>{mockProduct.size}</div>
              <div className="text-[#6B6B6B]">Возраст:</div>
              <div>{mockProduct.age}</div>
            </div>
          </div>
        </div>

        {/* Нижние секции */}
        <div className="mt-8 space-y-3">
          <CardSection title="Состав">
            Мясо индейки, рис, кукуруза, витамины и минералы…
          </CardSection>
          <CardSection title="Энергетическая ценность" defaultOpen>
            {mockProduct.nutritionalValue}
          </CardSection>
          <CardSection title="Гарантируемые показатели" defaultOpen>
            {mockProduct.guaranteedIndicators}
          </CardSection>
          <CardSection title="Нормы кормления" defaultOpen>
            <p className="text-[13px] leading-relaxed text-[#1E1E1E]">
              Вес / Кол-во корма: 1 мес – 5–10 г; 2–3 – 23–37 г; 4–5 – 45–55 г …
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#2a2a2a]">
              {mockProduct.feedingNote}
            </p>
          </CardSection>
        </div>
      </div>
      </ScrollReveal>
      <Footer />
    </div>
  );
}
