'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Heart, Award, Users, Star } from 'lucide-react';
import { useCounter } from '@/hooks/useAnimations';
import './Hero.css';

export default function Hero() {
  const yearsRef = useCounter(26, 2000);
  const patientsRef = useCounter(100000, 1000);
  const ratingRef = useCounter(4, 1000);
  const successRef = useCounter(90, 2000);

  return (
    <section className="hero" id="home">
      {/* Decorative dots */}
      <div className="hero-dots">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="hero-dot" />
        ))}
      </div>

      <div className="hero-content">
        <div className="hero-grid">
          <div className="hero-text">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Available for Appointments
            </div>

            <h1 className="hero-seo-title">Dr. SK Bhatt | Vardaan Homeopathy Clinic Lucknow</h1>
            <h2 className="hero-title">
              Trusted Homeopathic Care,{' '}
              <span className="highlight">Natural Healing with Compassion</span>
            </h2>

            <p className="hero-description">
              Welcome to Vardaan Homeopathy Clinic, where experience, compassion, and natural healing come together to create truly personalized care. Led by Dr. SK Bhatt, a trusted name in homeopathy with over 26 years of clinical excellence, our practice is dedicated to helping patients restore wellness through safe, holistic, and result-oriented treatment.
            </p>

            <div className="hero-actions">
              <Link href="/booking" className="hero-btn-primary">
                Book Appointment
                <ArrowRight size={18} />
              </Link>
              <a
                href="#about"
                className="hero-btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </a>
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-value">
                  <span ref={yearsRef}>0</span>+
                </span>
                <span className="hero-stat-label">Years Experience</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">
                  <span ref={patientsRef}>0</span>+
                </span>
                <span className="hero-stat-label">Patients Treated</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">
                  <span ref={ratingRef}>0</span>.9★
                </span>
                <span className="hero-stat-label">Patient Rating</span>
              </div>
              <div className="hero-stat">
                <span className="hero-stat-value">
                  <span ref={successRef}>0</span>%
                </span>
                <span className="hero-stat-label">Success Rate</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-image-frame">
              <Image 
                src="/images/dr-sk-bhatt-homeopath-lucknow.png" 
                alt="Dr. SK Bhatt - Best Homeopathic Doctor in Lucknow at Vardaan Clinic" 
                fill 
                style={{ objectFit: 'cover' }} 
                priority 
                sizes="(max-width: 768px) 100vw, 380px"
              />
            </div>

            {/* Floating cards */}
            <div className="hero-floating-card card-experience">
              <div className="hero-floating-icon teal">
                <Award size={20} />
              </div>
              <div className="hero-floating-text">
                <strong>26+ Years</strong>
                <span>Experience</span>
              </div>
            </div>

            <div className="hero-floating-card card-patients">
              <div className="hero-floating-icon gold">
                <Users size={20} />
              </div>
              <div className="hero-floating-text">
                <strong>100,000+</strong>
                <span>Happy Patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
