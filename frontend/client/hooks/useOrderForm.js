import { useState, useCallback } from "react";
import { validateReceiver, validatePhone, validateAddress } from "@/utils/validation";
import { formatName, formatPhone } from "@/utils/formatting";
import { createOrderAPI } from "@/services/orderService";
import { PAYMENT_METHODS, DELIVERY_METHODS } from "@/constants/cartConstants";

export const useOrderForm = (authToken, selectedItems, onSuccess, onAuthFail) => {
  const [payMethod, setPayMethod] = useState("cash");
  const [deliveryMethod, setDeliveryMethod] = useState("courier");
  const [receiver, setReceiver] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState({
    receiver: "", phone: "", address: "", consent: "",
  });

  const validateForm = useCallback(() => {
    const newErrors = {
      receiver: validateReceiver(receiver),
      phone: validatePhone(phone),
      address: validateAddress(address),
      consent: consent ? "" : "Необходимо согласие",
    };
    setErrors(newErrors);
    return !newErrors.receiver && !newErrors.phone && !newErrors.address && !newErrors.consent;
  }, [receiver, phone, address, consent]);

  const handleReceiverChange = (value) => {
    const formatted = formatName(value);
    setReceiver(formatted);
    if (errors.receiver) setErrors(prev => ({ ...prev, receiver: validateReceiver(formatted) }));
  };

  const handlePhoneChange = (value) => {
    const formatted = formatPhone(value);
    setPhone(formatted);
    if (errors.phone) setErrors(prev => ({ ...prev, phone: validatePhone(formatted) }));
  };

  const handleAddressChange = (value) => {
    setAddress(value);
    if (errors.address) setErrors(prev => ({ ...prev, address: validateAddress(value) }));
  };

  const submitOrder = async () => {
    if (!authToken || authToken === "guest") {
      onAuthFail?.("Для оформления заказа необходимо авторизоваться");
      return;
    }
    if (selectedItems.length === 0) {
      onAuthFail?.("Выберите товары для оформления заказа");
      return;
    }
    if (!validateForm()) return;

    const cartItemIds = selectedItems.map(i => i.cartItemId).filter(id => id > 0);
    if (cartItemIds.length === 0) throw new Error("Не удалось определить товары");

    // нормализация телефона
    let normalizedPhone = phone.replace(/[\s\-()\+]/g, "");
    if (normalizedPhone.startsWith("8")) normalizedPhone = "7" + normalizedPhone.slice(1);
    if (!normalizedPhone.startsWith("7") && normalizedPhone.length === 10) normalizedPhone = "7" + normalizedPhone;

    const fullNameParts = receiver.trim().split(/\s+/).filter(Boolean);
    const customerSnapshot = {
      phone: normalizedPhone,
      last_name: fullNameParts[0] || "",
      first_name: fullNameParts[1] || "",
      middle_name: fullNameParts[2] || "",
      email: "",
    };

    const shippingAddress = {
      name: receiver.trim(),
      phone: normalizedPhone,
      street: address.trim(),
    };

    const requestBody = {
      cartItemIds,
      billingAddress: shippingAddress,
      shippingAddress,
      customerSnapshot,
      customerNotes: customerNotes.trim() || "",
      paymentMethod: PAYMENT_METHODS[payMethod],
      deliveryMethod: DELIVERY_METHODS[deliveryMethod],
    };

    await createOrderAPI(requestBody, authToken);
    onSuccess?.();
  };

  return {
    payMethod, setPayMethod,
    deliveryMethod, setDeliveryMethod,
    receiver, handleReceiverChange,
    phone, handlePhoneChange,
    address, handleAddressChange,
    customerNotes, setCustomerNotes,
    consent, setConsent,
    errors,
    validateForm,
    submitOrder,
  };
};