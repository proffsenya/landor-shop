import { Link } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PAYMENT_OPTIONS, DELIVERY_OPTIONS } from "@/constants/cartConstants";
import { fmtMoney, pluralGoods } from "@/utils/cartUtils";

export const CartSummary = ({
  totalCount, totalPrice,
  payMethod, setPayMethod,
  deliveryMethod, setDeliveryMethod,
  receiver, onReceiverChange,
  phone, onPhoneChange,
  address, onAddressChange,
  customerNotes, setCustomerNotes,
  consent, setConsent,
  errors,
  onSubmit,
}) => {
  return (
    <div className="border border-[#E2E2E2] rounded-[12px] p-5 sm:p-6 shadow-sm lg:sticky lg:top-4">
      <h2 className="text-center text-[#1E1E1E] text-[18px] sm:text-[20px]">Информация по заказу</h2>
      <div className="mt-4">
        <div className="text-[#6F2A2B] mb-2">Итоговая стоимость</div>
        <div className="flex justify-between">
          <span>{totalCount} {pluralGoods(totalCount)}</span>
          <span className="font-medium">{fmtMoney(totalPrice)}</span>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[#6F2A2B] mb-3">Способ оплаты</p>
        {PAYMENT_OPTIONS.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="radio" name="pay" value={opt.value} checked={payMethod === opt.value} onChange={() => setPayMethod(opt.value)} className="accent-[#6F2A2B]" />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-[#6F2A2B] mb-3">Способ доставки</p>
        {DELIVERY_OPTIONS.map(opt => (
          <label key={opt.value} className="flex items-center gap-2 mb-2 cursor-pointer">
            <input type="radio" name="delivery" value={opt.value} checked={deliveryMethod === opt.value} onChange={() => setDeliveryMethod(opt.value)} className="accent-[#6F2A2B]" />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="mt-5">
        <p className="text-[#6F2A2B] mb-3">Данные для доставки</p>
        <div className="mb-3">
          <input value={receiver} onChange={e => onReceiverChange(e.target.value)} onBlur={() => {}} placeholder="Иванов Иван Иванович" className={`w-full h-10 border rounded px-3 ${errors.receiver ? "border-red-500" : "border-[#E2E2E2]"}`} />
          {errors.receiver && <p className="mt-1 text-xs text-red-500">{errors.receiver}</p>}
        </div>
        <div className="mb-3">
          <input type="tel" value={phone} onChange={e => onPhoneChange(e.target.value)} placeholder="+7 (999) 123-45-67" className={`w-full h-10 border rounded px-3 ${errors.phone ? "border-red-500" : "border-[#E2E2E2]"}`} />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div className="mb-4">
          <input value={address} onChange={e => onAddressChange(e.target.value)} placeholder="г. Москва, ул. Ленина, д. 10" className={`w-full h-10 border rounded px-3 ${errors.address ? "border-red-500" : "border-[#E2E2E2]"}`} />
          {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
        </div>

        <div className="mb-4">
          <Label className="text-[#6F2A2B] block mb-2">Комментарий к заказу</Label>
          <Textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)} placeholder="Не звонить, оставить у двери..." className="min-h-[100px]" maxLength={500} />
          {customerNotes.length > 0 && <p className="mt-1 text-xs text-gray-500">{customerNotes.length}/500 символов</p>}
        </div>

        <div className="mb-4">
          <div className="flex items-start gap-3">
            <Checkbox id="consent" checked={consent} onCheckedChange={setConsent} className="mt-1" />
            <Label htmlFor="consent" className="text-sm text-gray-700">
              Нажимая на кнопку, вы даете согласие на обработку персональных данных и соглашаетесь с{" "}
              <Link to="/privacy-policy" className="text-[#6F2A2B] underline">политикой конфиденциальности</Link>.
            </Label>
          </div>
          {errors.consent && <p className="mt-1 text-xs text-red-500">{errors.consent}</p>}
        </div>

        <button onClick={onSubmit} className="w-full h-12 rounded bg-[#6F2A2B] text-white hover:bg-[#5a2223]">Заказать</button>
      </div>
    </div>
  );
};