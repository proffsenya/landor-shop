export default function Categories() {
  const categories = [
    {
      name: "Кошка",
      count: "1 товар",
      bgColor: "#FFF4D8",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/0ddcc2c1a63c32f5e694f39256b745f1b6af9ffe?width=343",
    },
    {
      name: "Котенок",
      count: "1 товар",
      bgColor: "#E7F4D8",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/2cc8cbd5209689107e660e79c129778627baa667?width=337",
    },
    {
      name: "Наполнители",
      count: "1 товар",
      bgColor: "#E4EEF7",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/03e972a1f6d66458bef3cb7a0c2b785f7f8ef30b?width=332",
    },
    {
      name: "Собака",
      count: "1 товар",
      bgColor: "#FCE4FA",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/438f710fd4b37c2916755eba0f8aeaceaeb44c58?width=338",
    },
    {
      name: "Щенок",
      count: "1 товар",
      bgColor: "#EFE2E0",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/d0eec7ae862ea4b3a171e984607a35b9be6b33c5?width=367",
    },
  ];

  return (
    <section className="py-16 bg-white">
  <div className="container px-4 mx-auto">
    {/* Заголовок секции */}
    <div className="flex items-center justify-between mb-12">
      <h2 className="text-2xl text-[#6F2A2B]">Популярные категории</h2>
      <a href="/categories" className="text-base text-[#6F2A2B] hover:opacity-70">
        Все категории
      </a>
    </div>

    {/* Сетка карточек */}
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5 justify-items-center">
      {categories.map((category, index) => (
        <div key={index} className="relative w-[224px] h-[248px] flex flex-col items-center">
          
          {/* Верхний круг с фото */}
          <div
            className="z-10 w-[134px] h-[134px] rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: category.bgColor }}
          >
            <img
              src={category.image}
              alt={category.name}
              className="object-cover w-full h-full rounded-full"
            />
          </div>

          {/* Нижний цветной блок с текстом */}
          <div
            className="w-[224px] h-[140px] rounded-[20px] -mt-[34px] flex flex-col items-center justify-center text-center"
            style={{ backgroundColor: category.bgColor }}
          >
            <h3 className="text-[18px] font-medium text-[#6F2A2B] leading-tight">
              {category.name}
            </h3>
            <p className="mt-1 text-[13px] text-[#7B7B7B]">{category.count}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

  );
}
