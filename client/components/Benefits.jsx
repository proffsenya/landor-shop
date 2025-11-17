export default function Benefits() {
  const benefits = [
    {
      title: "Конкурентные цены",
      description: "Мы готовы предложить Вам корма по привлекательным ценам",
      icon: (
        <img src="/benefits/prices.svg" className="w-14 h-14 sm:w-16 sm:h-16" viewBox="0 0 90 91" fill="none"></img>
      ),
    },
    {
      title: "Быстрая доставка",
      description: "Доставка в нашем интернет магазине от 1 дня",
      icon: (
        <img 
          src="/benefits/delivery-truck.svg" 
          alt="Delivery" 
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />
      ),
    },
    {
      title: "Сотрудничество",
      description: "Наш интернет магазин сотрудничает с магазинами и питомниками",
      icon: (
        <img 
          src="/benefits/support.svg"  
          alt="Partnership" 
          className="object-contain w-14 h-18 sm:w-16 sm:h-20"
        />
      ),
    },
    {
      title: "Гарантия качества",
      description: "У нашего магазина есть гарантия качества от производителя",
      icon: (
        <img 
          src="/benefits/factory.svg"  
          alt="Quality" 
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />
      ),
    },
    {
      title: "Приятные бонусы",
      description: "Регулярные акции и скидки на нашем сайте",
      icon: (
        <img 
          src="/benefits/gift-box.png"  
          alt="Quality" 
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />
      ),
    },
    {
      title: "Доставка по россии",
      description: "Мы предлагаем доставку ТК в большинство регионов страны",
      icon: (
        <img 
          src="/benefits/location.png"  
          alt="Quality" 
          className="object-contain w-16 h-16 sm:w-20 sm:h-20"
        />
      ),
    },
  ];

  return (
    <section className="py-10 bg-white sm:py-14">
      <div className="container px-4 mx-auto">
        <h2 className="text-xl sm:text-2xl text-[#6F2A2B] mb-8 sm:mb-12 text-center sm:text-left">
          Наши преимущества
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row justify-between items-center bg-[#FCFCFC] rounded-2xl border border-gray-200 shadow-sm w-full sm:w-[340px] h-auto sm:h-[160px] p-4 sm:p-5"
            >
              {/* Левая часть — текст */}
              <div className="flex flex-col justify-center text-center sm:text-left sm:w-[200px] mb-4 sm:mb-0">
                <h3 className="text-lg text-[#6F2A2B] font-medium mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[#3A3A3A] leading-snug">
                  {benefit.description}
                </p>
              </div>

              {/* Правая часть — иконка */}
              <div className="flex-shrink-0 sm:ml-[18px]">
                {benefit.icon}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
