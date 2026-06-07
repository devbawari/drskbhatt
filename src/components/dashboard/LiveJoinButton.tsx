'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Video } from 'lucide-react';

export function LiveJoinButton({ appointmentId, initialState, roomUrl }: { appointmentId: string, initialState: string, roomUrl: string }) {
  const [state, setState] = useState(initialState);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`apt-${appointmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'appointments',
          filter: `id=eq.${appointmentId}`
        },
        (payload) => {
          if (payload.new.telehealth_state) {
            setState(payload.new.telehealth_state);
          }
          if (payload.new.status === 'completed' || payload.new.status === 'cancelled') {
             // If completed, refresh the whole dashboard to move it to past appointments
             router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appointmentId, router]);

  if (state === 'active') {
    return (
      <a 
        href={`/telehealth/${appointmentId}`} 
        className="join-call-btn" 
        style={{ 
          background: 'var(--color-primary)', 
          animation: 'pulse 2s infinite',
          boxShadow: '0 0 15px rgba(var(--color-primary-rgb), 0.5)'
        }}
      >
        <Video size={16} style={{ animation: 'bounce 2s infinite' }} />
        Join Doctor's Video Room
      </a>
    );
  }

  // If idle, just show a disabled waiting state or standard info
  if (state === 'idle') {
    return (
      <button className="join-call-btn" disabled style={{ opacity: 0.5, cursor: 'not-allowed', background: 'var(--color-surface-alt)', color: 'var(--color-text-muted)' }}>
        <Video size={16} />
        Waiting for Doctor to Start...
      </button>
    );
  }

  return null;
}
