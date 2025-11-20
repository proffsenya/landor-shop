import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";
import { SlideFade } from "@/utils/CatalogAnimations";
import { Truck, Tag, Package, Paperclip } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export default function Breeders() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    kennelName: "",
    fullName: "",
    city: "",
    email: "",
    phone: "",
    file: null,
    isRobot: false,
    consent: false,
  });
  const [errors, setErrors] = useState({});

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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Обязательное поле";
    }
    if (!formData.city.trim()) {
      newErrors.city = "Обязательное поле";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Обязательное поле";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Обязательное поле";
    }
    if (!formData.file) {
      newErrors.file = "Обязательное поле";
    }
    if (!formData.isRobot) {
      newErrors.isRobot = "Необходимо подтвердить";
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

    // Здесь будет отправка формы на сервер
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("kennelName", formData.kennelName);
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      if (formData.file) {
        formDataToSend.append("file", formData.file);
      }

      // TODO: Заменить на реальный API endpoint
      // const response = await fetch("/api/breeders/application", {
      //   method: "POST",
      //   body: formDataToSend,
      // });

      // Временная заглушка
      console.log("Form data:", formData);
      alert("Заявка отправлена! Менеджер свяжется с вами в ближайшее время.");
      
      // Сброс формы
      setFormData({
        kennelName: "",
        fullName: "",
        city: "",
        email: "",
        phone: "",
        file: null,
        isRobot: false,
        consent: false,
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Произошла ошибка при отправке заявки. Попробуйте позже.");
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
              { label: "Заводчикам" }
            ]} />
            <div className="p-6 bg-white border border-gray-200 rounded-lg">
              <SlideFade delay={0.1}>
                <h2 className="text-[#6F2A2B] text-2xl sm:text-[28px] lg:text-3xl leading-none mb-6 sm:mb-7 lg:mb-15">
                  Заводчикам
                </h2>
              </SlideFade>
              <SlideFade delay={0.2}>
              <section className="mb-6">
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Мы предоставляем особые условия обслуживания заводчикам:
                </h3>
                <ul className="pl-6 text-gray-700 space-y-2">
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>Бесплатная доставка</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>Специальные цены</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-[#6F2A2B] text-xl font-bold mr-2 mt-1">⏺</span>
                    <span>Скидки от объёма</span>
                  </li>
                </ul>
              </section>
              </SlideFade>
              {/* Benefits with icons */}
              <SlideFade delay={0.3}>
              <section className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon;
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center text-center p-6 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="w-20 h-20 bg-[#6F2A2B] rounded-full flex items-center justify-center mb-4">
                          <IconComponent className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {benefit.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
              </SlideFade>
              {/* CTA Button */}
              <SlideFade delay={0.4}>
              <section className="mb-6">
                <div className="text-center">
                  <button
                    onClick={() => setIsDialogOpen(true)}
                    className="bg-[#6F2A2B] text-white px-8 py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-[#5a2223] transition-colors"
                  >
                    УЧАСТВОВАТЬ В ПРОГРАММЕ ЗАВОДЧИК
                  </button>
                </div>
              </section>
              </SlideFade>
            </div>
          </div>
        </div>
      </PageFade>
      <Footer />

      {/* Modal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-bold text-[#6F2A2B]">
              Заявка на вступление в программу «Заводчик»
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 mt-2">
              Заполните форму, и наш менеджер свяжется с вами для уточнения деталей
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Название питомника */}
            <div>
              <Label htmlFor="kennelName" className="text-base">
                Название питомника или заводской приставки
              </Label>
              <Input
                id="kennelName"
                name="kennelName"
                value={formData.kennelName}
                onChange={handleInputChange}
                className="mt-2"
                placeholder="Введите название питомника"
              />
            </div>

            {/* ФИО */}
            <div>
              <Label htmlFor="fullName" className="text-base">
                Ваши ФИО <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="mt-2"
                placeholder="Иванов Иван Иванович"
                required
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Город */}
            <div>
              <Label htmlFor="city" className="text-base">
                Город, в котором находится ваш питомник <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-2"
                placeholder="Москва"
                required
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base">
                Ваш e-mail <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2"
                placeholder="mail@domen.com"
                required
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Телефон */}
            <div>
              <Label htmlFor="phone" className="text-base">
                Ваш телефон (менеджер позвонит вам и уточнит детали) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-2"
                placeholder="+7 (999) 999-99-99"
                required
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Файл */}
            <div>
              <Label className="text-base">
                Прикрепите копию свидетельства о регистрации питомника или заводской приставки <span className="text-red-500">*</span>
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
                    required
                  />
                </label>
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>
            </div>

            {/* reCAPTCHA */}
            <div>
              <Label className="text-base">
                Подтвердите, что вы не робот <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center gap-3 p-4 border border-gray-300 rounded-lg">
                <Checkbox
                  id="isRobot"
                  checked={formData.isRobot}
                  onCheckedChange={(checked) => {
                    setFormData((prev) => ({ ...prev, isRobot: checked }));
                    if (errors.isRobot) {
                      setErrors((prev) => ({ ...prev, isRobot: "" }));
                    }
                  }}
                />
                <Label htmlFor="isRobot" className="cursor-pointer">
                  Я не робот
                </Label>
              </div>
              {errors.isRobot && (
                <p className="text-red-500 text-sm mt-1">{errors.isRobot}</p>
              )}
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
              <Label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
                Я согласен на обработку персональных данных <span className="text-red-500">*</span>
              </Label>
            </div>
            {errors.consent && (
              <p className="text-red-500 text-sm">{errors.consent}</p>
            )}

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#6F2A2B] hover:bg-[#5a2223] text-white"
              >
                Отправить заявку
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

