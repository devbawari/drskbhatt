'use client';

import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DailyProvider, useLocalSessionId, useParticipantIds, useVideoTrack, useAudioTrack, useDaily, DailyAudio } from '@daily-co/daily-react';
import type { DailyCall } from '@daily-co/daily-js';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { endTelehealthSession } from '@/app/admin/actions';

// Inner component that actually uses Daily hooks
function TelehealthCall({ appointmentId, isDoctor }: { appointmentId: string, isDoctor: boolean }) {
  const daily = useDaily();
  const router = useRouter();
  const localSessionId = useLocalSessionId();
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' });
  
  const localVideo = useVideoTrack(localSessionId);
  const localAudio = useAudioTrack(localSessionId);
  
  const isMicMuted = localAudio.isOff;
  const isCamMuted = localVideo.isOff;

  const toggleMic = useCallback(() => {
    if (!daily) return;
    daily.setLocalAudio(isMicMuted);
  }, [daily, isMicMuted]);

  const toggleCam = useCallback(() => {
    if (!daily) return;
    daily.setLocalVideo(isCamMuted);
  }, [daily, isCamMuted]);

  const leaveCall = useCallback(async () => {
    if (!daily) return;
    await daily.leave();
    await daily.destroy();
    
    // Removed auto-ending session to allow rejoining if doctor leaves by mistake
    
    router.push(isDoctor ? '/admin/appointments' : '/dashboard');
  }, [daily, isDoctor, appointmentId, router]);

  // Video render component
  const RemoteParticipant = ({ id }: { id: string }) => {
    const videoState = useVideoTrack(id);
    
    // Attach tracks
    useEffect(() => {
      const videoEl = document.getElementById(`video-${id}`) as HTMLVideoElement;
      if (videoEl && videoState.track) {
        videoEl.srcObject = new MediaStream([videoState.track]);
      }
    }, [id, videoState.track]);

    return (
      <video id={`video-${id}`} autoPlay playsInline className="remote-video" />
    );
  };

  // Attach local video
  useEffect(() => {
    const videoEl = document.getElementById('local-video') as HTMLVideoElement;
    if (videoEl && localVideo.track && !isCamMuted) {
      videoEl.srcObject = new MediaStream([localVideo.track]);
    } else if (videoEl) {
      videoEl.srcObject = null;
    }
  }, [localVideo.track, isCamMuted]);

  return (
    <>
      <div className="telehealth-video-container">
        {remoteParticipantIds.length > 0 ? (
          <RemoteParticipant id={remoteParticipantIds[0]} />
        ) : (
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div className="admin-patient-avatar" style={{ margin: '0 auto 16px', width: '80px', height: '80px', fontSize: '2rem' }}>?</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Waiting for the other person to join...</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>They will appear here once they connect.</p>
          </div>
        )}

        <div className="local-video-pip">
          {!isCamMuted ? (
            <video id="local-video" autoPlay playsInline muted className="local-video" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222', color: 'rgba(255,255,255,0.5)' }}>
              <VideoOff size={32} />
            </div>
          )}
        </div>
      </div>

      <div className="telehealth-controls">
        <button onClick={toggleMic} className={`control-btn ${isMicMuted ? 'muted' : ''}`} title="Toggle Microphone">
          {isMicMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        <button onClick={toggleCam} className={`control-btn ${isCamMuted ? 'muted' : ''}`} title="Toggle Camera">
          {isCamMuted ? <VideoOff size={20} /> : <VideoIcon size={20} />}
        </button>
        <button onClick={leaveCall} className="control-btn danger" title="End Consultation">
          <PhoneOff size={20} />
        </button>
      </div>
    </>
  );
}

// Wrapper component to manage the DailyCall object
export default function TelehealthRoom({ roomUrl, appointmentId, isDoctor }: { roomUrl: string, appointmentId: string, isDoctor: boolean }) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!roomUrl) return;

    let isMounted = true;
    let co: DailyCall | null = null;

    import('@daily-co/daily-js').then(async (module) => {
      if (!isMounted) return;
      const DailyIframe = module.default;
      
      // If an instance already exists (e.g. from StrictMode double-mount), destroy it first
      const existingCall = DailyIframe.getCallInstance();
      if (existingCall) {
        await existingCall.destroy();
      }

      co = DailyIframe.createCallObject({
        audioSource: true,
        videoSource: true,
      });
      if (isMounted) {
        setCallObject(co);
      } else {
        co.destroy();
      }
    });

    return () => {
      isMounted = false;
      if (co) {
        co.destroy();
      }
    };
  }, [roomUrl]);

  const joinRoom = useCallback(async () => {
    if (!callObject || !roomUrl) return;
    try {
      await callObject.join({ url: roomUrl });
      setJoined(true);
    } catch (e) {
      console.error('Failed to join room', e);
      alert('Failed to connect to the video room. Please check your camera permissions.');
    }
  }, [callObject, roomUrl]);

  if (!callObject) return null;

  if (!joined) {
    return (
      <div className="telehealth-lobby">
        <div className="lobby-card">
          <h2>Ready to join?</h2>
          <p>Please make sure your camera and microphone permissions are granted when prompted by your browser.</p>
          <button 
            className="admin-btn" 
            style={{ width: '100%', padding: '12px', fontSize: '1.1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            onClick={joinRoom}
          >
            Join Consultation
          </button>
        </div>
      </div>
    );
  }

  return (
    <DailyProvider callObject={callObject}>
      <DailyAudio />
      <TelehealthCall appointmentId={appointmentId} isDoctor={isDoctor} />
    </DailyProvider>
  );
}
