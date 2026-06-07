'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard, CalendarDays, Users, MessageSquare, Clock,
  ExternalLink, LogOut, Menu, X, Heart
} from 'lucide-react';
import { signout } from '@/app/auth/actions';
import './admin.css';

const initialNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Appointments', href: '/admin/appointments', icon: CalendarDays },
  { label: 'Patients', href: '/admin/patients', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: MessageSquare, badge: 0 },
  { label: 'Schedule', href: '/admin/schedule', icon: Clock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let currentUserId = '';

    const fetchUnread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      currentUserId = user.id;

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .is('read_at', null);

      if (count !== null) setUnreadCount(count);
    };

    fetchUnread();

    const channel = supabase
      .channel('admin_nav_badge')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.recipient_id === currentUserId) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.new.recipient_id === currentUserId && payload.new.read_at && !payload.old.read_at) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navItems = initialNavItems.map(item => 
    item.label === 'Messages' ? { ...item, badge: unreadCount } : item
  );

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="admin-layout">
      {/* Mobile Toggle */}
      <button className="admin-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      <div className={`admin-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-avatar">
            <Heart size={18} fill="white" />
          </div>
          <div className="admin-sidebar-info">
            <h4>Dr. SK Bhatt</h4>
            <span>Vardan Clinic</span>
          </div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
                id={`admin-nav-${item.label.toLowerCase()}`}
              >
                <Icon size={18} />
                {item.label}
                {(item.badge ?? 0) > 0 && <span className="admin-nav-badge-dot" />}
              </Link>
            );
          })}
        </nav>

        <div className="admin-nav-footer">
          <Link href="/" className="admin-nav-link" id="admin-nav-website">
            <ExternalLink size={18} />
            Back to Website
          </Link>
          <button className="admin-nav-link" onClick={() => signout()} id="admin-nav-logout">
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
