import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import Benefits from "@/components/Benefits";
import Categories from "@/components/Categories";
import ProductsSection from "@/components/ProductsSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import ScrollReveal from "@/utils/ScrollAnimations";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroBanner />
        <ScrollReveal>
        <Benefits />
        <Categories />
        <ProductsSection title="Рекомендовано для Вас" />
        <ProductsSection title="Популярные товары" />
        <FAQ />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
}
