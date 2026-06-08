'use client';

import Image from 'next/image';
import { useStaggerAnimation } from '@/hooks/useAnimations';
import './Certificates.css';

const certificates = [
  {
    id: 1,
    title: 'Certificate of Appreciation',
    issuer: " Lord's Homeopathic Lab ",
    year: '2008',
    image: '/images/certificates/cert-1.png',
  },
  {
    id: 2,
    title: 'Certificate of Excellence ',
    issuer: "ST. George's Homeopathic , Mangalore",
    year: '2011',
    image: '/images/certificates/cert-2.png',
  },
  {
    id: 3,
    title: 'Award for Excellence',
    issuer: 'Allen Homeo & Herbal Products',
    year: '2018',
    image: '/images/certificates/cert-5.jpeg',
  },
  {
    id: 4,
    title: 'certificate of excellence',
    issuer: 'National Homoeo Laboratry',
    year: '2010',
    image: '/images/certificates/cert-4.jpeg',
  },
];

export default function Certificates() {
  const gridRef = useStaggerAnimation();

  return (
    <section className="certificates section" id="certificates">
      <div className="container">
        <div className="section-heading">
          <span className="section-label">Certificates & Awards</span>
          <h2>A Legacy of Excellence</h2>
          <p>Recognitions and qualifications that reflect our commitment to providing world-class cardiac care.</p>
        </div>

        <div className="certificates-grid stagger-children" ref={gridRef}>
          {certificates.map((cert) => {
            return (
              <div key={cert.id} className="certificate-card">
                <div className="certificate-image-wrapper">
                  <Image 
                    src={cert.image} 
                    alt={cert.title} 
                    fill 
                    className="certificate-image" 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="certificate-content">
                  <h3 className="certificate-title">{cert.title}</h3>
                  <div className="certificate-issuer">{cert.issuer}</div>
                  <div className="certificate-year">{cert.year}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
