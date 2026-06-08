'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DailyCall } from '@daily-co/daily-js';

export default function TelehealthRoom({ roomUrl, appointmentId, isDoctor }: { roomUrl: string, appointmentId: string, isDoctor: boolean }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [callFrame, setCallFrame] = useState<DailyCall | null>(null);
  const [joined, setJoined] = useState(false);

  const leaveCall = useCallback(async (frameToDestroy?: DailyCall) => {
    const frame = frameToDestroy || callFrame;
    if (frame) {
      await frame.destroy();
    }
    router.push(isDoctor ? '/admin/appointments' : '/dashboard');
  }, [callFrame, isDoctor, router]);

  const joinRoom = useCallback(async () => {
    if (!roomUrl) return;
    setJoined(true);
  }, [roomUrl]);

  useEffect(() => {
    if (joined && containerRef.current && !callFrame) {
      let isMounted = true;
      let frame: DailyCall | null = null;

      import('@daily-co/daily-js').then(async (module) => {
        if (!isMounted) return;
        const DailyIframe = module.default;
        
        // If an instance already exists, destroy it first
        const existingCall = DailyIframe.getCallInstance();
        if (existingCall) {
          await existingCall.destroy();
        }

        if (!containerRef.current) return;

        frame = DailyIframe.createFrame(containerRef.current, {
          iframeStyle: { width: '100%', height: '100%', border: '0', borderRadius: '0' },
          showLeaveButton: false,
        });

        frame.on('left-meeting', () => {
          leaveCall(frame!);
        });

        if (isMounted) {
          setCallFrame(frame);
          frame.join({ url: roomUrl }).catch((e) => {
            console.error('Failed to join room', e);
            alert('Failed to connect to the video room.');
          });
        } else {
          frame.destroy();
        }
      });

      return () => {
        isMounted = false;
        if (frame) {
          frame.destroy();
        }
      };
    }
  }, [joined, roomUrl, leaveCall, callFrame]);

  // Cleanup on full unmount
  useEffect(() => {
    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, [callFrame]);

  if (!joined) {
    return (
      <div className="telehealth-lobby">
        <div className="lobby-card">
          <h2>Ready to join?</h2>
          <p>Please make sure your camera and microphone permissions are granted when prompted by your browser.</p>
          <button 
            className="admin-btn" 
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px' }}
            onClick={joinRoom}
          >
            Join Consultation
          </button>
          <button 
            onClick={() => router.push(isDoctor ? '/admin/appointments' : '/dashboard')}
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}
          >
            Cancel / Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="telehealth-video-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 0, margin: 0, overflow: 'hidden', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <button 
        onClick={() => leaveCall()} 
        className="custom-leave-btn"
      >
        Leave Room
      </button>
    </div>
  );
}
