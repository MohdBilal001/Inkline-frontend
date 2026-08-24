import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArticle } from '../api/client'
import Avatar from '../components/Avatar'
import ReadingProgress from '../components/ReadingProgress'

export default function Article() {
  const { slug } = useParams()
  const [article, setArticle] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    getArticle(slug)
      .then((data) => {
        if (!cancelled) setArticle(data)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load this article.')
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (error) {
    return <div className="mx-auto max-w-measure px-6 py-16 text-brick font-sans">{error}</div>
  }
  if (!article) {
    return <div className="mx-auto max-w-measure px-6 py-16 text-muted font-sans">Loading…</div>
  }

  const author = article.author

  return (
    <>
      <ReadingProgress />
      <article className="mx-auto max-w-measure px-6 py-14">
        <h1 className="font-display text-4xl md:text-5xl font-medium leading-tight mb-6">
          {article.title}
        </h1>

        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-line">
          <Avatar author={author} size={44} />
          <div>
            <Link to={`/profile/${author.username}`} className="font-sans font-medium text-ink underline-grow">
              {author.name}
            </Link>
            <p className="font-sans text-sm text-muted">
              {article.readingTime ?? 1} min read
              {article.publishedAt ? ` · ${formatDate(article.publishedAt)}` : ''}
            </p>
          </div>
        </div>

        <div className="prose-article">
          {article.content.map((block, i) => (
            <p key={i}>{block.text}</p>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-line flex items-center gap-4 text-sm font-sans text-muted">
          <span>👏 {article.likes ?? 0} claps</span>
          <span>·</span>
          <span>{article.comments ?? 0} comments</span>
        </div>
      </article>
    </>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}
