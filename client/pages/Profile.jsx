import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

// Моки
const mockUser = {
  firstName: "Иван",
  lastName: "",
  middleName: "",
  email: "",
  phone: "",
  avatar: null,
};

const mockDelivery = {
  city: "",
  address: "",
  apartment: "",
  entrance: "",
  floor: "",
};

const mockOrders = [
  { id: "134534", date: "01.09.2025" },
  { id: "134534", date: "01.09.2025" },
  { id: "134534", date: "01.09.2025" },
];

// Ряд с инпутом и маленькой кнопкой справа (адаптив)
function RowWithButton({
  placeholder,
  value,
  onChange,
  isEditing,
  onToggle,
  type = "text",
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={!isEditing}
        className={`h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1 ${
          isEditing ? "ring-1 ring-[#6F2A2B]/20" : ""
        }`}
      />
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onToggle}
        className="text-[13px] sm:w-auto w-full"
      >
        {isEditing ? "Сохранить" : "Изменить"}
      </Button>
    </div>
  );
}

export default function Profile() {
  const [user, setUser] = useState(mockUser);
  const [delivery, setDelivery] = useState(mockDelivery);
  const [orders] = useState(mockOrders);

  const [editing, setEditing] = useState({
    lastName: false,
    firstName: false,
    middleName: false,
    email: false,
    phone: false,
    delivery: false,
  });

  const toggle = (key) => setEditing((s) => ({ ...s, [key]: !s[key] }));

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-[64px] py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Профиль — уменьшенный */}
          <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
            <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1E1E1E] text-center">
              Профиль
            </h2>

            <div className="flex flex-col items-center mt-4 sm:mt-5">
              <div className="w-[96px] h-[96px] sm:w-[140px] sm:h-[140px] rounded-full bg-[#E5E5E5]" />
              <div className="mt-3 text-[16px] sm:text-[18px] font-semibold text-[#1E1E1E]">
                {user.firstName || "Иван"}
              </div>
            </div>

            <div className="mt-5 space-y-3 sm:mt-6">
              <RowWithButton
                placeholder="Фамилия"
                value={user.lastName}
                isEditing={editing.lastName}
                onChange={(v) => setUser((s) => ({ ...s, lastName: v }))}
                onToggle={() => toggle("lastName")}
              />
              <RowWithButton
                placeholder="Имя"
                value={user.firstName}
                isEditing={editing.firstName}
                onChange={(v) => setUser((s) => ({ ...s, firstName: v }))}
                onToggle={() => toggle("firstName")}
              />
              <RowWithButton
                placeholder="Отчество"
                value={user.middleName}
                isEditing={editing.middleName}
                onChange={(v) => setUser((s) => ({ ...s, middleName: v }))}
                onToggle={() => toggle("middleName")}
              />
              <RowWithButton
                placeholder="Почта"
                value={user.email}
                isEditing={editing.email}
                onChange={(v) => setUser((s) => ({ ...s, email: v }))}
                onToggle={() => toggle("email")}
                type="email"
              />
              <RowWithButton
                placeholder="Номер телефона"
                value={user.phone}
                isEditing={editing.phone}
                onChange={(v) => setUser((s) => ({ ...s, phone: v }))}
                onToggle={() => toggle("phone")}
              />

              {/* Пароль — только отображение, без редактирования */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="password"
                  value={"••••••••"}
                  placeholder="Пароль"
                  disabled
                  className="h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] text-[#1E1E1E] placeholder:text-[#B9B9B9] outline-none sm:flex-1"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-[13px] sm:w-auto w-full"
                >
                  Изменить
                </Button>
              </div>
            </div>
          </div>

          {/* Правая колонка — меньше размеров */}
          <div className="flex flex-col gap-6">
            {/* Доставка */}
            <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
              <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1E1E1E]">
                Данные для доставки
              </h2>

              <div className="flex flex-col gap-2 mt-3 sm:mt-4 sm:flex-row sm:items-center sm:gap-3">
                <input
                  className="w-full h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] placeholder:text-[#B9B9B9] outline-none"
                  placeholder="Город, адрес"
                  value={
                    delivery.city || delivery.address
                      ? [delivery.city, delivery.address].filter(Boolean).join(", ")
                      : ""
                  }
                  disabled={!editing.delivery}
                  onChange={(e) =>
                    setDelivery((s) => {
                      const val = e.target.value;
                      const [city, ...rest] = val.split(",");
                      return {
                        ...s,
                        city: city?.trim() || "",
                        address: rest.join(",").trim(),
                      };
                    })
                  }
                />
                <button
                  type="button"
                  className="text-[#6F2A2B] text-[14px] whitespace-nowrap hover:opacity-80 sm:self-auto self-start"
                >
                  Показать на карте
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-3 sm:gap-3">
                <input
                  className="h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] placeholder:text-[#B9B9B9] outline-none"
                  placeholder="Квартира"
                  value={delivery.apartment}
                  disabled={!editing.delivery}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, apartment: e.target.value }))
                  }
                />
                <input
                  className="h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] placeholder:text-[#B9B9B9] outline-none"
                  placeholder="Подъезд"
                  value={delivery.entrance}
                  disabled={!editing.delivery}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, entrance: e.target.value }))
                  }
                />
                <input
                  className="h-10 rounded-lg border border-[#E8E8E8] bg-white px-3 text-[14px] placeholder:text-[#B9B9B9] outline-none"
                  placeholder="Этаж"
                  value={delivery.floor}
                  disabled={!editing.delivery}
                  onChange={(e) =>
                    setDelivery((s) => ({ ...s, floor: e.target.value }))
                  }
                />
              </div>

              <div className="mt-4">
                <Button
                  type="button"
                  onClick={() => toggle("delivery")}
                  className="h-[38px] px-4 rounded-lg bg-[#6F2A2B] text-white text-[14px] hover:bg-[#5a2223] w-full sm:w-auto"
                >
                  {editing.delivery ? "Сохранить" : "Изменить"}
                </Button>
              </div>
            </div>

            {/* История заказов */}
            <div className="border border-[#E8E8E8] rounded-xl p-4 sm:p-6">
              <h2 className="text-[18px] sm:text-[22px] font-semibold text-[#1E1E1E]">
                История заказов
              </h2>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="text-[#1E1E1E] border-b border-[#E8E8E8]">
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]">Номер</th>
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]">Дата</th>
                      <th className="py-2 text-left font-normal text-[13px] sm:text-[14px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, idx) => (
                      <tr key={idx} className="border-b border-[#F3F3F3]">
                        <td className="py-2 text-[13px] sm:text-[14px]">Заказ №{o.id}</td>
                        <td className="py-2 text-[13px] sm:text-[14px] text-[#6F6F6F]">{o.date}</td>
                        <td className="py-2">
                          <button
                            type="button"
                            className="text-[#6F2A2B] text-[13px] sm:text-[14px] hover:opacity-80"
                          >
                            Открыть
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
