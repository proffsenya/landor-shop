export default function Benefits() {
  const benefits = [
    {
      title: "Конкурентные цены",
      description: "Стоимость нашей продукции дешевле чем у конкурентов",
      icon: (
        <svg className="w-20 h-20" viewBox="0 0 90 91" fill="none">
          <path d="M38.1822 89.4438L59.3822 41.0688L49.7822 20.8188L44.9822 19.3188L23.3822 27.1938L2.58218 74.4438L4.98218 77.4438L38.1822 89.4438Z" fill="#FB4E7B"/>
          <path d="M46.9822 55.3188L45.7822 51.1938L42.9822 47.4438L39.7822 44.8188L36.1822 43.3188L29.7822 42.5688L24.9822 44.8188L20.5822 48.5688L18.5822 53.0688V57.1938L20.1822 61.6938L21.7822 64.3188L23.7822 66.5688L27.3822 68.0688L31.7822 68.4438H34.9822L38.5822 68.0688L41.3822 66.5688L42.9822 64.3188L45.7822 61.6938L46.9822 55.3188Z" fill="#FEDC63"/>
          <path d="M52.5822 21.5688L65.3822 25.6938L88.5822 71.4438L87.7822 75.1938L56.9822 89.0688L51.3822 87.1938L45.7822 76.3188V74.0688L60.5822 41.0688L51.3822 22.3188L52.5822 21.5688Z" fill="#00C3FF"/>
        </svg>
      ),
    },
    {
      title: "Быстрая доставка",
      description: "Доставка в нашем интернет магазине всего 1 день",
      icon: (
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/cfbd17c7ee437e7d5ccb3dedd7328f63eb68e3d6?width=216" 
          alt="Delivery" 
          className="w-24 h-24"
        />
      ),
    },
    {
      title: "Сотрудничество",
      description: "Наш интернет магазин сотрудничает с магазинами и питомниками",
      icon: (
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/ef912ad25fa33bc40d7477313f18cd98ff56fa88?width=178" 
          alt="Partnership" 
          className="w-20 h-28"
        />
      ),
    },
    {
      title: "Гарантия качества",
      description: "У нашего магазина есть гарантия качества от производителя",
      icon: (
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/1d36e8fd9d4121cb3449fa325d6b1abdd260676e?width=216" 
          alt="Quality" 
          className="w-24 h-24"
        />
      ),
    },
  ];

  return (
    <section className="py-16 bg-white">
  <div className="container px-4 mx-auto">
    <h2 className="text-2xl text-[#6F2A2B] mb-[73px]">
      Наши преимущества
    </h2>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
      {benefits.map((benefit, index) => (
        <div
          key={index}
          className="flex justify-between items-center bg-[#FCFCFC] rounded-2xl border border-gray-200 shadow-sm w-[400px] h-[200px] p-6"
        >
          {/* Левая часть — текст */}
          <div className="flex flex-col justify-center w-[220px]">
            <h3 className="text-xl text-[#6F2A2B] font-medium mb-2">
              {benefit.title}
            </h3>
            <p className="text-base text-[#3A3A3A] leading-snug">
              {benefit.description}
            </p>
          </div>

          {/* Правая часть — иконка */}
          <div className="flex-shrink-0 ml-[23px]">
            {benefit.icon}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

  );
}
