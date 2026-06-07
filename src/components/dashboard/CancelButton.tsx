'use client'

import { useState } from 'react'
import { cancelAppointment } from '@/app/dashboard/actions'

export function CancelButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return
    
    setLoading(true)
    await cancelAppointment(id)
    setLoading(false)
  }

  return (
    <button 
      className="cancel-btn" 
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? 'Cancelling...' : 'Cancel'}
    </button>
  )
}
