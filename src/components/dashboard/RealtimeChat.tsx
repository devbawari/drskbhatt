'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send } from 'lucide-react'
import { markPatientMessagesAsRead } from '@/app/dashboard/actions'

type Message = {
  id: string
  sender_id: string
  recipient_id: string
  patient_id: string
  content: string
  created_at: string
}

export function RealtimeChat({ currentUserId, doctorId, doctorName }: { currentUserId: string, doctorId: string, doctorName: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // 1. Fetch initial messages
    async function fetchMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('patient_id', currentUserId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
      scrollToBottom()
      
      // Mark as read when opening chat
      markPatientMessagesAsRead(doctorId)
    }

    fetchMessages()

    // 2. Subscribe to new messages
    const channel = supabase
      .channel('realtime_chat')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // Note: RLS will still apply on the backend, but we filter here for UI performance
          filter: `recipient_id=eq.${currentUserId}`
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Only add if it's from the doctor we are chatting with
          if (newMsg.sender_id === doctorId) {
            setMessages((prev) => [...prev, newMsg])
            scrollToBottom()
            // Mark new incoming messages as read instantly since we are actively in the chat
            markPatientMessagesAsRead(doctorId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, doctorId, supabase])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const messageText = newMessage.trim()
    setNewMessage('') // optimistic clear

    // Optimistic UI update
    const tempId = `temp-${Date.now()}`
    const tempMsg: Message = {
      id: tempId,
      sender_id: currentUserId,
      recipient_id: doctorId,
      patient_id: currentUserId,
      content: messageText,
      created_at: new Date().toISOString()
    }
    setMessages((prev) => [...prev, tempMsg])
    scrollToBottom()

    // Send to Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        recipient_id: doctorId,
        patient_id: currentUserId,
        content: messageText
      })
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      // Revert optimistic update on failure
      setMessages((prev) => prev.filter(m => m.id !== tempId))
    } else if (data) {
      // Replace temp msg with real msg
      setMessages((prev) => prev.map(m => m.id === tempId ? data : m))
    }
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-avatar">
          {doctorName.charAt(0).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <h2>{doctorName}</h2>
          <p>Typically replies within a few hours</p>
        </div>
      </div>

      <div className="chat-messages">
        {loading ? (
          <div className="empty-state">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <p>No messages yet. Send a message to start the conversation.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSent = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`chat-message ${isSent ? 'sent' : 'received'}`}>
                <div className="chat-bubble">
                  {msg.content}
                </div>
                <div className="chat-time">
                  {formatTime(msg.created_at)}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-area" onSubmit={handleSend}>
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend(e)
            }
          }}
          rows={1}
        />
        <button 
          type="submit" 
          className="chat-send-btn"
          disabled={!newMessage.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
