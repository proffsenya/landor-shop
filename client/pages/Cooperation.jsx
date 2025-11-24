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
import { Building2, Truck, Users, CheckCircle2 } from "lucide-react";

import { getAuthToken } from "@/utils/auth";
import { validateName, validateEmail, validatePhone } from "@/utils/validation";
import { formatName, formatPhone } from "@/utils/formatting";

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

  const benefits = [
    {
      icon: Building2,
      title: "Оптовые клиенты",
      description: "Выгодные условия для крупных закупок"
    },
    {
      icon: Truck,
      title: "Доставка по России",
      description: "Быстрая и надежная доставка в любой город"
    },
    {
      icon: Users,
      title: "Сетевые магазины",
      description: "Специальные условия для розничных сетей"
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Применяем форматирование
    if (name === "name") {
      formattedValue = formatName(value);
    } else if (name === "phone") {
      formattedValue = formatPhone(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    // Валидация в реальном времени
    if (errors[name]) {
      let error = "";
      if (name === "name") {
        error = validateName(formattedValue, "Имя");
      } else if (name === "email") {
        error = validateEmail(formattedValue);
      } else if (name === "phone") {
        error = validatePhone(formattedValue);
      } else if (name === "city") {
        if (!formattedValue.trim()) {
          error = "Город обязателен для заполнения";
        }
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    const nameError = validateName(formData.name, "Имя");
    if (nameError) newErrors.name = nameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    if (!formData.city.trim()) {
      newErrors.city = "Город обязателен для заполнения";
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
      
      const authToken = getAuthToken();
      const headers = {
        "Content-Type": "application/json",
      };
      
      if (authToken && authToken !== "guest") {
        headers.Authorization = `Bearer ${authToken}`;
      }
      
      const response = await fetch("/api/forms/feedbackform", {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          comment: formData.comment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Сброс формы
      setFormData({
        name: "",
        phone: "",
        email: "",
        city: "",
        comment: "",
        consent: false,
      });
      
      alert("Спасибо! Наш специалист свяжется с вами в ближайшее время.");
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
        <div className="flex-1 py-8 md:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-[80px] max-w-7xl">
            <BreadcrumbNav items={[
              { label: "Главная", to: "/" },
              { label: "Сотрудничество" }
            ]} />

            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6">
                Сотрудничество
              </h1>
              <p className="max-w-3xl text-gray-700">
                Приглашаем к сотрудничеству оптовых клиентов и представителей розничной торговли, 
                сетевые зоомагазины, интернет-магазины, питомники и ветеринарные клиники для развития и расширения своего бизнеса.
              </p>
            </div>

            {/* Benefits Grid */}
            <PageFade>
              <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="p-6 transition-shadow border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg"
                    >
                      <div className="w-14 h-14 bg-[#6F2A2B] rounded-full flex items-center justify-center mb-4">
                        <IconComponent className="text-white w-7 h-7" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-gray-900">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-700">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </PageFade>

            {/* Info Section */}
            <PageFade>
              <div className="bg-gradient-to-r from-[#6F2A2B] to-[#8a3a3c] rounded-2xl p-8 md:p-12 text-white mb-12">
                <div className="max-w-3xl">
                  <h2 className="mb-4 text-xl font-semibold">
                    Оптовые поставки корма для собак и кошек
                  </h2>
                  <p className="mb-6 opacity-95">
                    Предлагаем приобрести корм для собак и кошек оптом от производителя с доставкой по Москве и России по выгодной цене. 
                    В наличии широкий ассортимент сухого и влажного корма для собак и кошек оптом.
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Для получения подробной информации об условиях сотрудничества, оставьте заявку.</span>
                  </div>
                </div>
              </div>
            </PageFade>

            {/* Form Section */}
            <PageFade>
              <div className="p-8 bg-white border-2 border-gray-200 shadow-lg rounded-2xl md:p-12">
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 text-center">
                    <h2 className="text-xl font-semibold text-[#6F2A2B] mb-3">
                      Связаться с нами
                    </h2>
                    <p className="text-gray-700">
                      Заполните форму и наш специалист свяжется с вами в ближайшее время!
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Имя */}
                      <div>
                        <Label htmlFor="name" className="block mb-2 text-base font-medium text-gray-900">
                          Ваше имя <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Иван"
                          className="w-full h-12"
                          onBlur={(e) => {
                            const error = validateName(e.target.value, "Имя");
                            if (error) {
                              setErrors((prev) => ({ ...prev, name: error }));
                            }
                          }}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                      </div>

                      {/* Телефон */}
                      <div>
                        <Label htmlFor="phone" className="block mb-2 text-base font-medium text-gray-900">
                          Ваш телефон <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="+7 (999) 123-45-67"
                          className="w-full h-12"
                          onBlur={(e) => {
                            const error = validatePhone(e.target.value);
                            if (error) {
                              setErrors((prev) => ({ ...prev, phone: error }));
                            }
                          }}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      {/* Email */}
                      <div>
                        <Label htmlFor="email" className="block mb-2 text-base font-medium text-gray-900">
                          Ваш Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="example@mail.ru"
                          className="w-full h-12"
                          onBlur={(e) => {
                            const error = validateEmail(e.target.value);
                            if (error) {
                              setErrors((prev) => ({ ...prev, email: error }));
                            }
                          }}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                      </div>

                      {/* Город */}
                      <div>
                        <Label htmlFor="city" className="block mb-2 text-base font-medium text-gray-900">
                          Город <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="г. Москва"
                          className="w-full h-12"
                          onBlur={(e) => {
                            if (!e.target.value.trim()) {
                              setErrors((prev) => ({ ...prev, city: "Город обязателен для заполнения" }));
                            }
                          }}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                        )}
                      </div>
                    </div>

                    {/* Комментарий */}
                    <div>
                      <Label htmlFor="comment" className="block mb-2 text-base font-medium text-gray-900">
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
                      <Label htmlFor="consent" className="flex-1 text-sm text-gray-700 cursor-pointer">
                        Нажимая на кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с политикой конфиденциальности. <span className="text-red-500">*</span>
                      </Label>
                    </div>
                    {errors.consent && (
                      <p className="text-sm text-red-500">{errors.consent}</p>
                    )}

                    {/* Кнопка отправки */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#6F2A2B] hover:bg-[#5a2223] text-white py-4 text-lg font-semibold rounded-xl h-14"
                      >
                        {loading ? "Отправка..." : "Отправить заявку"}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </PageFade>
          </div>
        </div>
      </PageFade>
      <Footer />
    </div>
  );
}
