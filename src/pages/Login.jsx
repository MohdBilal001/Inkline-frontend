import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, loginWithGoogle, loginWithGitHub, loginWithFacebook } from '../api/client'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError('Could not sign in. Check your email and password.')
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-20">
      <h1 className="font-display text-3xl font-medium mb-8">
        Welcome back
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5 font-sans">

        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />

        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />

        <div className="text-right -mt-2">
          <Link
            to="/forgot-password"
            className="text-sm text-accent underline-grow font-sans"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-brick text-sm">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-ink text-paper py-3 font-medium hover:bg-accent transition-colors"
        >
          Sign in
        </button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="h-px bg-line flex-1" />
        <span className="text-sm text-muted font-sans">
          OR
        </span>
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
        New to Inkline?{' '}
        <Link
          to="/signup"
          className="text-accent underline-grow"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}

function Field({ label, type, value, onChange, required }) {
  return (
    <label className="block">
      <span className="text-sm text-ink-soft mb-1 block">
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-transparent px-3 py-2 focus:border-accent outline-none"
      />
    </label>
  )
}