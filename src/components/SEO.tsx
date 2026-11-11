import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
  schema?: Record<string, any>;
}

const SEO: React.FC<SEOProps> = ({ 
  title = "CHILS & CO. | Premium Tees and Polos for People Who Build", 
  description = "Premium tees and polos, designed by techies in Hyderabad. Quiet colour, good fabric, delivered across India.",
  canonical = "https://chilsandco.com",
  ogType = "website",
  ogImage = "https://res.cloudinary.com/ddatd5ruz/image/upload/v1781014185/chils_main_logo_transparent_ab7vru.png",
  keywords = "premium t-shirts india, polo t-shirts, oversized tees, developer t-shirts, Chils and Co",
  noindex = false,
  schema
}) => {
  const siteName = "CHILS & CO.";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const canonicalUrl = canonical.startsWith('http') ? canonical : `https://chilsandco.com${canonical}`;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <link rel="canonical" href={canonicalUrl} />

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
          "logo": "https://res.cloudinary.com/ddatd5ruz/image/upload/v1781014185/chils_main_logo_transparent_ab7vru.png",
          "sameAs": [
            "https://www.instagram.com/chils_and_co/",
            "https://facebook.com/chilsandco"
          ]
        })}
      </script>

      {/* Custom Schema.org JSON-LD (e.g. Product, LocalBusiness) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
