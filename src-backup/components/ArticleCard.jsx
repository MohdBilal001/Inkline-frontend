import { Link } from 'react-router-dom'
import Avatar from './Avatar'

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
        <span>{article.likes ?? 0} claps</span>
        <span>·</span>
        <span>{article.comments ?? 0} comments</span>
      </div>
    </article>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
