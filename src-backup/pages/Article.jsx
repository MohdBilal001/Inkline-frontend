import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  getArticle,
  getComments,
  addComment,
  clapArticle,
  getClapStatus,
  deleteComment,
  deleteArticle,
  getCurrentUser,
  isLoggedIn
} from '../api/client'
import Avatar from '../components/Avatar'
import ReadingProgress from '../components/ReadingProgress'

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

  const currentUser = getCurrentUser()

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getArticle(slug),
      getComments(slug),
      isLoggedIn()
        ? getClapStatus(slug)
        : Promise.resolve({ clapped: false })
    ])
      .then(([articleData, commentData, clapData]) => {
        if (cancelled) return

        setArticle(articleData)
        setComments(commentData || [])
        setClapped(Boolean(clapData?.clapped))
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
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-sans text-brick hover:border-brick disabled:opacity-50"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
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

        <div className="prose-article">

          {article.content.map((block, i) => (
            <p key={i}>
              {block.text}
            </p>
          ))}

        </div>

        {/* Article actions */}

        <div className="mt-12 pt-6 border-t border-line flex items-center gap-4 text-sm font-sans">

          <button
            type="button"
            onClick={handleClap}
            disabled={clapping}
            className="rounded-full border border-line px-4 py-2 text-ink hover:border-accent disabled:opacity-60"
          >
            {clapped ? '👏 Unclap' : '👏 Clap'}
            {' '}· {article.likes ?? 0}
          </button>

          <span className="text-muted">
            💬 {article.comments ?? 0} comments
          </span>

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

              <textarea
                value={commentText}
                onChange={(event) =>
                  setCommentText(event.target.value)
                }
                maxLength={2000}
                rows={4}
                placeholder="Write a thoughtful comment…"
                className="w-full font-serif text-base leading-relaxed placeholder:text-muted outline-none bg-transparent border border-line rounded-md p-4 focus:border-accent resize-y"
              />

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