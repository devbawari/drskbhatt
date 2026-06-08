'use client';

import Image from 'next/image';
import { Heart, GraduationCap, Award, ShieldCheck, BookOpen, Globe } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useAnimations';
import './About.css';

export default function About() {
  const sectionRef = useScrollAnimation();

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about-grid" ref={sectionRef}>
          {/* Visual Side */}
          <div className="about-visual animate-fade-in-up">
            <div className="about-image-container">
              <div className="about-image-main" style={{ padding: 0 }}>
                <Image 
                  src="/images/vardaan-homeopathy-clinic.png" 
                  alt="Dr. SK Bhatt at Vardaan Homeopathy Clinic Lucknow" 
                  fill 
                  style={{ objectFit: 'cover' }} 
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              </div>
              <div className="about-frame-accent" />
              <div className="about-frame-dots">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} />
                ))}
              </div>
              <div className="about-exp-badge">
                <strong>26+</strong>
                <span>Years Exp.</span>
              </div>
            </div>
          </div> 

          {/* Content Side */}
          <div className="about-content animate-fade-in-up">
            <span className="section-label">About The Doctor</span>
            <h2>Dedicated to Your Health</h2>

            <p className="about-description">
              Dr. SK Bhatt is a renowned homeopath with over 26 years of 
              clinical excellence in restoring wellness through safe, 
              holistic, and natural healing. With a patient-first approach 
              and personalized, result-oriented treatments, he has built a 
              trusted reputation for helping thousands of individuals achieve lasting well-being with an impressive 90% success rate.
            </p>

            <p className="about-description">
              His philosophy centers on compassionate, custom-tailored care and dedicated commitment, believing that true healing balances comfort and confidence. He combines advanced homeopathic practices with a deep understanding of natural medicine to ensure every patient receives safe, personalized, and world-class care.
            </p>

            <div className="about-credentials">
              <h3>Qualifications</h3>
              <div className="about-credential-item">
                <GraduationCap size={16} />
                <span>BHMS — University of Lucknow</span>
              </div>
              <div className="about-credential-item">
                <Globe size={16} />
                <span>Gold Medalist in Homeopathy — University of Lucknow</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
