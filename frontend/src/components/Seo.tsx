import React from 'react';

interface SeoProps {
  title: string;
  description: string;
  robots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  charSet?: string;
  viewport?: string;
  hrefLang?: string;
  href?: string;
  jsonLd?: string;
  referrer?: string;
}

const Seo: React.FC<SeoProps> = ({ title, description, robots, canonical, ogTitle, ogDescription, ogImage, ogUrl, twitterCard, twitterTitle, twitterDescription, twitterImage, charSet, viewport, hrefLang, href, jsonLd, referrer }) => {
  return (
    <>
      <meta charSet={charSet || 'UTF-8'} />
      <meta name="viewport" content={viewport || 'width=device-width, initial-scale=1.0'} />
      <title>{title}</title>
      <meta name="description" content={description} />
      {robots && <meta name="robots" content={robots} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}

      {/* Twitter */}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta name="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta name="twitter:image" content={twitterImage} />}

      {/* hreflang */} 
      {hrefLang && href && <link rel="alternate" hrefLang={hrefLang} href={href} />}

      {/* JSON-LD */}
      {jsonLd && <script type="application/ld+json">{jsonLd}</script>}
    </>
  );
};

export default Seo;