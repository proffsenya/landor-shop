import React, { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BreadcrumbNav from "@/components/BreadcrumbNav";
import { PageFade, ToastMotion } from "@/utils/PageAnimations";
import { AuthToast } from "@/components/AuthToast";
import { useBreederForm } from "@/hooks/useBreederForm";
import { HeroSection } from "@/components/features/Breeders/HeroSection";
import { BenefitsGrid } from "@/components/features/Breeders/BenefitsGrid";
import { BreederForm } from "@/components/features/Breeders/BreederForm";

export default function Breeders() {
  const [toast, setToast] = useState("");
  const [showAuthToast, setShowAuthToast] = useState(false);
  const [authToastMessage, setAuthToastMessage] = useState("");

  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(""), ms);
  };

  const { formData, errors, loading, handleInputChange, handleFileChange, handleSubmit, setFieldError, setConsent } = useBreederForm(
    (successMsg) => showToast(successMsg),
    () => {
      setAuthToastMessage("Для отправки заявки необходимо авторизоваться");
      setShowAuthToast(true);
    },
    (errorMsg) => showToast(errorMsg)
  );

  const handleBlur = (field, value) => {
    // В реальном проекте вы можете вынести валидацию поля в хук
    if (field === "fullName") {
      const error = validateReceiver(value);
      setFieldError(field, error);
    }
    // аналогично для других полей...
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

            <HeroSection />
            <BenefitsGrid />

            <PageFade>
              <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold text-[#6F2A2B] mb-2">
                  Заявка на вступление в программу «Заводчик»
                </h2>
                <p className="mb-6 text-base text-gray-600">
                  Заполните форму, и наш менеджер свяжется с вами для уточнения деталей
                </p>

                <BreederForm
                  formData={formData}
                  errors={errors}
                  loading={loading}
                  onInputChange={handleInputChange}
                  onFileChange={handleFileChange}
                  onSubmit={handleSubmit}
                  onBlur={handleBlur}
                  onConsentChange={setConsent}
                />
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