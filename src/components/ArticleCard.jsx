import { Link } from 'react-router-dom'
import Avatar from './Avatar'
import { resolveMediaUrl } from '../api/media'
import RepostButton from './RepostButton'

export default function ArticleCard({ article, author }) {
  return (
    <article className="py-8 border-b border-line group">
      <div className="flex items-center gap-2 mb-3">
        <Avatar author={author} size={22} />
        <Link to={`/profile/${author.username}`} className="text-sm font-sans text-ink-soft hover:text-ink underline-grow">
          {author.name}
        </Link>
        <span className="text-muted">·</span>
        <time className="text-sm text-muted font-sans">{formatDate(article.publishedAt)}</time>
      </div>

      <Link to={`/article/${article.slug}`} className="block">
        {article.coverUrl && (
          <img
            src={resolveMediaUrl(article.coverUrl)}
            alt=""
            className="w-full aspect-video object-cover rounded-lg mb-5 border border-line"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}
        <h2 className="font-display text-2xl font-medium leading-snug mb-2 group-hover:text-accent transition-colors">
          {article.title}
        </h2>
        <p className="font-serif text-ink-soft leading-relaxed mb-4 max-w-measure">
          {article.excerpt}
        </p>
      </Link>

      <div className="flex items-center gap-4 text-xs font-sans text-muted">
        <span>{article.readingTime ?? 1} min read</span>
        <span>·</span>
        <span>👏 {formatClapCount(article.likes ?? 0)}</span>
        <span>·</span>
        <span>💬 {article.comments ?? 0}</span>
        <span>·</span>
        <RepostButton article={article} />
      </div>
    </article>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}


function formatClapCount(count) {
  const value = (Number(count) || 0) * 0.5
  if (value === 0) return '0'
  return Number.isInteger(value) ? `${value}K` : `${value.toFixed(1)}K`
}
