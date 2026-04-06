import { useState } from "react";
import { validateReceiver, validateEmail, validatePhone } from "@/utils/validation";
import { formatReceiver, formatPhone } from "@/utils/formatting";
import { submitNurseryForm } from "@/services/formService";

export const useBreederForm = (onSuccess, onAuthNeeded, onError) => {
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    if (name === "fullName") formattedValue = formatReceiver(value);
    else if (name === "phone") formattedValue = formatPhone(value);
    
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    
    if (errors[name]) {
      let error = "";
      if (name === "fullName") error = validateReceiver(formattedValue);
      else if (name === "email") error = validateEmail(formattedValue);
      else if (name === "phone") error = validatePhone(formattedValue);
      else if (name === "organizationName" && !formattedValue.trim()) {
        error = "Название питомника обязательно для заполнения";
      } else if (name === "city" && !formattedValue.trim()) {
        error = "Город обязателен для заполнения";
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.organizationName.trim()) newErrors.organizationName = "Название питомника обязательно для заполнения";
    const fullNameError = validateReceiver(formData.fullName);
    if (fullNameError) newErrors.fullName = fullNameError;
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    if (!formData.city.trim()) newErrors.city = "Город обязателен для заполнения";
    if (!formData.consent) newErrors.consent = "Необходимо согласие";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const result = await submitNurseryForm(formData, formData.file);
    
    if (!result.success) {
      if (result.error === "UNAUTHORIZED") {
        onAuthNeeded?.();
      } else {
        onError?.("Произошла ошибка при отправке заявки. Попробуйте позже.");
      }
    } else {
      // сброс формы
      setFormData({
        organizationName: "",
        fullName: "",
        city: "",
        email: "",
        phone: "",
        file: null,
        consent: false,
      });
      onSuccess?.("Заявка отправлена! Менеджер свяжется с вами в ближайшее время.");
    }
    setLoading(false);
  };

  const setFieldError = (field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const setConsent = (checked) => {
    setFormData(prev => ({ ...prev, consent: checked }));
    if (errors.consent) setErrors(prev => ({ ...prev, consent: "" }));
  };

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    setFieldError,
    setConsent,
  };
};