import type { Metadata } from "next";
import "./globals.css";

// 🚀 1. Dynamic Server-Side Metadata Layer (Lucknow SEO Optimized)
export const metadata: Metadata = {
  title: {
    template: "%s | Vardaan Homeopathy Clinic",
    default: "Dr. SK Bhatt | Vardaan Homeopathy Clinic Lucknow",
  },
  description:
    "Expert homeopathic care with Dr. SK Bhatt, BHMS, MD (Homeopathy). 26+ years of clinical experience. Book online or in-clinic appointments in Lucknow.",
  keywords: [
    "homeopath",
    "homeopathic doctor",
    "homeopathy clinic near me",
    "best homeopath in lucknow",
    "online consultation",
    "vardaan clinic",
    "Dr SK Bhatt",
  ],
  authors: [{ name: "Dr. SK Bhatt" }],
  metadataBase: new URL("https://drskbhatt.in"), // Points to your newly configured custom domain
  
  // 👥 Optimized Facebook & Open Graph Sharing Control
  openGraph: {
    title: "Dr. SK Bhatt | Vardaan Homeopathy Clinic Lucknow",
    description:
      "Advanced and personalized homeopathic care with 26+ years of experience. Book your appointment today.",
    url: "https://drskbhatt.in",
    siteName: "Vardaan Homeopathy Clinic",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/vardaan-homeopathy-clinic.png", // The exact banner Facebook will display
        width: 1200,
        height: 630,
        alt: "Vardaan Homeopathy Clinic Lucknow - Dr. SK Bhatt",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 🎯 2. Structured Data Object (Local Medical Business Schema Markup for Lucknow)
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Vardaan Homeopathy Clinic",
    "image": "https://drskbhatt.in/images/vardaan-homeopathy-clinic.png",
    "@id": "https://drskbhatt.in/#clinic",
    "url": "https://drskbhatt.in",
    "telephone": "+91 8808080088", 
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lucknow",
      "addressRegion": "UP",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "26.7842357",   
      "longitude": "80.8426118"  
    },
    "founder": {
      "@type": "MedicalOrganization",
      "name": "Dr. SK Bhatt",
      "description": "BHMS, MD (Homeopathy) with over 26 years of clinical excellence."
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "10:30",
        "closes": "21:00"
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D4F4F" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
        
        {/* 🛠️ 3. Safe Schema Injection (Feeds Google Rich Snippets Without Messing Up UI) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </body>
    </html>
  );
}
