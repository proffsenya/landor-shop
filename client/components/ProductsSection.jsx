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
    <section className="py-16 bg-white">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-2xl text-[#6F2A2B]">{title}</h2>
          <a href="/products" className="text-base text-[#6F2A2B] hover:opacity-70">
            {linkText}
          </a>
        </div>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
