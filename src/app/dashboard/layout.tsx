'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Calendar, 
  MessageSquare, 
  LogOut, 
  Heart,
  Menu,
  X
} from 'lucide-react'
import { signout } from '@/app/auth/actions'
import './dashboard-layout.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profile, setProfile] = useState<{ full_name: string; role: string; email?: string } | null>(null)
  const pathname = usePathname()
  const supabase = createClient()

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let currentUserId = '';

    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        currentUserId = user.id;
        const { data } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile({ ...data, email: user.email })
        } else {
          setProfile({ full_name: user.user_metadata?.full_name || '', role: 'patient', email: user.email })
        }

        // Fetch unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .is('read_at', null);

        if (count !== null) setUnreadCount(count);
      }
    }
    getProfile()

    const channel = supabase
      .channel('patient_nav_badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (currentUserId && payload.new.recipient_id === currentUserId) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          if (currentUserId && payload.new.recipient_id === currentUserId && payload.new.read_at && !payload.old.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [])

  const navItems = [
    { name: 'Appointments', href: '/dashboard', icon: Calendar, badge: 0 },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, badge: unreadCount },
  ]

  const getPageTitle = () => {
    const item = navItems.find(item => item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href)))
    return item ? item.name : 'Dashboard'
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Overlay */}
      <div 
        className={`dashboard-overlay ${isMobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <Link href="/" className="dashboard-logo">
          <div className="dashboard-logo-icon" style={{ background: 'transparent', padding: 0 }}>
            <img src="/icon.png" alt="Vardaan Logo" style={{ width: 28, height: 28 }} />
          </div>
          <span className="dashboard-logo-text">VARDAAN</span>
        </Link>

        <nav className="dashboard-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`dashboard-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
                style={{ position: 'relative' }}
              >
                <Icon size={20} />
                <span>{item.name}</span>
                {item.badge > 0 && (
                  <span style={{
                    background: 'var(--color-error)',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    marginLeft: 'auto'
                  }} />
                )}
              </Link>
            )
          })}

          <div className="dashboard-nav-divider" />
          
          <button 
            onClick={() => signout()}
            className="dashboard-nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </nav>

        <div className="dashboard-user">
          <div className="dashboard-avatar">
            {(profile?.full_name || profile?.email || 'P').charAt(0).toUpperCase()}
          </div>
          <div className="dashboard-user-info">
            <span className="dashboard-user-name">{profile?.full_name || profile?.email?.split('@')[0] || 'Patient'}</span>
            <span className="dashboard-user-role">Patient Portal</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="dashboard-menu-btn"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="dashboard-header-title">{getPageTitle()}</h1>
          </div>
          <Link href="/booking" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '14px' }}>
            Book New
          </Link>
        </header>

        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  )
}
