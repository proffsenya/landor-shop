import React from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Paperclip } from "lucide-react";

export const BreederForm = ({
  formData,
  errors,
  loading,
  onInputChange,
  onFileChange,
  onSubmit,
  onBlur,
  onConsentChange,
}) => {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6 bg-white border border-gray-200 rounded-xl md:p-8">
      {/* Название питомника */}
      <div>
        <Label htmlFor="organizationName" className="text-base font-medium">
          Название питомника или заводской приставки <span className="text-red-500">*</span>
        </Label>
        <Input
          id="organizationName"
          name="organizationName"
          value={formData.organizationName}
          onChange={onInputChange}
          className="h-12 mt-2"
          placeholder="Название питомника или заводской приставки"
          onBlur={(e) => onBlur?.("organizationName", e.target.value)}
        />
        {errors.organizationName && <p className="mt-1 text-sm text-red-500">{errors.organizationName}</p>}
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
          onChange={onInputChange}
          className="h-12 mt-2"
          placeholder="Иванов Иван Иванович"
          onBlur={(e) => onBlur?.("fullName", e.target.value)}
        />
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>}
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
          onChange={onInputChange}
          className="h-12 mt-2"
          placeholder="г. Москва"
          onBlur={(e) => onBlur?.("city", e.target.value)}
        />
        {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
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
          onChange={onInputChange}
          className="h-12 mt-2"
          placeholder="example@mail.ru"
          onBlur={(e) => onBlur?.("email", e.target.value)}
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Телефон */}
      <div>
        <Label htmlFor="phone" className="text-base font-medium">
          Ваш телефон <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={onInputChange}
          className="h-12 mt-2"
          placeholder="+7 (999) 123-45-67"
          onBlur={(e) => onBlur?.("phone", e.target.value)}
        />
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      {/* Файл */}
      <div>
        <Label className="text-base font-medium">
          Прикрепите копию свидетельства о регистрации
        </Label>
        <div className="mt-2">
          <label className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#6F2A2B] transition-colors">
            <Paperclip className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600">
              {formData.file ? formData.file.name : "Прикрепите файл"}
            </span>
            <input
              type="file"
              onChange={onFileChange}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            />
          </label>
        </div>
      </div>

      {/* Согласие */}
      <div className="flex items-center gap-3">
        <Checkbox
          id="consent"
          checked={formData.consent}
          onCheckedChange={onConsentChange}
        />
        <Label htmlFor="consent" className="text-sm text-gray-600 cursor-pointer">
          Я согласен на обработку персональных данных и соглашаюсь с{" "}
          <Link to="/privacy-policy" className="text-[#6F2A2B] underline" target="_blank">
            политикой конфиденциальности
          </Link>{" "}
          <span className="text-red-500">*</span>
        </Label>
      </div>
      {errors.consent && <p className="text-sm text-red-500">{errors.consent}</p>}

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
  );
};