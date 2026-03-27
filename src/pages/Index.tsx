import { useRef } from "react";
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

  const scrollToOrder = () => {
    orderRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen">
      <HeroSection onOrderClick={scrollToOrder} />
      <ProblemSection />
      <SolutionSection />
      <SocialProofSection />
      <OfferSection onOrderClick={scrollToOrder} />
      <CTASection onOrderClick={scrollToOrder} />
      <OrderForm ref={orderRef} />
      <Footer />
    </div>
  );
};

export default Index;
