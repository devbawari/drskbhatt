import type { Metadata } from 'next';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import About from '@/components/landing/About';
import Certificates from '@/components/landing/Certificates';
import Services from '@/components/landing/Services';
import Testimonials from '@/components/landing/Testimonials';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Homeopathic Treatment for Chronic Illnesses in Lucknow | Vardaan Clinic',
  description: 'Book an appointment with Dr. SK Bhatt, leading Homeopathic Doctor in Lucknow. Safe, natural, and highly effective homeopathic treatments for chronic conditions.',
  openGraph: {
    title: 'Vardaan Homeopathy Clinic | Dr. SK Bhatt',
    description: 'Expert homeopathic care in Lucknow. Start your holistic healing journey today.',
    url: 'https://vardaanclinic.com',
    siteName: 'Vardaan Homeopathy Clinic',
    type: 'website',
  },
};

export default function Home() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: 'Vardaan Homeopathy Clinic',
    image: 'https://vardaanclinic.com/images/vardaan-homeopathy-clinic.png',
    '@id': 'https://vardaanclinic.com',
    url: 'https://vardaanclinic.com',
    telephone: '+918808080088',
    founder: {
      '@type': 'Person',
      name: 'Dr. SK Bhatt'
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'UGF- 8, sector -k1 smriti plaza, Ashiyana',
      addressLocality: 'Lucknow',
      addressRegion: 'UP',
      postalCode: '226012',
      addressCountry: 'IN'
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        opens: '10:30',
        closes: '13:30'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        opens: '18:00',
        closes: '21:00'
      }
    ],
    areaServed: ['Lucknow'],
    priceRange: '$$'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Certificates />
        <Services />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
