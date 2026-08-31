import { useState } from 'react'
import { Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from './adminApi'
import './Login.css'

export default function Login({ onLogin }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api('auth', 'POST', { key })
      onLogin(key)
    } catch {
      setError('Incorrect key — try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login-card">
        <Link to="/" className="detail-back"><ArrowLeft size={15} /> Back to site</Link>
        <div className="admin-login-icon"><Lock size={22} /></div>
        <h1>Admin</h1>
        <p>Sign in with your admin key to manage the site.</p>
        <form onSubmit={submit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Admin API key"
            autoFocus
          />
          <button type="submit" disabled={loading || !key}>
            {loading ? 'Checking…' : <>Sign in <ArrowRight size={15} /></>}
          </button>
        </form>
        {error && <p className="admin-login-error">{error}</p>}
      </div>
    </div>
  )
}
