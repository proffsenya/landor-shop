import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

// Моковые данные товара
const mockProduct = {
  id: 1,
  name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
  price: 3000,
  images: [
    "/placeholder.svg",
    "/placeholder.svg", 
    "/placeholder.svg",
    "/placeholder.svg"
  ],
  weightOptions: [
    { weight: "0.5кг", price: 1500, available: true },
    { weight: "1кг", price: 2000, available: true },
    { weight: "3кг", price: 3000, available: true, selected: true }
  ],
  isFavorite: false,
  country: "Россия",
  tastes: ["Индейка", "Лосось"],
  animalType: "Котёнок",
  size: "Все породы",
  age: "Котята",
  composition: "Мясо индейки, рис, кукуруза, витамины и минералы...",
  nutritionalValue: "422 ккал/100 г. Хранить в сухом прохладном месте при комнатной температуре и относительной влажности воздуха не более 75%.",
  guaranteedIndicators: "Сырой протеин 34%, сырой жир 19%, сырая клетчатка 2,3%, сырая зола 8%, углеводы 28,7%, влага 8%.",
  feedingNorms: [
    { weight: "1 прикорм", amount: "5-10г" },
    { weight: "2-3", amount: "23-37г" },
    { weight: "4-5", amount: "45-55г" },
    { weight: "6-7", amount: "63-70г" },
    { weight: "8-10", amount: "74-79г" },
    { weight: "11-12", amount: "70+ г (взрослый)" }
  ],
  feedingNote: "Рекомендуемое количество корма является ориентировочным и зависит от времени года, физической активности и индивидуальных особенностей животного. Корм следует вводить в рацион постепенно, в течение 5-10 дней. Необходимо следить за тем, чтобы у животного всегда была свежая питьевая вода."
};

// Компонент аккордеона
const AccordionSection = ({ title, children, isExpanded = false }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-3"
      >
        <span>{title}</span>
        {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {expanded && (
        <div className="text-gray-700 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

export default function Product() {
  const [product] = useState(mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(product.weightOptions.find(w => w.selected) || product.weightOptions[0]);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Хлебные крошки */}
        <div className="mb-6">
          <Link to="/catalog" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            В каталог
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Левая колонка - Изображения */}
          <div className="space-y-4">
            {/* Главное изображение */}
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Миниатюры */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index 
                      ? 'border-[hsl(var(--landor-primary))]' 
                      : 'border-transparent'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Правая колонка - Информация о товаре */}
          <div className="space-y-6">
            {/* Название и цена */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="text-3xl font-bold text-gray-900 mb-6">
                {formatPrice(selectedWeight.price)}
              </div>
            </div>

            {/* Количество */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Количество:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(quantity - 1)}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateQuantity(quantity + 1)}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Выбор веса */}
            <div>
              <span className="text-gray-700 font-medium mb-3 block">Выберите вес:</span>
              <div className="flex space-x-2">
                {product.weightOptions.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedWeight.weight === option.weight ? "default" : "outline"}
                    onClick={() => setSelectedWeight(option)}
                    className={`${
                      selectedWeight.weight === option.weight
                        ? 'bg-[hsl(var(--landor-primary))] text-white'
                        : 'border-gray-300'
                    }`}
                    disabled={!option.available}
                  >
                    {option.weight}
                  </Button>
                ))}
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex space-x-4">
              <Button 
                size="lg"
                className="flex-1 bg-[hsl(var(--landor-primary))] hover:bg-[hsl(var(--landor-primary))]/90 text-white"
              >
                Добавить в корзину
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={toggleFavorite}
                className={`${
                  isFavorite 
                    ? 'text-red-500 border-red-500' 
                    : 'text-gray-500 border-gray-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Детали товара */}
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Страна производства:</span>
                <span className="text-gray-900">{product.country}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Вкус:</span>
                <span className="text-gray-900">{product.tastes.join(", ")}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Вид животного:</span>
                <span className="text-gray-900">{product.animalType}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Размер:</span>
                <span className="text-gray-900">{product.size}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-32">Возраст:</span>
                <span className="text-gray-900">{product.age}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Детальная информация */}
        <div className="max-w-4xl">
          <Card>
            <CardContent className="p-6">
              <AccordionSection title="Состав">
                <p>{product.composition}</p>
              </AccordionSection>

              <AccordionSection title="Энергетическая ценность" isExpanded={true}>
                <p>{product.nutritionalValue}</p>
              </AccordionSection>

              <AccordionSection title="Гарантируемые показатели" isExpanded={true}>
                <p>{product.guaranteedIndicators}</p>
              </AccordionSection>

              <AccordionSection title="Нормы кормления" isExpanded={true}>
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-600">Вес, мес</th>
                          <th className="text-left py-2 font-medium text-gray-600">Кол-во корма, г</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.feedingNorms.map((norm, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2 text-gray-900">{norm.weight}</td>
                            <td className="py-2 text-gray-900">{norm.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.feedingNote}
                  </p>
                </div>
              </AccordionSection>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
