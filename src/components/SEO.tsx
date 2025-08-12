import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

export const SEO = ({ title, description, canonical, image }: SEOProps) => {
  const siteName = "WhatsAPI SaaS";
  const url = canonical || (typeof window !== 'undefined' ? window.location.href : undefined);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
