import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRepostStatus, isLoggedIn, repostArticle } from '../api/client'

export default function RepostButton({ article, className = '' }) {
  const navigate = useNavigate()
  const [reposted, setReposted] = useState(false)
  const [reposting, setReposting] = useState(false)
  const [count, setCount] = useState(Number(article?.reposts) || 0)

  useEffect(() => {
    let cancelled = false
    setCount(Number(article?.reposts) || 0)

    if (!isLoggedIn() || !article?.slug) {
      setReposted(false)
      return () => { cancelled = true }
    }

    getRepostStatus(article.slug)
      .then((data) => {
        if (!cancelled) setReposted(Boolean(data?.reposted))
      })
      .catch(() => {
        if (!cancelled) setReposted(false)
      })

    return () => { cancelled = true }
  }, [article?.slug, article?.reposts])

  async function handleRepost(event) {
    event.preventDefault()
    event.stopPropagation()

    if (!isLoggedIn()) {
      navigate('/login')
      return
    }

    if (reposting) return

    setReposting(true)
    try {
      const updated = await repostArticle(article.slug)
      setCount(Number(updated?.reposts) || 0)
      setReposted((current) => !current)
    } catch {
      // The article page exposes the detailed error.
    } finally {
      setReposting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleRepost}
      disabled={reposting}
      aria-label={reposted ? 'Undo repost' : 'Repost article'}
      title={reposted ? 'Undo repost' : 'Repost article'}
      className={`rounded-full border px-3 py-1 transition-colors disabled:opacity-60 ${
        reposted
          ? 'border-accent text-accent'
          : 'border-line text-muted hover:border-accent hover:text-accent'
      } ${className}`}
    >
      🔁 Repost {count}
    </button>
  )
}
