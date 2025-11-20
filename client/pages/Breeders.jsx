import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade } from "@/utils/PageAnimations";
import { Truck, Tag, Package, Paperclip, CheckCircle2 } from "lucide-react";
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
            <PageFade>
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
            </PageFade>

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

            {/* CTA Button */}
            <PageFade>
              <div className="text-center">
                <button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-[#6F2A2B] text-white px-8 py-4 rounded-lg text-base md:text-lg font-semibold hover:bg-[#5a2223] transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  Участвовать в программе заводчик
                </button>
              </div>
            </PageFade>
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
            <DialogDescription className="mt-2 text-base text-gray-600">
              Заполните форму, и наш менеджер свяжется с вами для уточнения деталей
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 space-y-6">
            {/* Название питомника */}
            <div>
              <Label htmlFor="kennelName" className="text-base font-medium">
                Название питомника или заводской приставки
              </Label>
              <Input
                id="kennelName"
                name="kennelName"
                value={formData.kennelName}
                onChange={handleInputChange}
                className="h-12 mt-2"
                placeholder="Введите название питомника"
              />
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
                required
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
                placeholder="Москва"
                required
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
                placeholder="mail@domen.com"
                required
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
                placeholder="+7 (999) 999-99-99"
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Файл */}
            <div>
              <Label className="text-base font-medium">
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
                  <p className="mt-1 text-sm text-red-500">{errors.file}</p>
                )}
              </div>
            </div>

            {/* reCAPTCHA */}
            <div>
              <Label className="text-base font-medium">
                Подтвердите, что вы не робот <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-3 p-4 mt-2 border border-gray-300 rounded-lg">
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
                <p className="mt-1 text-sm text-red-500">{errors.isRobot}</p>
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
              <p className="text-sm text-red-500">{errors.consent}</p>
            )}

            {/* Кнопки */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1 h-12"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#6F2A2B] hover:bg-[#5a2223] text-white h-12"
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
