'use client';

import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useStaggerAnimation } from '@/hooks/useAnimations';
import './Services.css';

type ServiceData = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
};

const STATIC_SERVICES: ServiceData[] = [
  {
    id: '1',
    name: 'ARTHRITIS',
    subtitle: 'Natural Treatment',
    description: 'Personalized homeopathic care focused on reducing joint pain, stiffness, swelling, and improving mobility for long-term relief.'
  },
  {
    id: '2',
    name: 'SPONDYLITIS',
    subtitle: 'Holistic Healing',
    description: 'Comprehensive treatment designed to ease back stiffness, inflammation, and discomfort while improving daily movement and flexibility.'
  },
  {
    id: '3',
    name: 'SLIP DISC',
    subtitle: 'Non-Surgical Care',
    description: 'Gentle and effective homeopathic support to help manage disc-related pain, nerve pressure, and movement restrictions naturally.'
  },
  {
    id: '4',
    name: 'SCIATICA',
    subtitle: 'Long-Term Relief',
    description: 'Targeted treatment aimed at relieving radiating leg pain, numbness, and lower back discomfort caused by sciatic nerve irritation.'
  },
  {
    id: '5',
    name: 'KIDNEY STONES',
    subtitle: 'Safe & Natural Care',
    description: 'Homeopathic treatment focused on helping manage stone-related pain and supporting natural urinary health and recovery.'
  },
  {
    id: '6',
    name: 'PILES',
    subtitle: 'Comfort-Focused Treatment',
    description: 'Personalized care to help reduce pain, swelling, irritation, and discomfort associated with hemorrhoids naturally.'
  },
  {
    id: '7',
    name: 'MIGRAINE',
    subtitle: 'Personalized Treatment',
    description: 'Focused homeopathic solutions to help reduce recurring headaches, sensitivity, and migraine-related discomfort effectively.'
  }
   ,
   {
    id: '8',
    name: 'PCOD',
    subtitle: 'Hormonal Balance',
    description: 'Comprehensive homeopathic care designed to support hormonal balance, reduce symptoms, and improve overall well-being naturally.'
   },
   {
    id: '9',
    name:'Liver Disorders',
    subtitle: 'Gentle Support',
    description: 'Homeopathic treatment aimed at supporting liver function, reducing symptoms, and promoting natural healing for various liver conditions.'
   }

];

export default function Services() {
  const gridRef = useStaggerAnimation();

  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-heading">
          <span className="section-label">Our Services</span>
          <h2>Comprehensive Homeopathic Care</h2>
          <p>From joint pain to chronic conditions, we offer a full range of safe and natural homeopathic treatments tailored to your needs.</p>
        </div>

        <div className="services-grid stagger-children" ref={gridRef}>
          {STATIC_SERVICES.map((service) => {
            return (
              <div className="service-card" key={service.id}>
                <div className="service-icon">
                  <Activity size={26} />
                </div>
                <h3>{service.name}</h3>
                <h4 style={{ color: 'var(--color-primary)', marginTop: '4px', marginBottom: '12px', fontSize: 'var(--text-sm)' }}>{service.subtitle}</h4>
                <p>{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
