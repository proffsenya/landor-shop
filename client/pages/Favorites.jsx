import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import ProductsSection from "../components/ProductsSection";

const mockFavorites = [
  {
    id: 1,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1 кг",
    image: "/korm1.svg",
    dateAdded: "28.08.2025",
    isInStock: true,
  },
  {
    id: 2,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1 кг",
    image: "/korm1.svg",
    dateAdded: "28.08.2025",
    isInStock: false,
  },
  {
    id: 3,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    weight: "1 кг",
    image: "/korm1.svg",
    dateAdded: "28.08.2025",
    isInStock: true,
  },
];

export default function Favorites() {
  const [favorites, setFavorites] = useState(mockFavorites);
  const [selected, setSelected] = useState(new Set());

  const favoriteIds = useMemo(() => new Set(favorites.map(i => i.id)), [favorites]);
  const allSelected =
    selected.size > 0 &&
    favorites.length > 0 &&
    favorites.every(i => selected.has(i.id));

  const formatPrice = price =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0,
    }).format(price);

  const toggleAll = () => {
    setSelected(prev => {
      if (allSelected) return new Set();
      return new Set(favorites.map(i => i.id));
    });
  };

  const toggleOne = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      for (const x of Array.from(next)) if (!favoriteIds.has(x)) next.delete(x);
      return next;
    });
  };

  const removeSelected = () => {
    if (selected.size === 0) return;
    setFavorites(prev => prev.filter(i => !selected.has(i.id)));
    setSelected(new Set());
  };

  const addAllToCart = () => {
    const inStockItems = favorites.filter(item => item.isInStock);
    console.log("Добавляем в корзину:", inStockItems);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-[80px] py-10">
        {/* Заголовок */}
        <h1 className="text-[#6F2A2B] text-3xl leading-none mb-20">
          Избранное
        </h1>

        {/* Таблица */}
        <div className="overflow-hidden rounded-lg border border-[#E8E8E8] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[#1E1E1E] text-[15px] border-b border-[#E8E8E8]">
                  <th className="px-5 py-3 text-left font-normal w-[160px]">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span>Выбрать все</span>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="w-4 h-4 accent-[#6F2A2B]"
                      />
                    </label>
                  </th>
                  <th className="px-5 py-3 font-normal text-left">Товар</th>
                  <th className="px-5 py-3 font-normal text-left">Вес</th>
                  <th className="px-5 py-3 font-normal text-left">Стоимость</th>
                  <th className="px-5 py-3 font-normal text-left">Дата добавления</th>
                  <th className="px-5 py-3 font-normal text-left">Статус</th>
                  <th className="px-5 py-3 font-normal text-left"></th>
                </tr>
              </thead>

              <tbody>
                {favorites.map(item => (
                  <tr key={item.id} className="border-b border-[#F0F0F0]">
                    {/* Чекбокс выбора */}
                    <td className="px-5 py-6 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selected.has(item.id)}
                        onChange={() => toggleOne(item.id)}
                        className="w-4 h-4 accent-[#6F2A2B]"
                      />
                    </td>

                    {/* Товар */}
                    <td className="px-5 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-[64px] h-[96px] overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        <div className="text-[15px] text-[#1E1E1E] leading-tight pr-6 line-clamp-3">
                          {item.name}
                        </div>
                      </div>
                    </td>

                    {/* Вес */}
                    <td className="px-5 py-6 text-[15px] text-[#1E1E1E] whitespace-nowrap">
                      {item.weight}
                    </td>

                    {/* Стоимость */}
                    <td className="px-5 py-6 text-[15px] text-[#1E1E1E] whitespace-nowrap">
                      {formatPrice(item.price)}
                    </td>

                    {/* Дата */}
                    <td className="px-5 py-6 text-[15px] text-[#8B8B8B] whitespace-nowrap">
                      {item.dateAdded}
                    </td>

                    {/* Статус */}
                    <td className="px-5 py-6 text-[15px] whitespace-nowrap">
                      <span
                        className={
                          item.isInStock ? "text-green-600" : "text-red-600"
                        }
                      >
                        {item.isInStock ? "В наличии" : "Нет в наличии"}
                      </span>
                    </td>

                    {/* Кнопка */}
                    <td className="px-5 py-6 text-right whitespace-nowrap">
                      {item.isInStock && (
                        <button className="h-[40px] px-4 rounded-[10px] bg-[#6F2A2B] text-white text-[15px] hover:bg-[#5a2223]">
                          Добавить в корзину
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Нижняя панель */}
        <div className="flex items-center justify-between mt-6">
          <Link
            to="/catalog"
            className="inline-flex items-center text-[#5A5A5A] hover:text-[#1E1E1E]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            В каталог
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            {/* Удалить выбранные */}
            <button
              onClick={removeSelected}
              className="text-[#B00020] hover:opacity-80"
              disabled={selected.size === 0}
            >
              Удалить выбранные
            </button>

            {/* Добавить всё в корзину */}
            <button
              onClick={addAllToCart}
              className="inline-flex items-center h-[44px] px-4 rounded-[10px] bg-[#6F2A2B] text-white hover:bg-[#5a2223]"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Добавить в корзину
            </button>
          </div>
        </div>

        
      </div>
      {/* Рекомендации */}
      <div className="mt-12">
          <ProductsSection title="Рекомендовано для Вас" />
        </div>

      <Footer />
    </div>
  );
}
