import { useEffect, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getArticle,
  getComments,
  addComment,
  clapArticle,
  getClapStatus,
  repostArticle,
  getRepostStatus,
  deleteComment,
  deleteArticle,
  getCurrentUser,
  isLoggedIn
} from '../api/client'
import Avatar from '../components/Avatar'
import ReadingProgress from '../components/ReadingProgress'
import EmojiPicker from '../components/EmojiPicker'
import { resolveMediaUrl } from '../api/media'

export default function Article() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [article, setArticle] = useState(null)
  const [comments, setComments] = useState([])
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const [commentText, setCommentText] = useState('')
  const [clapping, setClapping] = useState(false)
  const [commenting, setCommenting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deletingComment, setDeletingComment] = useState(null)
  const [clapped, setClapped] = useState(false)
  const [reposted, setReposted] = useState(false)
  const [reposting, setReposting] = useState(false)
  const [shareMessage, setShareMessage] = useState('')
  const [emojiOpen, setEmojiOpen] = useState(false)
  const commentRef = useRef(null)

  const currentUser = getCurrentUser()

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getArticle(slug),
      getComments(slug),
      isLoggedIn()
        ? getClapStatus(slug)
        : Promise.resolve({ clapped: false }),
      isLoggedIn()
        ? getRepostStatus(slug)
        : Promise.resolve({ reposted: false })
    ])
      .then(([articleData, commentData, clapData, repostData]) => {
        if (cancelled) return

        setArticle(articleData)
        setComments(commentData || [])
        setClapped(Boolean(clapData?.clapped))
        setReposted(Boolean(repostData?.reposted))
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not load this article.')
        }
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (error) {
    return (
      <div className="mx-auto max-w-measure px-6 py-16 text-brick font-sans">
        {error}
      </div>
    )
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-measure px-6 py-16 text-muted font-sans">
        Loading…
      </div>
    )
  }

  const author = article.author

  const isAuthor =
    currentUser &&
    author &&
    Number(currentUser.id) === Number(author.id)

  const canEdit = Boolean(
    isAuthor &&
    article.createdAt &&
    Date.now() - new Date(article.createdAt).getTime() <= 10 * 60 * 1000
  )

  async function handleClap() {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }

    if (clapping) return

    setActionError('')
    setClapping(true)

    try {
      const updatedArticle = await clapArticle(slug)

      setArticle(updatedArticle)
      setClapped((current) => !current)
    } catch (err) {
      setActionError(
        err.message || 'Could not update clap.'
      )
    } finally {
      setClapping(false)
    }
  }

  async function handleRepost() {
    if (!isLoggedIn()) {
      navigate('/login')
      return
    }

    if (reposting) return

    setActionError('')
    setReposting(true)

    try {
      const updatedArticle = await repostArticle(slug)
      setArticle(updatedArticle)
      setReposted((current) => !current)
    } catch (err) {
      setActionError(err.message || 'Could not update repost.')
    } finally {
      setReposting(false)
    }
  }

  async function handleShare() {
    const shareUrl = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt || article.title,
          url: shareUrl
        })
        return
      }

      await navigator.clipboard.writeText(shareUrl)
      setShareMessage('Link copied!')
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setShareMessage('Could not share the link.')
      }
    }

    window.setTimeout(() => setShareMessage(''), 2500)
  }

  async function handleComment(event) {
    event.preventDefault()

    if (!isLoggedIn()) {
      navigate('/login')
      return
    }

    const content = commentText.trim()

    if (!content) return

    setActionError('')
    setCommenting(true)

    try {
      const newComment = await addComment(slug, content)

      setComments((current) => [
        ...current,
        newComment
      ])

      setCommentText('')

      setArticle((current) => ({
        ...current,
        comments: (current.comments ?? 0) + 1
      }))
    } catch (err) {
      setActionError(
        err.message || 'Could not add your comment.'
      )
    } finally {
      setCommenting(false)
    }
  }

  async function handleDeleteComment(commentId) {
    if (deletingComment) return

    const confirmed = window.confirm(
      'Delete this comment?'
    )

    if (!confirmed) return

    setActionError('')
    setDeletingComment(commentId)

    try {
      await deleteComment(slug, commentId)

      setComments((current) =>
        current.filter(
          (comment) => comment.id !== commentId
        )
      )

      setArticle((current) => ({
        ...current,
        comments: Math.max(
          0,
          (current.comments ?? 0) - 1
        )
      }))
    } catch (err) {
      setActionError(
        err.message || 'Could not delete this comment.'
      )
    } finally {
      setDeletingComment(null)
    }
  }

  async function handleDelete() {
    if (!isAuthor || deleting) return

    const confirmed = window.confirm(
      'Delete this article? This cannot be undone.'
    )

    if (!confirmed) return

    setActionError('')
    setDeleting(true)

    try {
      await deleteArticle(slug)
      navigate('/')
    } catch (err) {
      setActionError(
        err.message || 'Could not delete this article.'
      )
      setDeleting(false)
    }
  }

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-measure px-6 py-14">

        <div className="flex items-start justify-between gap-6">

          <h1 className="font-display text-4xl md:text-5xl font-medium leading-tight mb-6">
            {article.title}
          </h1>

          {isAuthor && (
            <div className="shrink-0 flex items-center gap-2">
              {canEdit && (
                <Link
                  to={`/write/${encodeURIComponent(article.slug)}`}
                  className="rounded-full border border-line px-4 py-2 text-sm font-sans hover:border-accent hover:text-accent"
                >
                  Edit
                </Link>
              )}
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full border border-line px-4 py-2 text-sm font-sans text-brick hover:border-brick disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}

        </div>

        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-line">

          <Avatar author={author} size={44} />

          <div>
            <Link
              to={`/profile/${author.username}`}
              className="font-sans font-medium text-ink underline-grow"
            >
              {author.name}
            </Link>

            <p className="font-sans text-sm text-muted">
              {article.readingTime ?? 1} min read
              {article.publishedAt
                ? ` · ${formatDate(article.publishedAt)}`
                : ''}
            </p>
          </div>

        </div>

        {article.coverUrl && (
          <img
            src={resolveMediaUrl(article.coverUrl)}
            alt=""
            className="w-full aspect-video object-cover rounded-xl mb-10 border border-line"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
        )}

        <div className="prose-article">

          {article.content.map((block, i) => (
            <p key={i}>
              {block.text}
            </p>
          ))}

        </div>

        {/* Article actions */}

        <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center gap-3 text-sm font-sans">

          <button
            type="button"
            onClick={handleClap}
            disabled={clapping}
            className="rounded-full border border-line px-4 py-2 text-ink hover:border-accent disabled:opacity-60"
          >
            👏 {formatClapCount(article.likes ?? 0)}
          </button>

          <span className="rounded-full border border-line px-4 py-2 text-muted">
            💬 {article.comments ?? 0}
          </span>

          <button
            type="button"
            onClick={handleRepost}
            disabled={reposting}
            className={`rounded-full border px-4 py-2 transition-colors disabled:opacity-60 ${
              reposted
                ? 'border-accent text-accent'
                : 'border-line text-ink hover:border-accent'
            }`}
          >
            🔁 {article.reposts ?? 0}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="rounded-full border border-line px-4 py-2 text-ink hover:border-accent"
          >
            🔗 Share
          </button>

          {shareMessage && (
            <span className="text-xs text-muted">{shareMessage}</span>
          )}

        </div>

        {actionError && (
          <p className="mt-4 text-sm font-sans text-brick">
            {actionError}
          </p>
        )}

        {/* Comments */}

        <section className="mt-10 pt-8 border-t border-line">

          <h2 className="font-display text-2xl font-medium mb-6">
            Comments
          </h2>

          {isLoggedIn() ? (
            <form
              onSubmit={handleComment}
              className="mb-8"
            >

              <div className="relative">
                <textarea
                  ref={commentRef}
                  value={commentText}
                  onChange={(event) =>
                    setCommentText(event.target.value)
                  }
                  maxLength={2000}
                  rows={4}
                  placeholder="Write a thoughtful comment…"
                  className="w-full font-serif text-base leading-relaxed placeholder:text-muted outline-none bg-transparent border border-line rounded-md p-4 pb-14 focus:border-accent resize-y"
                />

                <div className="absolute right-3 bottom-3">
                  <button
                    type="button"
                    onClick={() => setEmojiOpen((open) => !open)}
                    className="rounded-full border border-line bg-paper px-3 py-1.5 text-lg hover:border-accent"
                    aria-label="Add emoji to comment"
                    title="Add emoji"
                  >
                    😊
                  </button>
                  {emojiOpen && (
                    <EmojiPicker
                      onClose={() => setEmojiOpen(false)}
                      onSelect={(emoji) => {
                        const value = commentText
                        const el = commentRef.current
                        const start = el?.selectionStart ?? value.length
                        const end = el?.selectionEnd ?? value.length
                        const next = `${value.slice(0, start)}${emoji}${value.slice(end)}`
                        setCommentText(next)
                        setEmojiOpen(false)
                        requestAnimationFrame(() => {
                          el?.focus()
                          const position = start + emoji.length
                          el?.setSelectionRange(position, position)
                        })
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">

                <span className="text-xs font-sans text-muted">
                  {commentText.length}/2000
                </span>

                <button
                  type="submit"
                  disabled={
                    commenting ||
                    !commentText.trim()
                  }
                  className="rounded-full bg-ink text-paper px-5 py-2 font-sans text-sm hover:bg-accent disabled:opacity-50"
                >
                  {commenting
                    ? 'Posting…'
                    : 'Post comment'}
                </button>

              </div>

            </form>
          ) : (
            <p className="mb-8 text-sm font-sans text-muted">
              <Link
                to="/login"
                className="text-accent underline-grow"
              >
                Log in
              </Link>
              {' '}to leave a comment.
            </p>
          )}

          {comments.length === 0 ? (
            <p className="text-muted font-sans text-sm">
              No comments yet. Be the first.
            </p>
          ) : (
            <div className="space-y-6">

              {comments.map((comment) => {

                const canDeleteComment =
                  currentUser &&
                  comment.author &&
                  Number(currentUser.id) ===
                  Number(comment.author.id)

                return (
                  <div
                    key={comment.id}
                    className="border-b border-line pb-5"
                  >

                    <div className="flex items-center gap-2 mb-2">

                      <Avatar
                        author={comment.author}
                        size={28}
                      />

                      <Link
                        to={`/profile/${comment.author.username}`}
                        className="font-sans text-sm font-medium text-ink underline-grow"
                      >
                        {comment.author.name}
                      </Link>

                      <span className="text-muted text-xs">
                        ·
                      </span>

                      <time className="text-muted text-xs font-sans">
                        {formatDate(comment.createdAt)}
                      </time>

                      {canDeleteComment && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteComment(comment.id)
                          }
                          disabled={
                            deletingComment === comment.id
                          }
                          className="ml-auto text-xs font-sans text-brick hover:underline disabled:opacity-50"
                        >
                          {deletingComment === comment.id
                            ? 'Deleting…'
                            : 'Delete'}
                        </button>
                      )}

                    </div>

                    <p className="font-serif text-ink-soft leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>

                  </div>
                )
              })}

            </div>
          )}

        </section>

      </article>
    </>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }
  )
}

function formatClapCount(count) {
  const value = (Number(count) || 0) * 0.5
  if (value === 0) return '0'
  return Number.isInteger(value) ? `${value}K` : `${value.toFixed(1)}K`
}
