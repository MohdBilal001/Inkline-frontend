import { useEffect, useState } from 'react'
import { getFeed } from '../api/client'
import ArticleCard from '../components/ArticleCard'

export default function Feed() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getFeed({ page: 0, size: 20 })
      .then(({ articles }) => {
        if (!cancelled) setArticles(articles)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the feed. Is the backend running on :8080?')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="mx-auto max-w-measure px-6 py-10">
      <h1 className="font-display text-4xl font-medium mb-1">Latest stories</h1>
      <p className="text-muted font-sans text-sm mb-8">Published articles from every writer</p>

      {loading && <p className="text-muted font-sans">Loading stories…</p>}
      {error && <p className="text-brick font-sans">{error}</p>}

      {!loading && !error && articles.length === 0 && (
        <p className="text-muted font-sans">No published stories yet. Be the first to write one.</p>
      )}

      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} author={article.author} />
      ))}
    </div>
  )
}
