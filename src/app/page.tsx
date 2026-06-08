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


  return (
    <>

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
