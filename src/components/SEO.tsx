import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "CHILS & CO. | Extraordinary Bespoke Luxury", 
  description = "Chils & Co. delivers high-end bespoke garments and luxury ready-to-wear. Handcrafted precision for the modern individual.",
  canonical = "https://chilsandco.com",
  ogType = "website",
  ogImage = "https://chilsandco.com/og-image.jpg",
  keywords = "luxury fashion, bespoke tailoring, handcrafted garments, Chils and Co, custom suits, high-end menswear"
}) => {
  const siteName = "CHILS & CO.";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Schema.org JSON-LD for Organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteName,
          "url": "https://chilsandco.com",
          "logo": "https://chilsandco.com/logo.png",
          "sameAs": [
            "https://instagram.com/chilsandco",
            "https://facebook.com/chilsandco"
          ]
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
