'use client';

import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { sendMessage, markMessagesAsRead } from '../actions';

type Conversation = {
  patientId: string;
  name: string;
  unread: boolean;
  messages: {
    id: string;
    sender: 'patient' | 'doctor';
    content: string;
    time: string;
  }[];
};

export default function MessagesClient({ initialConversations }: { initialConversations: Conversation[] }) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeChat, setActiveChat] = useState(conversations[0]?.patientId || '');
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('admin_messages_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          
          setConversations(prev => prev.map(c => {
            if (c.patientId === newMsg.patient_id) {
              // Avoid duplicates if we just sent this message
              if (!c.messages.find(m => m.id === newMsg.id || m.content === newMsg.content)) {
                return {
                  ...c,
                  unread: activeChat !== c.patientId, // Mark unread if not currently open
                  messages: [...c.messages, {
                    id: newMsg.id,
                    sender: newMsg.sender_id === newMsg.patient_id ? 'patient' : 'doctor',
                    content: newMsg.content,
                    time: new Date(newMsg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                  }]
                };
              }
            }
            return c;
          }));
          
          // Scroll to bottom if it's the active chat
          if (activeChat === newMsg.patient_id) {
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChat]);

  // Handle scrolling and marking as read when switching chats
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    if (activeChat) {
      markMessagesAsRead(activeChat);
      setConversations(prev => prev.map(c => 
        c.patientId === activeChat ? { ...c, unread: false } : c
      ));
    }
  }, [activeChat]);

  const activeConversation = conversations.find((c) => c.patientId === activeChat);

  const handleSend = async () => {
    if (!newMessage.trim() || !activeChat) return;
    
    const content = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const tempMsg = { id: 'temp-' + Date.now(), sender: 'doctor' as const, content, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) };
    
    setConversations(prev => prev.map(c => {
      if (c.patientId === activeChat) {
        return { ...c, messages: [...c.messages, tempMsg] };
      }
      return c;
    }));

    const res = await sendMessage(activeChat, activeChat, content);
    if (!res.success) {
      alert('Failed to send message');
      // Revert optimistic update by reloading (or we could revert manually)
      window.location.reload();
    } else if (res.message) {
      // Replace temp message with real one
      setConversations(prev => prev.map(c => {
        if (c.patientId === activeChat) {
          const newMsgs = [...c.messages];
          newMsgs[newMsgs.length - 1] = {
            id: res.message?.id || tempMsg.id,
            sender: 'doctor',
            content: res.message?.content || tempMsg.content,
            time: res.message?.time || tempMsg.time
          };
          return { ...c, messages: newMsgs };
        }
        return c;
      }));
    }
  };

  return (
    <>
      <div className="admin-page-header">
        <h1>Messages</h1>
        <p>Chat with your patients</p>
      </div>

      <div className="admin-chat">
        {/* Patient List */}
        <div className="admin-chat-list">
          {conversations.map((c) => (
            <div
              key={c.patientId}
              className={`admin-chat-list-item ${activeChat === c.patientId ? 'active' : ''}`}
              onClick={() => setActiveChat(c.patientId)}
              id={`chat-${c.patientId}`}
            >
              <div className="admin-chat-list-avatar">{c.name.charAt(0)}</div>
              <div className="admin-chat-list-text">
                <div className="admin-chat-list-name">{c.name}</div>
                <div className="admin-chat-list-preview">
                  {c.messages[c.messages.length - 1]?.content}
                </div>
              </div>
              {c.unread && <div className="admin-chat-unread" />}
            </div>
          ))}
        </div>

        {/* Conversation */}
        <div className="admin-chat-conversation">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--admin-border)', fontWeight: 700 }}>
            {activeConversation?.name}
          </div>
          <div className="admin-chat-messages">
            {activeConversation?.messages.map((m) => (
              <div key={m.id} className={`admin-chat-bubble ${m.sender}`}>
                {m.content}
                <div className="admin-chat-time">{m.time}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="admin-chat-input-bar">
            <input
              className="admin-input"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              id="chat-input"
            />
            <button className="admin-btn admin-btn-primary" onClick={handleSend} id="chat-send">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
