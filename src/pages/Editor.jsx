import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createArticle, getArticle, getCurrentUser, isLoggedIn, updateArticle, uploadArticleCover } from '../api/client'
import EmojiPicker from '../components/EmojiPicker'
import ImageCropper from '../components/ImageCropper'
import { resolveMediaUrl } from '../api/media'

function insertAtCursor(value, setValue, inputRef, text) {
  const el = inputRef.current
  if (!el) {
    setValue(`${value}${text}`)
    return
  }
  const start = el.selectionStart ?? value.length
  const end = el.selectionEnd ?? value.length
  const next = `${value.slice(0, start)}${text}${value.slice(end)}`
  setValue(next)
  requestAnimationFrame(() => {
    el.focus()
    const position = start + text.length
    el.setSelectionRange(position, position)
  })
}

export default function Editor() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [body, setBody] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [cropFile, setCropFile] = useState(null)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [status, setStatus] = useState('idle')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [loadingArticle, setLoadingArticle] = useState(false)
  const [originalCreatedAt, setOriginalCreatedAt] = useState(null)
  const bodyRef = useRef(null)
  const fileRef = useRef(null)
  const navigate = useNavigate()
  const { slug } = useParams()
  const editing = Boolean(slug)
  const currentUser = getCurrentUser()

  useEffect(() => {
    if (!editing || !isLoggedIn()) return
    let cancelled = false
    setLoadingArticle(true)
    getArticle(slug)
      .then((article) => {
        if (cancelled) return
        const mine = currentUser && Number(currentUser.id) === Number(article.author?.id)
        const ageMs = Date.now() - new Date(article.createdAt).getTime()
        if (!mine) {
          setError('You can only edit your own story.')
          return
        }
        if (ageMs > 10 * 60 * 1000) {
          setError('This story can only be edited within 10 minutes of publishing.')
          return
        }
        setTitle(article.title || '')
        setExcerpt(article.excerpt || '')
        setBody(Array.isArray(article.content) ? article.content.map((block) => block.text || '').join('\n\n') : article.content || '')
        setCoverUrl(article.coverUrl || '')
        setCoverPreview(article.coverUrl ? resolveMediaUrl(article.coverUrl) : '')
        setOriginalCreatedAt(article.createdAt)
      })
      .catch((err) => { if (!cancelled) setError(err.message || 'Could not load this story.') })
      .finally(() => { if (!cancelled) setLoadingArticle(false) })
    return () => { cancelled = true }
  }, [editing, slug])

  if (!isLoggedIn()) {
    return (
      <div className="mx-auto max-w-measure px-6 py-16">
        <p className="font-sans text-ink-soft">
          You need an account to publish.{' '}
          <Link to="/login" className="text-accent underline-grow">Log in</Link>{' '}
          or{' '}
          <Link to="/signup" className="text-accent underline-grow">sign up</Link>.
        </p>
      </div>
    )
  }

  async function handleCoverSelected(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be 10 MB or smaller before cropping.')
      return
    }
    setError('')
    setCropFile(file)
  }

  async function handleCropComplete(file) {
    setCropFile(null)
    setCoverPreview(URL.createObjectURL(file))
    setUploading(true)
    setError('')
    try {
      const result = await uploadArticleCover(file)
      setCoverUrl(result.url)
    } catch (err) {
      setCoverPreview('')
      setCoverUrl('')
      setError(err.message || 'Could not upload cover image.')
    } finally {
      setUploading(false)
    }
  }

  function removeCover() {
    if (coverPreview) URL.revokeObjectURL(coverPreview)
    setCoverPreview('')
    setCoverUrl('')
  }

  async function handlePublish(e) {
    e.preventDefault()
    if (editing && originalCreatedAt && Date.now() - new Date(originalCreatedAt).getTime() > 10 * 60 * 1000) {
      setError('This story can only be edited within 10 minutes of publishing.')
      return
    }
    setStatus('publishing')
    setError('')
    try {
      const readingTime = Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 200))
      const payload = { title, excerpt, content: body, coverUrl, status: 'PUBLISHED', readingTime }
      const saved = editing ? await updateArticle(slug, payload) : await createArticle(payload)
      navigate(`/article/${saved.slug}`)
    } catch (err) {
      setStatus('error')
      setError(err.message || (editing ? 'Could not save changes.' : 'Could not publish. Try again.'))
    }
  }

  return (
    <>
      <div className="mx-auto max-w-measure px-6 py-14">
        <h1 className="font-display text-3xl font-medium mb-8">{editing ? 'Edit story' : 'Write a new story'}</h1>

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

          <section className="rounded-xl border border-line p-4 bg-paper-dim/40">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="font-display text-xl font-medium">Cover image</h2>
                <p className="text-xs text-muted mt-1">Choose an image from your desktop, crop it, then upload it.</p>
              </div>
              {!coverPreview && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="rounded-full border border-line px-4 py-2 text-sm hover:border-accent disabled:opacity-50"
                >
                  {uploading ? 'Uploading…' : 'Choose image'}
                </button>
              )}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleCoverSelected}
              className="hidden"
            />

            {coverPreview && (
              <div className="relative overflow-hidden rounded-lg border border-line">
                <img src={coverPreview} alt="Cover preview" className="w-full aspect-video object-cover" />
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-full bg-paper px-4 py-2 text-sm shadow"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={removeCover}
                    className="rounded-full bg-paper px-4 py-2 text-sm text-brick shadow"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </section>

          <div className="relative">
            <textarea
              ref={bodyRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Tell your story. Separate paragraphs with a blank line."
              rows={14}
              required
              className="w-full font-serif text-lg leading-relaxed placeholder:text-muted outline-none bg-transparent border border-line rounded-md p-4 pb-14 focus:border-accent resize-y"
            />

            <div className="absolute right-3 bottom-3">
              <button
                type="button"
                onClick={() => setEmojiOpen((open) => !open)}
                className="rounded-full border border-line bg-paper px-3 py-1.5 text-lg hover:border-accent"
                aria-label="Add emoji"
                title="Add emoji"
              >
                😊
              </button>
              {emojiOpen && (
                <EmojiPicker
                  onClose={() => setEmojiOpen(false)}
                  onSelect={(emoji) => {
                    insertAtCursor(body, setBody, bodyRef, emoji)
                    setEmojiOpen(false)
                  }}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={status === 'publishing' || uploading}
              className="rounded-full bg-ink text-paper px-6 py-3 font-medium hover:bg-accent transition-colors disabled:opacity-50"
            >
              {status === 'publishing' ? (editing ? 'Saving…' : 'Publishing…') : (editing ? 'Save changes' : 'Publish')}
            </button>
            {error && <span className="text-brick text-sm">{error}</span>}
          </div>
        </form>
      </div>

      {cropFile && (
        <ImageCropper
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onCrop={handleCropComplete}
        />
      )}
    </>
  )
}
