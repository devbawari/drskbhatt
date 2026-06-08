'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, Send } from 'lucide-react';
import './Contact.css';

const FacebookIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
);
const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);


export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact section" id="contact">
      <div className="container">
        <div className="section-heading">
          <span className="section-label">Get In Touch</span>
          <h2>Contact Us</h2>
          <p>Have a question or want to book an appointment? Reach out to us through any of these channels.</p>
        </div>

        <div className="contact-grid">
          {/* Info Side */}
          <div className="contact-info">
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <Phone size={22} />
              </div>
              <div className="contact-info-text">
                <h3>Phone</h3>
                <p><a href="tel:+919876543210">+91 8808080088</a></p>
                <p>Mon-Sat, 10:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <Mail size={22} />
              </div>
              <div className="contact-info-text">
                <h3>Email</h3>
                <p><a href="mailto:drskbhatt@gmail.com">drskbhatt@gmail.com</a></p>
                <p>We reply within 24 hours</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <MapPin size={22} />
              </div>
              <div className="contact-info-text">
                <h3>Morning Clinic</h3>
                <p>UGF- 8, sector -k1 smriti plaza, Ashiyana<br />Lucknow, Uttar Pradesh 226012</p>
                <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '6px' }}>Timing: 10:30 AM - 1:30 PM (Mon-Sat)</p>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <MapPin size={22} />
              </div>
              <div className="contact-info-text">
                <h3>Evening Clinic</h3>
                <p>UGF-5, Sector-F, LDA Colony, Parag Dairy Road<br />Lucknow, Uttar Pradesh 226012</p>
                <p style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 600, marginTop: '6px' }}>Timing: 6:00 PM - 9:00 PM (Mon-Sat)</p>
              </div>
            </div>

            {/* Google Maps */}
            <div className="contact-map">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56988.00110290951!2d80.84261184863279!3d26.784235700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bf9536371d093%3A0xc9886c62101552db!2sDr%20Bhatt&#39;s%20Vardan%20Clinic%20-%20Best%20Homeopathic%20Doctor%20in%20Lucknow!5e0!3m2!1sen!2sin!4v1780845880663!5m2!1sen!2sin"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vardaan Homeopathy Clinic Location"
              />
            </div>

            {/* Social Links */}
            <div className="contact-social">
              <a href="https://www.facebook.com/people/Dr-bhatts-vardaan-clinic/100057356384136/" target="_blank" rel="noopener noreferrer" className="contact-social-link facebook">
                <FacebookIcon size={18} />
                Follow on Facebook
              </a>
              <a href="https://instagram.com/drskbhatt" target="_blank" rel="noopener noreferrer" className="contact-social-link instagram">
                <InstagramIcon size={18} />
                Instagram
              </a>
              <a href="https://youtube.com/@drskbhatt?si=xyiF1CCctj26UZj1" target="_blank" rel="noopener noreferrer" className="contact-social-link youtube">
                <YoutubeIcon size={18} />
                YouTube
              </a>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-card">
            {submitted ? (
              <div className="contact-form-success">
                <CheckCircle size={56} />
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for reaching out. We will get back to you within 24 hours.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', message: '' }); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3>Send Us a Message</h3>
                <p>Fill out the form below and we&apos;ll respond as soon as possible.</p>
                <form onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-name">Full Name *</label>
                      <input id="contact-name" type="text" className="form-input" placeholder="Your name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-email">Email *</label>
                      <input id="contact-email" type="email" className="form-input" placeholder="your@email.com" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">Phone Number</label>
                    <input id="contact-phone" type="tel" className="form-input" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Message *</label>
                    <textarea id="contact-message" className="form-input form-textarea" placeholder="How can we help you?" required value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg contact-form-submit" disabled={loading} id="contact-submit">
                    {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
