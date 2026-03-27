import { useRef, useState } from "react";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import SocialProofSection from "@/components/SocialProofSection";
import OfferSection from "@/components/OfferSection";
import CTASection from "@/components/CTASection";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";

const Index = () => {
  const orderRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] = useState("");

  const scrollToOrder = (variant?: string) => {
    if (variant) setSelectedVariant(variant);
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onOrderClick={() => scrollToOrder()} />
      <ProblemSection />
      <SolutionSection />
      <SocialProofSection />
      <OfferSection onOrderClick={scrollToOrder} />
      <CTASection onOrderClick={() => scrollToOrder()} />
      <OrderForm ref={orderRef} preselectedVariant={selectedVariant} />
      <Footer />

      {/* Sticky mobile CTA */}
      <button
        onClick={() => scrollToOrder()}
        className="fixed bottom-4 left-4 right-4 z-50 md:hidden rounded-full honey-gradient py-3.5 text-base font-bold text-primary-foreground shadow-xl animate-pulse-glow"
      >
        🍯 Order Now
      </button>
    </div>
  );
};

export default Index;
