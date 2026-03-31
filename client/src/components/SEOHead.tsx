import { Helmet } from "react-helmet-async";

const SITE_URL = "https://co2contra.com";
const SITE_NAME = "CO₂ Contra Incêndio";
const DEFAULT_OG_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310419663029941110/TyJduRRrx582jr9b7ycCdJ/og-image-co2_5f89db3b.png";
const DEFAULT_DESCRIPTION =
  "Especialistas em sistemas fixos de combate a incêndio em Belo Horizonte: supressão por CO₂, saponificante para coifas, hidrantes, alarmes e detectores. Projetos ABNT · NFPA · Corpo de Bombeiros.";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  ogImageAlt?: string;
  /** Schema.org JSON-LD object or array — will be serialised automatically */
  schema?: object | object[];
  /** Breadcrumb items: [{name, url}] */
  breadcrumbs?: { name: string; url: string }[];
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  ogType = "website",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt,
  schema,
  breadcrumbs,
  publishedTime,
  modifiedTime,
  noIndex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Sistemas Fixos de Combate a Incêndio — BH`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const imageAlt = ogImageAlt || fullTitle;

  // Build breadcrumb schema if provided
  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
            ...breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 2,
              name: b.name,
              item: `${SITE_URL}${b.url}`,
            })),
          ],
        }
      : null;

  const schemas: object[] = [];
  if (schema) {
    if (Array.isArray(schema)) schemas.push(...schema);
    else schemas.push(schema);
  }
  if (breadcrumbSchema) schemas.push(breadcrumbSchema);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Article-specific OG */}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {ogType === "article" && <meta property="article:author" content="Eng. Judson Aleixo Sampaio" />}
      {ogType === "article" && <meta property="article:section" content="Engenharia de Segurança Contra Incêndio" />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={imageAlt} />

      {/* JSON-LD schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
