import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url, type = 'website' }) => {
  const siteTitle = 'SVICSM - Swami Vivekananda Institute of Commerce, Science & Management ';
  const defaultDescription = 'Leading educational institution in Nashik offering Junior & Senior College programs in Commerce, Science, and Management. NEP2020 compliant with focus on holistic development.';
const defaultImage = 'https://svicsm.com/logo.png';
  const defaultUrl = 'https://svicsm.com';
  
  const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const metaImage = image || defaultImage;
  const metaUrl = url ? `${defaultUrl}${url}` : defaultUrl;
  const metaKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords;

  return (
    <Helmet>
      {/* Standard Metadata */}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      {metaKeywords && <meta name="keywords" content={metaKeywords} />}
      <meta name="robots" content="index, follow, max-image-preview:large" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:site_name" content="SVICSM" />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={metaUrl} />
    </Helmet>
  );
};

export default SEO;