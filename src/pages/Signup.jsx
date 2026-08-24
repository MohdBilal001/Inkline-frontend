import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup, loginWithGoogle } from '../api/client'

export default function Signup() {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const username = form.username.trim()
    if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      setError('Special characters in username are not allowed. Only letters, numbers, dot (.) and underscore (_) are allowed.')
      return
    }
    if (username.length > 20) {
      setError('Username must be 20 characters or less.')
      return
    }

    try {
      await signup({ ...form, username })
      navigate('/')
    } catch (err) {
      setError(err.message?.replace(/^API error \d+: ?/, '') || 'Something went wrong creating your account.')
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-medium mb-8">Start writing</h1>
      <form onSubmit={handleSubmit} className="space-y-5 font-sans">
        <Field label="Full name" value={form.name} onChange={(v) => update('name', v)} required />
        <Field label="Username" value={form.username} onChange={(v) => update('username', v)} maxLength={20} required />
        <Field label="Email" type="email" value={form.email} onChange={(v) => update('email', v)} required />
        <Field label="Password" type="password" value={form.password} onChange={(v) => update('password', v)} required />
        {error && <p className="text-brick text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-ink text-paper py-3 font-medium hover:bg-accent transition-colors"
        >
          Create account
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-line flex-1" />
        <span className="text-sm text-muted font-sans">OR</span>
        <div className="h-px bg-line flex-1" />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full rounded-full border border-line bg-transparent py-3 font-medium hover:bg-paper-soft transition-colors font-sans"
        >
          Continue with Google
        </button>


      </div>

      <p className="mt-6 text-sm text-muted font-sans">
        Already have an account?{' '}
        <Link to="/login" className="text-accent underline-grow">
          Sign in
        </Link>
      </p>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, required, maxLength }) {
  return (
    <label className="block">
      <span className="text-sm text-ink-soft mb-1 block">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none"
      />
    </label>
  )
}
