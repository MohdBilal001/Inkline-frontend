import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createArticle, isLoggedIn } from '../api/client'

export default function Editor() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle')
  const navigate = useNavigate()

  if (!isLoggedIn()) {
    return (
      <div className="mx-auto max-w-measure px-6 py-16">
        <p className="font-sans text-ink-soft">
          You need an account to publish.{' '}
          <Link to="/login" className="text-accent underline-grow">
            Log in
          </Link>{' '}
          or{' '}
          <Link to="/signup" className="text-accent underline-grow">
            sign up
          </Link>
          .
        </p>
      </div>
    )
  }

  async function handlePublish(e) {
    e.preventDefault()
    setStatus('publishing')
    try {
      const readingTime = Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200))
      const created = await createArticle({
        title,
        excerpt,
        content: body,
        status: 'PUBLISHED',
        readingTime
      })
      navigate(`/article/${created.slug}`)
    } catch (err) {
      setStatus('error')
    }
  }

  return (
    <div className="mx-auto max-w-measure px-6 py-14">
      <h1 className="font-display text-3xl font-medium mb-8">Write a new story</h1>
      <form onSubmit={handlePublish} className="space-y-6 font-sans">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="w-full font-display text-3xl font-medium placeholder:text-muted outline-none bg-transparent border-b border-line pb-3 focus:border-accent"
        />

        <input
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="One-line summary for the feed"
          className="w-full text-ink-soft placeholder:text-muted outline-none bg-transparent border-b border-line pb-3 focus:border-accent"
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell your story. Separate paragraphs with a blank line."
          rows={14}
          required
          className="w-full font-serif text-lg leading-relaxed placeholder:text-muted outline-none bg-transparent border border-line rounded-md p-4 focus:border-accent resize-y"
        />

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={status === 'publishing'}
            className="rounded-full bg-ink text-paper px-6 py-3 font-medium hover:bg-accent transition-colors disabled:opacity-50"
          >
            {status === 'publishing' ? 'Publishing…' : 'Publish'}
          </button>
          {status === 'error' && (
            <span className="text-brick text-sm">Could not publish. Try again.</span>
          )}
        </div>
      </form>
    </div>
  )
}
