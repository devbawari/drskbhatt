import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DR SK BHATT | Vardaan Homeopathy Clinic",
  description:
    "Expert homeopathic care with DR SK BHATT, BHMS, MD (Homeopathy). 26+ years of experience. Book online or in-clinic appointments. Trusted by 10,000+ patients.",
  keywords: [
    "homeopath",
    "homeopathic doctor",
    "homeopathy",
    "doctor in lucknow",
    "online consultation",
    "vardaan clinic",
    "DR SK BHATT",
  ],
  authors: [{ name: "DR SK BHATT" }],
  openGraph: {
    title: "DR SK BHATT | Vardaan Homeopathy Clinic",
    description:
      "Expert homeopathic care with 26+ years of experience. Book your appointment today.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0D4F4F" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
