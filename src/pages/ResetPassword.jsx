import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/client'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('This reset link is missing its token.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError('This reset link is invalid or expired. Please request a new one.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      {done ? (
        <>
          <h1 className="font-display text-3xl font-medium mb-3">Password updated.</h1>
          <p className="font-sans text-muted">Your password has been changed. Taking you to login…</p>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-medium mb-8">Create a new password</h1>
          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <label className="block">
              <span className="text-sm text-ink-soft mb-1 block">New password</span>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={8} maxLength={72} required autoComplete="new-password" className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none" />
            </label>
            <label className="block">
              <span className="text-sm text-ink-soft mb-1 block">Confirm password</span>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} minLength={8} maxLength={72} required autoComplete="new-password" className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none" />
            </label>
            {error && <p className="text-brick text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="w-full rounded-full bg-ink text-paper py-3 font-medium hover:bg-accent transition-colors disabled:opacity-50">
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </>
      )}
      <p className="mt-8 text-sm text-muted font-sans"><Link to="/login" className="text-accent underline-grow">Back to login</Link></p>
    </div>
  )
}
