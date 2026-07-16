import { useRef, useState, useEffect } from "react";
import HeroSection from "@/components/HeroSection";
import ProblemSection from "@/components/ProblemSection";
import SolutionSection from "@/components/SolutionSection";
import SocialProofSection from "@/components/SocialProofSection";
import OfferSection from "@/components/OfferSection";
import CTASection from "@/components/CTASection";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";
import OrderLookup from "@/components/OrderLookup";

const Index = () => {
  const orderRef = useRef<HTMLDivElement>(null);
  const [selectedVariant, setSelectedVariant] = useState("");
  const [showSticky, setShowSticky] = useState(true);

  const scrollToOrder = (variant?: string) => {
    if (variant) setSelectedVariant(variant);
    setShowSticky(false);
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const form = orderRef.current;
    if (!form) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(form);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen">
      <HeroSection onOrderClick={() => scrollToOrder()} />
      <ProblemSection />
      <SolutionSection />
      <SocialProofSection />
      <OfferSection onOrderClick={scrollToOrder} />
      <CTASection onOrderClick={() => scrollToOrder()} />
      <OrderForm ref={orderRef} preselectedVariant={selectedVariant} />
      <OrderLookup />
      <Footer />

      {/* Sticky mobile CTA */}
      {showSticky && (
        <button
          onClick={() => scrollToOrder()}
          className="fixed bottom-3 left-4 right-4 z-50 md:hidden rounded-full honey-gradient py-2.5 text-sm font-bold text-primary-foreground shadow-lg"
        >
          🍯 Order Now
        </button>
      )}
    </div>
  );
};

export default Index;
