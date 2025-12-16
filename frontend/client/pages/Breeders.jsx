import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { AuthToast } from "@/components/AuthToast";
import { Truck, Tag, Package, Paperclip, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import { getAuthToken } from "@/utils/auth";
import { validateReceiver, validateEmail, validatePhone } from "@/utils/validation";
import { formatReceiver, formatPhone } from "@/utils/formatting";
import { safeError } from "@/utils/logger";

export default function Breeders() {
  const [formData, setFormData] = useState({
    organizationName: "",
    fullName: "",
    city: "",
    email: "",
    phone: "",
    file: null,
    consent: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

  const benefits = [
    {
      icon: Truck,
      title: "Бесплатная доставка",
      description: "Для участников программы заводчиков",
    },
    {
      icon: Tag,
      title: "Специальные цены",
      description: "Выгодные условия для заводчиков",
    },
    {
      icon: Package,
      title: "Скидки от объёма",
      description: "Чем больше заказ, тем больше скидка",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Применяем форматирование
    if (name === "fullName") {
      formattedValue = formatReceiver(value);
    } else if (name === "phone") {
      formattedValue = formatPhone(value);
    }
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    // Валидация в реальном времени
    if (errors[name]) {
      let error = "";
      if (name === "fullName") {
        error = validateReceiver(formattedValue);
      } else if (name === "email") {
        error = validateEmail(formattedValue);
      } else if (name === "phone") {
        error = validatePhone(formattedValue);
      } else if (name === "organizationName") {
        if (!formattedValue.trim()) {
          error = "Название питомника обязательно для заполнения";
        }
      } else if (name === "city") {
        if (!formattedValue.trim()) {
          error = "Город обязателен для заполнения";
        }
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Название питомника обязательно для заполнения";
    }
    
    const fullNameError = validateReceiver(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    
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
      
      // Проверка авторизации
      if (!authToken || authToken === "guest") {
        setAuthToastMessage("Для отправки заявки необходимо авторизоваться");
        setShowAuthToast(true);
        setLoading(false);
        return;
      }
      
      // Создаем FormData (как в Postman: form-data)
      const formDataToSend = new FormData();
      
      // 1. Отправляем оригинальный файл с явным указанием Content-Type: image/jpeg (если файл есть)
      if (formData.file) {
        let fileToSend = formData.file;
        if (!fileToSend.type || fileToSend.type !== "image/jpeg") {
          // Создаем новый File с явным указанием типа image/jpeg
          fileToSend = new File([fileToSend], fileToSend.name || "registration.jpeg", { 
            type: "image/jpeg",
            lastModified: fileToSend.lastModified || Date.now()
          });
        }
        formDataToSend.append("registrationFile", fileToSend, fileToSend.name || "registration.jpeg");
      }
      
      // 2. Создаем JSON объект для nurseryFormDTO (тип: Text, Content-Type: application/json)
      const nurseryFormDTO = {
        organizationName: formData.organizationName.trim(),
        fullName: formData.fullName.trim(),
        city: formData.city.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        fileName: formData.file ? formData.file.name || "" : "",
      };
      
      // Преобразуем JSON в строку
      const jsonString = JSON.stringify(nurseryFormDTO);
      
      // В Postman тип "Text" с Content-Type: application/json
      // Используем Blob с типом application/json для правильного Content-Type
      const jsonBlob = new Blob([jsonString], { type: "application/json" });
      formDataToSend.append("nurseryFormDTO", jsonBlob);
      

      // Устанавливаем заголовки (НЕ устанавливаем Content-Type - браузер сделает это автоматически для FormData)
      const headers = {
        Authorization: `Bearer ${authToken}`,
      };

      const response = await fetch("/api/forms/nurseryform", {
        method: "POST",
        headers,
        body: formDataToSend,
      });

      // Обработка 401 - показываем уведомление об авторизации
      if (response.status === 401) {
        setAuthToastMessage("Для отправки заявки необходимо авторизоваться");
        setShowAuthToast(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        let errorText = "";
        try {
          errorText = await response.text();
          safeError("Error response:", errorText);
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch (e) {
          safeError("Error parsing response:", e);
          errorText = errorText || `Internal Server Error (${response.status})`;
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      // Сброс формы
      setFormData({
        organizationName: "",
        fullName: "",
        city: "",
        email: "",
        phone: "",
        file: null,
        consent: false,
      });
      showToast("Заявка отправлена! Менеджер свяжется с вами в ближайшее время.");
    } catch (error) {
      safeError("Error submitting form:", error);
      // Проверяем, не 401 ли это
      if (error?.message && (error.message.includes("401") || error.message.includes("Unauthorized"))) {
        setAuthToastMessage("Для отправки заявки необходимо авторизоваться");
        setShowAuthToast(true);
      } else {
        showToast("Произошла ошибка при отправке заявки. Попробуйте позже.");
      }
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
              { label: "Заводчикам" }
            ]} />

            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6">
                Заводчикам
              </h1>
              <p className="max-w-3xl text-gray-700">
                Мы предоставляем особые условия обслуживания заводчикам для развития вашего питомника и заботы о ваших питомцах.
              </p>
            </div>

            {/* Benefits List */}
            {/* <PageFade>
              <div className="bg-gradient-to-r from-[#6F2A2B] to-[#8a3a3c] rounded-2xl p-8 md:p-12 text-white mb-12">
                <h2 className="mb-6 text-xl font-semibold">
                  Особые условия для заводчиков:
                </h2>
                <ul className="space-y-4">
                  {[
                    "Бесплатная доставка",
                    "Специальные цены",
                    "Скидки от объёма"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="flex-shrink-0 w-5 h-5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </PageFade> */}

            {/* Benefits Grid */}
            <PageFade>
              <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
                {benefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div
                      key={index}
                      className="p-8 transition-all border border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="w-16 h-16 bg-[#6F2A2B] rounded-full flex items-center justify-center mb-6">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="mb-3 text-xl font-semibold text-gray-900">
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

            {/* Form Section */}
            <PageFade>
              <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#6F2A2B] mb-2">
                  Заявка на вступление в программу «Заводчик»
                </h2>
                <p className="text-base text-gray-600 mb-6">
                  Заполните форму, и наш менеджер свяжется с вами для уточнения деталей
                </p>

                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 space-y-6">
            {/* Название питомника */}
            <div>
              <Label htmlFor="organizationName" className="text-base font-medium">
                Название питомника или заводской приставки <span className="text-red-500">*</span>
              </Label>
              <Input
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="Название питомника или заводской приставки"
                onBlur={(e) => {
                  if (!e.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, organizationName: "Название питомника обязательно для заполнения" }));
                  }
                }}
              />
              {errors.organizationName && (
                <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>
              )}
            </div>

            {/* ФИО */}
            <div>
              <Label htmlFor="fullName" className="text-base font-medium">
                Ваши ФИО <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="Иванов Иван Иванович"
                onBlur={(e) => {
                  const error = validateReceiver(e.target.value);
                  if (error) {
                    setErrors((prev) => ({ ...prev, fullName: error }));
                  }
                }}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Город */}
            <div>
              <Label htmlFor="city" className="text-base font-medium">
                Город, в котором находится ваш питомник <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="г. Москва"
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

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-medium">
                Ваш e-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="example@mail.ru"
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

            {/* Телефон */}
            <div>
              <Label htmlFor="phone" className="text-base font-medium">
                Ваш телефон (менеджер позвонит вам и уточнит детали) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="+7 (999) 123-45-67"
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

            {/* Файл */}
            <div>
              <Label className="text-base font-medium">
                Прикрепите копию свидетельства о регистрации питомника или заводской приставки
              </Label>
              <div className="mt-2">
                <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#6F2A2B] transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    {formData.file ? formData.file.name : "Прикрепите файл"}
                  </span>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
                {errors.file && (
                  <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                )}
              </div>
            </div>

            {/* Согласие */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="consent"
                checked={formData.consent}
                onCheckedChange={(checked) => {
                  setFormData((prev) => ({ ...prev, consent: checked }));
                  if (errors.consent) {
                    setErrors((prev) => ({ ...prev, consent: "" }));
                  }
                }}
              />
              <Label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
                Я согласен на обработку персональных данных и соглашаюсь с{" "}
                <Link to="/privacy-policy" className="text-[#6F2A2B] underline hover:text-[#5a2223]" target="_blank" rel="noopener noreferrer">
                  политикой конфиденциальности
                </Link>
                . <span className="text-red-500">*</span>
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
                      className="w-full bg-[#6F2A2B] hover:bg-[#5a2223] text-white h-12"
                    >
                      {loading ? "Отправка..." : "Отправить заявку"}
                    </Button>
                  </div>
                </form>
              </div>
            </PageFade>
          </div>
        </div>
      </PageFade>
      <Footer />
      <ToastMotion show={!!toast}>{toast}</ToastMotion>
      <AuthToast 
        show={showAuthToast} 
        onClose={() => setShowAuthToast(false)}
        message={authToastMessage}
      />
    </div>
  );
}
