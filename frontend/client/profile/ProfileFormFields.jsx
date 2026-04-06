import RowWithButton from "./RowWithButton";

export const ProfileFormFields = ({
  user, editing, errors,
  onFieldChange, onFieldBlur, onToggle,
}) => (
  <div className="mt-5 space-y-3 sm:mt-6">
    <RowWithButton
      placeholder="Фамилия"
      value={user.lastName}
      isEditing={editing.lastName}
      onChange={(v) => onFieldChange("lastName", v)}
      onBlur={() => onFieldBlur("lastName")}
      onToggle={() => onToggle("lastName")}
      error={errors.lastName}
      example="Пример: Иванов"
    />
    <RowWithButton
      placeholder="Имя"
      value={user.firstName}
      isEditing={editing.firstName}
      onChange={(v) => onFieldChange("firstName", v)}
      onBlur={() => onFieldBlur("firstName")}
      onToggle={() => onToggle("firstName")}
      error={errors.firstName}
      example="Пример: Иван"
    />
    <RowWithButton
      placeholder="Отчество"
      value={user.middleName}
      isEditing={editing.middleName}
      onChange={(v) => onFieldChange("middleName", v)}
      onBlur={() => onFieldBlur("middleName")}
      onToggle={() => onToggle("middleName")}
      error={errors.middleName}
      example="Пример: Иванович (необязательно)"
    />
    <RowWithButton
      placeholder="Почта"
      value={user.email}
      isEditing={editing.email}
      onChange={(v) => onFieldChange("email", v)}
      onBlur={() => onFieldBlur("email")}
      onToggle={() => onToggle("email")}
      type="email"
      error={errors.email}
      example="Пример: ivan@mail.ru"
    />
    <RowWithButton
      placeholder="Номер телефона"
      value={user.phone}
      isEditing={editing.phone}
      onChange={(v) => onFieldChange("phone", v)}
      onBlur={() => onFieldBlur("phone")}
      onToggle={() => onToggle("phone")}
      error={errors.phone}
      example="Пример: +7 (999) 123-45-67"
    />
  </div>
);