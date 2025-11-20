import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Cooperation() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    comment: "",
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Обязательное поле";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Обязательное поле";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Обязательное поле";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Обязательное поле";
    }
    if (!formData.consent) {
      newErrors.consent = "Необходимо согласие";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // TODO: Заменить на реальный API endpoint
      // const response = await fetch("/api/cooperation/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // Временная заглушка
      console.log("Form data:", formData);
      alert("Спасибо! Наш специалист свяжется с вами в ближайшее время.");
      
      // Сброс формы
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        comment: "",
        consent: false,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Произошла ошибка при отправке формы. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      <PageFade>
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-140px)] py-8">
          <div className="container w-full max-w-4xl px-4 mx-auto">
            <BreadcrumbNav items={[
              { label: "Главная", to: "/" },
              { label: "Сотрудничество" }
            ]} />
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <h2 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-7 lg:mb-15">
                Сотрудничество
              </h2>

              <section className="mb-6">
                <ul className="pl-6 text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>
                      Приглашаем к сотрудничеству оптовых клиентов и представителей розничной торговли, сетевые зоомагазины, интернет-магазины, питомники и ветеринарные клиники для развития и расширения своего бизнеса.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>
                      Предлагаем приобрести корм для собак и кошек оптом от производителя с доставкой по Москве и России по выгодной цене. В наличии широкий ассортимент сухого и влажного корма для собак и кошек оптом.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>
                      Для получения подробной информации об условиях сотрудничества, оставьте заявку.
                    </span>
                  </li>
                </ul>
              </section>

              {/* Плашка "Связаться с нами" */}
              <section className="mb-6">
                <div className="bg-[#6F2A2B] text-white rounded-lg p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">Связаться с нами</h3>
                  <p className="text-base opacity-90">
                    Заполните форму и наш специалист свяжется с вами в ближайшее время!
                  </p>
                </div>
              </section>

              {/* Форма */}
              <section className="mb-6">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Имя */}
                    <div>
                      <Label htmlFor="name" className="text-base font-medium text-gray-900 mb-2 block">
                        Ваше имя
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Иван"
                        className="w-full"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>

                    {/* Телефон */}
                    <div>
                      <Label htmlFor="phone" className="text-base font-medium text-gray-900 mb-2 block">
                        Ваш телефон
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+7 (000) 000-00-00"
                        className="w-full"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email" className="text-base font-medium text-gray-900 mb-2 block">
                        Ваш Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="ivanov555@mail.ru"
                        className="w-full"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                      )}
                    </div>

                    {/* Город */}
                    <div>
                      <Label htmlFor="city" className="text-base font-medium text-gray-900 mb-2 block">
                        Город
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Москва"
                        className="w-full"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                      )}
                    </div>

                    {/* Комментарий */}
                    <div>
                      <Label htmlFor="comment" className="text-base font-medium text-gray-900 mb-2 block">
                        Комментарий
                      </Label>
                      <Textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        placeholder="Ваш комментарий..."
                        className="w-full min-h-[120px]"
                      />
                    </div>

                    {/* Согласие */}
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        checked={formData.consent}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({ ...prev, consent: checked }));
                          if (errors.consent) {
                            setErrors((prev) => ({ ...prev, consent: "" }));
                          }
                        }}
                        className="mt-1"
                      />
                      <Label htmlFor="consent" className="text-sm text-gray-700 cursor-pointer flex-1">
                        Нажимая на кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности.
                      </Label>
                    </div>
                    {errors.consent && (
                      <p className="text-red-500 text-sm">{errors.consent}</p>
                    )}

                    {/* Кнопка отправки */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6F2A2B] hover:bg-[#5a2223] text-white py-3 text-base md:text-lg font-semibold"
                      >
                        {loading ? "Отправка..." : "Отправить"}
                      </Button>
                    </div>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}

