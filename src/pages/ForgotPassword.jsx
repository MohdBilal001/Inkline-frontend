import { useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../api/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSubmitted(true)
    } catch (err) {
      setError('Could not send the reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      {!submitted ? (
        <>
          <h1 className="font-display text-3xl font-medium mb-3">Forgot your password?</h1>
          <p className="font-sans text-muted mb-8">Enter the email connected to your Inkline account and we’ll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-5 font-sans">
            <label className="block">
              <span className="text-sm text-ink-soft mb-1 block">Email</span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none"
              />
            </label>
            {error && <p className="text-brick text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-ink text-paper py-3 font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="font-display text-3xl font-medium mb-3">Check your email.</h1>
          <p className="font-sans text-muted leading-relaxed">
            If an Inkline account exists for <strong>{email}</strong>, a password reset link has been sent. The link expires in 15 minutes.
          </p>
        </>
      )}
      <p className="mt-8 text-sm text-muted font-sans">
        <Link to="/login" className="text-accent underline-grow">Back to login</Link>
      </p>
    </div>
  )
}
