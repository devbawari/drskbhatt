'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import './Testimonials.css';

type Testimonial = {
  id: string;
  name: string;
  rating: number;
  review: string;
  avatar: string | null;
};

const STATIC_TESTIMONIALS: Testimonial[] = [
  { id: '1', name: 'Ramesh Patel', rating: 5, review: 'DR SK BHATT saved my life. His prompt diagnosis during my mild heart attack was crucial.', avatar: null },
  { id: '2', name: 'Sanjay Gupta', rating: 5, review: 'Very patient and explains everything in detail. Highly recommend for any cardiac issues.', avatar: null },
  { id: '3', name: 'Priya Sharma', rating: 4, review: 'The clinic is well-equipped and the online consultation option is a lifesaver for follow-ups.', avatar: null },
  { id: '4', name: 'Anjali Desai', rating: 5, review: 'My mother underwent angiography under his care. The procedure was smooth and recovery was fast.', avatar: null },
  { id: '5', name: 'Amit Kumar', rating: 5, review: 'Excellent doctor. He doesn\'t prescribe unnecessary tests and gives honest advice.', avatar: null },
  { id: '6', name: 'Meena Iyer', rating: 5, review: 'I have been consulting DR SK BHATT for my hypertension for 3 years now. He is simply the best.', avatar: null },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % STATIC_TESTIMONIALS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + STATIC_TESTIMONIALS.length) % STATIC_TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, next]);

  const handleManualNav = (index: number) => {
    setCurrent(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const t = STATIC_TESTIMONIALS[current];

  return (
    <section className="testimonials section" id="testimonials">
      <div className="container">
        <div className="section-heading">
          <span className="section-label">Testimonials</span>
          <h2>What Our Patients Say</h2>
          <p>Real stories from real patients who trust us with their heart health.</p>
        </div>

        <div className="testimonials-carousel">
          <div className="testimonials-track">
            <div className="testimonials-slide">
              <div className="testimonial-card">
                <div className="testimonial-avatar">
                  {t.name.charAt(0)}
                </div>
                <div className="testimonial-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      className={`testimonial-star ${star <= t.rating ? '' : 'empty'}`}
                      fill={star <= t.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <p className="testimonial-text">&ldquo;{t.review}&rdquo;</p>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-label">Verified Patient</div>
              </div>
            </div>
          </div>

          <div className="testimonials-nav">
            <button
              className="testimonials-btn"
              onClick={() => { prev(); handleManualNav((current - 1 + STATIC_TESTIMONIALS.length) % STATIC_TESTIMONIALS.length); }}
              aria-label="Previous testimonial"
              id="testimonial-prev"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="testimonials-dots">
              {STATIC_TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  className={`testimonials-dot ${i === current ? 'active' : ''}`}
                  onClick={() => handleManualNav(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  id={`testimonial-dot-${i}`}
                />
              ))}
            </div>
            <button
              className="testimonials-btn"
              onClick={() => { next(); handleManualNav((current + 1) % STATIC_TESTIMONIALS.length); }}
              aria-label="Next testimonial"
              id="testimonial-next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
