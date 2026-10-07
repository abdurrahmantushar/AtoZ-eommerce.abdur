import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrendingProducts from "@/components/home/TrendingProducts";
import FlashSale from "@/components/home/FlashSale";
import PromoBanner from "@/components/home/PromoBanner";
import Benefits from "@/components/home/Benefits";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/layout/Footer";
import CouponShowcase from "@/components/home/CouponShowcase";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--background)]">
        <Hero />
        <CouponShowcase/>
        <Categories/>
        <FeaturedProducts/>
        <TrendingProducts/>
        <FlashSale/>
        <PromoBanner/>
        <Benefits/>
        <Newsletter />
      </main>
      <Footer/>
    </>
  );
}