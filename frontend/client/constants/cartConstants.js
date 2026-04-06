export const PAYMENT_METHODS = {
  cash: "Наличными",
  sbp: "СБП",
  requisites: "По реквизитам"
};

export const DELIVERY_METHODS = {
  courier: "Доставка курьером для Москвы и МО",
  transport: "Доставка транспортной компанией"
};

// для отображения в радио-кнопках
export const PAYMENT_OPTIONS = [
  { value: "cash", label: "Наличными" },
  { value: "sbp", label: "СБП" },
  { value: "requisites", label: "По реквизитам" }
];

export const DELIVERY_OPTIONS = [
  { value: "courier", label: "Доставка курьером для Москвы и МО" },
  { value: "transport", label: "Доставка транспортной компанией" }
];