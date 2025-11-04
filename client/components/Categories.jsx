import { HoverLift, StaggerItem } from "../utils/CatalogAnimations";
export default function Categories() {
  const categories = [
    {
      name: "Кошка",
      count: "1 товар",
      bgColor: "#FFF4D8",
      image:
        "/categories/cat1.svg",
    },
    {
      name: "Котенок",
      count: "1 товар",
      bgColor: "#E7F4D8",
      image:
        "/categories/minicat.svg",
      },
    {
      name: "Наполнители",
      count: "1 товар",
      bgColor: "#E4EEF7",
      image:
        "/categories/napolnitel.svg",
    },
    {
      name: "Собака",
      count: "1 товар",
      bgColor: "#FCE4FA",
      image:
        "/categories/dog1.svg",
    },
    {
      name: "Щенок",
      count: "1 товар",
      bgColor: "#EFE2E0",
      image:
        "/categories/minidog1.svg",
    },
  ];

  return (
    <section className="py-12 bg-white sm:py-14">
      <div className="container px-4 mx-auto">
        {/* Заголовок */}
        <div className="flex flex-col items-center justify-between gap-3 mb-8 text-center sm:flex-row sm:mb-12 sm:text-left">
          <h2 className="text-xl sm:text-2xl text-[#6F2A2B]">
            Популярные категории
          </h2>
          <a
            href="/catalog"
            className="text-sm sm:text-base text-[#6F2A2B] hover:opacity-70"
          >
            Все категории
          </a>
        </div>

        {/* Сетка */}
        

        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6 justify-items-center">
          
          {categories.map((category, index) => (
            <StaggerItem key= {index}>
            <HoverLift>
            <div
              key={index}
              className="relative w-[160px] sm:w-[200px] lg:w-[220px] flex flex-col items-center"
            >
              {/* Фото */}
              <div
                className="z-10 w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: category.bgColor }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="object-cover w-full h-full rounded-full"
                />
              </div>

              {/* Нижний блок */}
              <div
                className="w-full sm:w-[200px] lg:w-[220px] h-[110px] sm:h-[130px] rounded-[16px] -mt-[28px] flex flex-col items-center justify-center text-center"
                style={{ backgroundColor: category.bgColor }}
              >
                <h3 className="text-[15px] sm:text-[17px] font-medium text-[#6F2A2B] leading-tight">
                  {category.name}
                </h3>
                <p className="mt-1 text-[12px] sm:text-[13px] text-[#7B7B7B]">
                  {category.count}
                </p>
              </div>
            </div>
            </HoverLift>
          </StaggerItem>
          ))}
        </div>
        
      </div>
    </section>
  );
}
