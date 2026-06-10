'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signout } from '@/app/auth/actions';
import './Navbar.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth(user: any) {
      if (user) {
        setIsLoggedIn(true);
        const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single();
        if (data) setUserRole(data.role);
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    }

    // Check initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      checkAuth(user);
    });

    // Listen for auth changes (like logging in/out from other components)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuth(session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Certificates', href: '#certificates' },
    { label: 'Services', href: '#services' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <div className="navbar-logo-icon" style={{ background: 'transparent', padding: 0 }}>
            <img src="/icon.png" alt="Vardaan Logo" style={{ width: 28, height: 28 }} />
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-logo-name">Dr. SK Bhatt</span>
            <span className="navbar-logo-spec"> Vardaan Homeopathy Clinic</span>
          </div>
        </Link>

        <div className="navbar-links">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="navbar-link"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="navbar-cta navbar-cta-desktop" style={{ display: 'flex', gap: '12px' }}>
          {isLoggedIn ? (
            <>
              <Link href={userRole === 'doctor' || userRole === 'admin' ? '/admin' : '/dashboard'} className="btn btn-ghost" style={{ padding: '0.5rem 1rem' }}>
                <LayoutDashboard size={18} style={{ marginRight: '8px' }}/> Dashboard
              </Link>
              <button onClick={() => signout()} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                <LogOut size={18} style={{ marginRight: '8px' }}/> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                Login
              </Link>
              <Link href="/booking" className="btn btn-accent">
                Book Appointment
              </Link>
            </>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          id="navbar-toggle"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`navbar-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="navbar-mobile-link"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick(link.href);
            }}
          >
            {link.label}
          </a>
        ))}

      </div>
    </nav>
  );
}
