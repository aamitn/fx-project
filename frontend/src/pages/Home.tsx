import Navigation from "@/components/home/Navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import CTA from "@/components/home/CTA";
import HomeFooter from "@/components/home/HomeFooter";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <CTA />
      <HomeFooter />
    </div>
  );
};

export default Home;