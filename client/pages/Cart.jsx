import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

/** Моковые данные как в примере */
const mockCartItems = [
  {
    id: 1,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    quantity: 1,
    image: "/korm1.svg",
    weight: "1кг"
  },
  {
    id: 2,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    quantity: 1,
    image: "/korm1.svg",
    weight: "1кг"
  },
  {
    id: 3,
    name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
    price: 3000,
    quantity: 1,
    image: "/korm1.svg",
    weight: "1кг"
  }
];

export default function Cart() {
  const [items, setItems] = useState(mockCartItems);
  const [selected, setSelected] = useState(() => new Set(items.map(i => i.id)));
  const [payMethod, setPayMethod] = useState("cash");
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const allSelected = selected.size === items.length && items.length > 0;

  const toggleAll = () => {
    setSelected(prev =>
      prev.size === items.length ? new Set() : new Set(items.map(i => i.id))
    );
  };
  const toggleOne = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const updateQuantity = (id, n) => {
    if (n < 1) return;
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantity: n } : i)));
  };
  const removeItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalSelected = items
    .filter(i => selected.has(i.id))
    .reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items
    .filter(i => selected.has(i.id))
    .reduce((s, i) => s + i.price * i.quantity, 0);

  const f = (n) =>
    new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      minimumFractionDigits: 0
    }).format(n);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container px-6 py-8 mx-auto">
        <h1 className="text-[40px] leading-none text-[#6F2A2B] font-semibold mb-8">
          Ваша корзина
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
          {/* ЛЕВАЯ ТАБЛИЦА */}
          <div className="w-full">
            {/* Заголовок строк */}
            <div className="grid grid-cols-[32px_96px_1fr_220px_140px_72px] items-center text-sm text-[#1E1E1E] border-b">
              <div className="flex items-center gap-2 py-3 pl-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 border-gray-400 rounded"
                  />
                  <span>Выбрать всё</span>
                </label>
              </div>
              <div className="py-3">Товар</div>
              <div />
              <div className="py-3">Количество</div>
              <div className="py-3">Стоимость</div>
              <div className="py-3">Удалить</div>
            </div>

            {/* Товары */}
            {items.map((i, idx) => (
              <div
                key={i.id}
                className="grid grid-cols-[32px_96px_1fr_220px_140px_72px] items-center border-b last:border-b-0"
              >
                {/* чекбокс */}
                <div className="py-6 pl-2">
                  <input
                    type="checkbox"
                    checked={selected.has(i.id)}
                    onChange={() => toggleOne(i.id)}
                    className="w-4 h-4 border-gray-400 rounded"
                  />
                </div>

                {/* картинка */}
                <div className="py-6">
                  <img
                    src={i.image}
                    alt={i.name}
                    className="w-[64px] h-[96px] object-contain"
                  />
                </div>

                {/* описание */}
                <div className="py-6 pr-4">
                  <div className="text-[15px] text-[#292929]">
                    {i.name}
                  </div>
                  <div className="mt-3 text-sm text-gray-500">Вес: {i.weight}</div>
                </div>

                {/* количественный контрол */}
                <div className="py-6">
                  <div className="inline-flex items-center justify-between w-[140px] h-[40px] rounded-full border border-[#1E1E1E]">
                    <button
                      onClick={() => updateQuantity(i.id, i.quantity + 1)}
                      className="w-10 h-full text-[18px] leading-none"
                    >
                      +
                    </button>
                    <span className="text-[16px]">{i.quantity}</span>
                    <button
                      onClick={() => updateQuantity(i.id, i.quantity - 1)}
                      className="w-10 h-full text-[18px] leading-none"
                    >
                      –
                    </button>
                  </div>
                </div>

                {/* цена */}
                <div className="py-6 text-[#6F2A2B] font-medium">
                  {f(i.price * i.quantity)}
                </div>

                {/* удалить */}
                <div className="py-6">
                  <button
                    onClick={() => removeItem(i.id)}
                    className="p-2 rounded hover:bg-gray-100"
                    aria-label="Удалить"
                  >
                    <Trash2 className="w-5 h-5 text-[#1E1E1E]" />
                  </button>
                </div>

                {/* разделитель как в макете */}
                {idx < items.length - 1 && (
                  <div className="col-span-6 border-t opacity-0" />
                )}
              </div>
            ))}

            {/* Ссылка "в каталог" */}
            <div className="mt-6">
              <Link
                to="/"
                className="inline-flex items-center text-[#5a5a5a] hover:text-[#1e1e1e]"
              >
                ← В каталог
              </Link>
            </div>
          </div>

          {/* ПРАВАЯ ПАНЕЛЬ */}
          <aside className="w-full border-l lg:pl-8">
            <div className="border rounded-[12px] p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[#1E1E1E] text-center">
                Информация по заказу
              </h2>

              <div className="mt-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6F2A2B] font-medium">
                    Итоговая стоимость
                  </span>
                  <span className="text-[#1E1E1E]">
                    {totalSelected} {totalSelected === 1 ? "товар" : "товара"}&nbsp;&nbsp;
                    <strong>{f(totalPrice)}</strong>
                  </span>
                </div>
              </div>

              {/* Платёж */}
              <div className="mt-6">
                <div className="text-[#6F2A2B] font-medium mb-2">
                  Платежная информация
                </div>
                <label className="flex items-center gap-2 mb-2 text-sm">
                  <input
                    type="radio"
                    name="pay"
                    value="cash"
                    checked={payMethod === "cash"}
                    onChange={() => setPayMethod("cash")}
                  />
                  Наличные
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="pay"
                    value="umoney"
                    checked={payMethod === "umoney"}
                    onChange={() => setPayMethod("umoney")}
                  />
                  Юmoney
                </label>
              </div>

              {/* Доставка */}
              <div className="mt-6">
                <div className="text-[#6F2A2B] font-medium mb-3">Доставка</div>
                <input
                  value={receiver}
                  onChange={e => setReceiver(e.target.value)}
                  placeholder="ФИО получателя"
                  className="w-full h-10 px-3 mb-3 border rounded placeholder:text-gray-400"
                />
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Номер телефона"
                  className="w-full h-10 px-3 mb-3 border rounded placeholder:text-gray-400"
                />
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Адрес доставки"
                  className="w-full h-10 px-3 mb-4 border rounded placeholder:text-gray-400"
                />
                <button
                  className="w-full h-12 rounded bg-[#6F2A2B] text-white text-lg hover:opacity-90"
                >
                  Оплатить
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
