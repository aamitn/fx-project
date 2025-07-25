import Navigation from "@/components/home/Navigation";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import Stats from "@/components/home/Stats";
import Cta from "@/components/home/CTA";
import HomeFooter from "@/components/home/HomeFooter";
import Seo from "@/components/Seo";

const Home = () => {
  const description = "Welcome to FurnXpert Insulation Analysis Application.";
  const jsonLd = `{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Furnxpert LLC",
    "url": "https://www.furnxpert.com",
    "logo": "https://www.furnxpert.com/logo.png"
  }`;

  return (
    <>
      <Seo
        title="FurnXpert Insulation- Home"
        description={description}
        robots="index, follow"
        canonical="https://www.furnxpert.com/"
        ogTitle="FurnXpert Insulation App"
        ogDescription={description}
        ogImage="https://www.furnxpert.com/og-banner.png"
        ogUrl="https://www.furnxpert.com/"
        twitterCard="summary_large_image"
        twitterTitle="FurnXpert Insulation App"
        twitterDescription={description}
        twitterImage="https://www.furnxpert.com/og-banner.png"
        charSet="UTF-8"
        viewport="width=device-width, initial-scale=1.0"
        hrefLang="en"
        href="https://www.furnxpert.com/en/"
        jsonLd={jsonLd}
      />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <Hero />
        <Stats />
        <Features />
        <Cta />
        <HomeFooter />
      </div>
    </>
  );
};

export default Home;