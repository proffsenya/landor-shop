import ProductCard from "./ProductCard";

export default function ProductsSection({ title, linkText = "Все товары" }) {
  const products = [
    {
      image: "/korm1.svg",
      title: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
      price: "3000 ₽",
    },
    {
      image: "/korm1.svg",
      title: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
      price: "3000 ₽",
    },
    {
      image: "/korm1.svg",
      title: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
      price: "3000 ₽",
    },
    {
      image: "/korm1.svg",
      title: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
      price: "3000 ₽",
    },
    {
      image: "/korm1.svg",
      title: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
      price: "3000 ₽",
    },
  ];

  return (
    <section className="py-10 bg-white sm:py-12 md:py-16">
      <div className="container px-3 mx-auto sm:px-4 md:px-6">
        {/* Заголовок + ссылка */}
        <div className="flex flex-col gap-3 mb-8 sm:flex-row sm:items-center sm:justify-between sm:mb-10 md:mb-12">
          <h2 className="text-xl sm:text-2xl text-[#6F2A2B] text-center sm:text-left">
            {title}
          </h2>
          <a
            href="/products"
            className="text-sm sm:text-base text-[#6F2A2B] hover:opacity-70 text-center sm:text-right"
          >
            {linkText}
          </a>
        </div>

        {/* Сетка карточек */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product, index) => (
            <ProductCard
              key={index}
              image={product.image}
              title={product.title}
              price={product.price}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
