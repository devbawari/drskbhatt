'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { login, signup } from './actions'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import './auth.css'

function AuthContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || ''

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    if (callbackUrl) {
      formData.append('callbackUrl', callbackUrl)
    }

    const result = isLogin ? await login(formData) : await signup(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.redirect) {
      window.location.href = result.redirect
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-header">
        <Link href="/">
          <div className="auth-logo" style={{ background: 'transparent', padding: 0 }}>
            <img src="/icon.png" alt="Vardaan Logo" style={{ width: 36, height: 36 }} />
          </div>
        </Link>
        <h1 className="auth-title">Welcome to VARDAAN</h1>
        <p className="auth-subtitle">
          {isLogin ? 'Sign in to manage your appointments' : 'Create an account to book your first visit'}
        </p>
      </div>

      <div className="auth-tabs">
        <button 
          className={`auth-tab ${isLogin ? 'active' : ''}`}
          onClick={() => { setIsLogin(true); setError(null) }}
        >
          Sign In
        </button>
        <button 
          className={`auth-tab ${!isLogin ? 'active' : ''}`}
          onClick={() => { setIsLogin(false); setError(null) }}
        >
          Sign Up
        </button>
      </div>

      <div className="auth-body">
        {error && <div className="auth-error">{error}</div>}

        <form action={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                required 
                className="auth-input"
                placeholder="John Doe"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className="auth-input"
              placeholder="you@example.com"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                name="phone" 
                required 
                className="auth-input"
                placeholder="+91 98765 43210"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              required 
              className="auth-input"
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={<div className="auth-card"><div className="auth-header">Loading...</div></div>}>
        <AuthContent />
      </Suspense>
    </div>
  )
}
