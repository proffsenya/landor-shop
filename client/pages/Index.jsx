import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import Benefits from "@/components/Benefits";
import Categories from "@/components/Categories";
import ProductsSection from "@/components/ProductsSection";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { PageFade } from "@/utils/PageAnimations";

export default function Index() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
        <PageFade>
          <main>
            <HeroBanner />
            <Benefits />
            <Categories />
            <ProductsSection title="Рекомендовано для Вас" />
            <FAQ />
          </main>
        </PageFade>
      <Footer />
    </div>
  );
}
