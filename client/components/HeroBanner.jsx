import { Link } from "react-router-dom";
export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-[#FFF1DA]">
      {/* Баннер показывается только на lg и выше */}
      <div className="relative hidden w-full lg:block">
        <img
          src="/banner2.svg"
          alt="Landor Banner"
          className="object-cover w-full h-auto"
        />

        {/* Текст и кнопка */}
        <div className="absolute inset-0 flex flex-col justify-center px-20 xl:px-28 2xl:px-40">
          <div className="max-w-[560px] -translate-x-20 -translate-y-6">
            <h1 className="text-[#6F2A2B] font-bold leading-[1.15] text-[40px] xl:text-[40px] mb-4">
              Ваш любимец — наш{" "}
              <span className="block">главный дегустатор</span>
            </h1>
            <Link to = "/catalog">
            <button className="bg-[#6F2A2B] text-white px-7 py-3 rounded-full translate-x-[80px] hover:bg-[#5a2223] transition-colors text-[16px] font-semibold shadow-md">
              Заказать сейчас
            </button></Link>
          </div>
        </div>

        {/* Заголовок сверху */}
        <div className="absolute top-[30px] left-1/2 -translate-x-1/2 text-center">
          <p className="text-[#6F2A2B] font-bold text-[30px] xl:text-[34px]">
            Добро пожаловать на Landor Shop!
          </p>
        </div>
      </div>
    </section>
  );
}
