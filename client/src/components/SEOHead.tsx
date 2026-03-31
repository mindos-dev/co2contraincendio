import { Helmet } from "react-helmet-async";

const SITE_URL = "https://co2firepro-tyjdurrr.manus.space";
const SITE_NAME = "CO₂ Contra Incêndio";
const DEFAULT_DESCRIPTION =
  "Especialistas em sistemas fixos de combate a incêndio: supressão por CO₂, saponificante para coifas, hidrantes, alarmes e detectores. Projetos ABNT · NFPA · Corpo de Bombeiros. Atendemos BH e todo o Brasil.";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  /** Schema.org JSON-LD object or array — will be serialised automatically */
  schema?: object | object[];
  /** Breadcrumb items: [{name, url}] */
  breadcrumbs?: { name: string; url: string }[];
}

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonical,
  schema,
  breadcrumbs,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Sistemas Fixos de Combate a Incêndio — BH`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;

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
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />

      {/* JSON-LD schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
