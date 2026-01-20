import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://kvt.arwindpianist.com";
const SITE_NAME = "KVT Jewellers";
const DEFAULT_IMAGE = `${BASE_URL}/app.jpg`;

export interface MetadataOptions {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Generate comprehensive metadata with Open Graph and Twitter Card support
 */
export function generatePageMetadata(options: MetadataOptions): Metadata {
  const {
    title,
    description,
    image = DEFAULT_IMAGE,
    url,
    type = "website",
    noIndex = false,
    keywords = [],
  } = options;

  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;
  const imageUrl = image.startsWith("http") ? image : `${BASE_URL}${image}`;

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
    robots: noIndex ? "noindex, nofollow" : "index, follow",
    openGraph: {
      title,
      description,
      url: fullUrl,
      siteName: SITE_NAME,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@kvtjewellers",
      site: "@kvtjewellers",
    },
    alternates: {
      canonical: fullUrl,
    },
  };

  return metadata;
}

/**
 * Generate product-specific metadata
 */
export function generateProductMetadata(
  productName: string,
  description: string,
  productId: string,
  imageUrl?: string
): Metadata {
  const url = `/product/${productId}`;
  const image = imageUrl || DEFAULT_IMAGE;

  return generatePageMetadata({
    title: `${productName} | ${SITE_NAME}`,
    description,
    image,
    url,
    type: "product",
    keywords: [
      productName,
      "gold",
      "silver",
      "jewelry",
      "bullion",
      "KVT Jewellers",
      "precious metals",
    ],
  });
}
