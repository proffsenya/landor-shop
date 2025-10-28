import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart } from "lucide-react";

const mockProduct = {
  id: 1,
  name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
  images: ["/korm1.svg", "/korm1.svg", "/korm1.svg", "/korm1.svg"],
  isFavorite: false,
  weightOptions: [
    { weight: "0.5кг", price: 1500, available: true },
    { weight: "1кг", price: 2000, available: true },
    { weight: "3кг", price: 3000, available: true, selected: true }
  ],
  country: "Россия",
  tastes: ["Индейка", "Лосось"],
  animalType: "Котёнок",
  size: "Все породы",
  age: "Котята",
  nutritionalValue:
    "422 ккал/100 г. Хранить в сухом прохладном месте при комнатной температуре и относительной влажности воздуха не более 75%.",
  guaranteedIndicators:
    "Сырой протеин 34 %, сырой жир 19 %, сырая клетчатка 2,3 %, сырая зола 8 %, углеводы 28,7 %, влага 8 %.",
  feedingNote:
    "Рекомендуемое количество корма является ориентировочным и зависит от времени года, физической активности и индивидуальных особенностей животного. Корм следует вводить в рацион постепенно, в течение 5–10 дней. Необходимо следить за тем, чтобы у животного всегда была свежая питьевая вода."
};

function CardSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-[#E6E6E6]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-[15px] font-medium text-[#1E1E1E] sm:px-5 sm:py-4 sm:text-[16px]"
      >
        {title}
        <span className="inline-flex h-6 w-6 items-center justify-center text-[#6F2A2B] text-[18px]">
          {open ? "–" : "+"}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 text-[14px] leading-relaxed text-[#2a2a2a] sm:px-5 sm:pb-5 sm:text-[15px]">
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
  const [selectedWeight, setSelectedWeight] = useState(
    mockProduct.weightOptions.find((w) => w.selected) || mockProduct.weightOptions[0]
  );
  const price = selectedWeight.price.toLocaleString("ru-RU") + "₽";

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-6 md:px-10 lg:px-[84px] md:py-8">
        <Link
          to="/catalog"
          className="mb-4 inline-flex items-center text-[14px] text-[#6B6B6B] hover:text-[#1E1E1E] sm:text-[15px] md:mb-5"
        >
          <ArrowLeft className="w-4 h-4 mr-2 sm:h-5 sm:w-5" />
          В каталог
        </Link>

        {/* Сетка: мобайл 1 колонка, планшет/ПК — 2 */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-2">
          {/* Левая часть — изображения */}
          <div className="flex flex-col w-full">
            {/* Главное изображение */}
            <div className="relative rounded-lg border border-[#E6E6E6] bg-white p-2 sm:p-3">
              <div className="flex w-full items-center justify-center overflow-hidden rounded-md bg-[#F2F2F2] h-64 sm:h-80 md:h-[360px] lg:h-[410px]">
                <img
                  src={mockProduct.images[selectedImage]}
                  alt={mockProduct.name}
                  className="object-contain w-full h-full"
                />
              </div>
            </div>

            {/* Миниатюры под основным изображением */}
            <div className="grid grid-cols-4 gap-2 mt-3 sm:mt-4 sm:gap-3">
              {mockProduct.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`overflow-hidden rounded-md border ${
                    selectedImage === i ? "border-[#6F2A2B]" : "border-[#E6E6E6]"
                  } bg-[#F7F7F7] h-16 sm:h-20 md:h-24`}
                  title={`img-${i}`}
                >
                  <img
                    src={img}
                    alt={`img-${i}`}
                    className="object-contain w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Правая часть — информация */}
          <div className="md:pl-6 lg:pl-8">
            <h1 className="text-[20px] font-semibold leading-snug text-[#1E1E1E] sm:text-[24px] md:text-[26px] max-w-none md:max-w-[520px]">
              {mockProduct.name}
            </h1>

            {/* Цена + счетчик: на мобайле в колонку */}
            <div className="flex flex-col items-start gap-4 mt-4 sm:mt-5 sm:flex-row sm:items-center sm:gap-6">
              <div className="text-[24px] font-semibold text-[#1E1E1E] sm:text-[28px] md:text-[30px]">
                {price}
              </div>

              <div className="inline-flex h-9 items-center rounded-full border border-[#1E1E1E]">
                <button
                  onClick={() => setQty((n) => Math.max(1, n - 1))}
                  className="h-9 w-9 text-[18px] leading-none"
                >
                  –
                </button>
                <span className="min-w-[36px] text-center text-[15px]">{qty}</span>
                <button
                  onClick={() => setQty((n) => n + 1)}
                  className="h-9 w-9 text-[18px] leading-none"
                >
                  +
                </button>
              </div>
            </div>

            {/* Выбор веса */}
            <div className="mt-5 sm:mt-6">
              <div className="mb-2 text-[13px] font-medium text-[#1E1E1E] sm:text-[14px]">
                Выберите вес:
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {mockProduct.weightOptions.map((opt) => {
                  const active = opt.weight === selectedWeight.weight;
                  return (
                    <button
                      key={opt.weight}
                      disabled={!opt.available}
                      onClick={() => setSelectedWeight(opt)}
                      className={`h-9 rounded-full px-4 text-[12px] sm:px-5 sm:text-[13px] ${
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
            <div className="flex flex-col gap-3 mt-5 sm:mt-6 sm:flex-row sm:items-center">
              <Button className="h-11 rounded-lg bg-[#6F2A2B] px-6 text-[14px] text-white hover:bg-[#5a2223] w-full sm:w-auto">
                Добавить в корзину
              </Button>
              <button
                onClick={() => setIsFav((v) => !v)}
                className={`flex h-11 w-full items-center justify-center rounded-lg border sm:w-11 sm:justify-center ${
                  isFav
                    ? "border-[#6F2A2B] text-[#6F2A2B]"
                    : "border-[#DADADA] text-[#9B9B9B]"
                }`}
                aria-label="Избранное"
              >
                <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
                <span className="ml-2 text-[14px] sm:hidden">
                  {isFav ? "В избранном" : "В избранное"}
                </span>
              </button>
            </div>

            {/* Характеристики: мобайл — одна колонка, планшет+ — 2 */}
            <div className="mt-6 grid grid-cols-1 gap-y-2 text-[14px] sm:mt-7 md:grid-cols-[180px_1fr]">
              <div className="text-[#6B6B6B]">Страна производства:</div>
              <div className="text-[#1E1E1E]">{mockProduct.country}</div>

              <div className="text-[#6B6B6B]">Вкус:</div>
              <div className="text-[#1E1E1E]">{mockProduct.tastes.join(", ")}</div>

              <div className="text-[#6B6B6B]">Вид животного:</div>
              <div className="text-[#1E1E1E]">{mockProduct.animalType}</div>

              <div className="text-[#6B6B6B]">Размер:</div>
              <div className="text-[#1E1E1E]">{mockProduct.size}</div>

              <div className="text-[#6B6B6B]">Возраст:</div>
              <div className="text-[#1E1E1E]">{mockProduct.age}</div>
            </div>
          </div>
        </div>

        {/* Нижние секции */}
        <div className="mt-8 space-y-3 sm:mt-10 sm:space-y-4">
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
            <p className="text-[13px] leading-relaxed text-[#1E1E1E] sm:text-[14px]">
              Вес, мес / Кол-во корма, г
              <br />
              1 прикорм: 5–10г; 2–3: 23–37г; 4–5: 45–55г; 6–7: 63–70г; 8–10:
              74–79г; 11–12: 70+ г (взрослый).
            </p>
            <p className="mt-2 text-[12px] leading-relaxed text-[#2a2a2a] sm:text-[13px]">
              {mockProduct.feedingNote}
            </p>
          </CardSection>
        </div>
      </div>

      <Footer />
    </div>
  );
}
