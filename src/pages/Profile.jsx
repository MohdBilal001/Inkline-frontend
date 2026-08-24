import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  getAuthorByUsername,
  getArticlesByUsername,
  getCurrentUser,
  isLoggedIn,
  updateProfile,
  uploadProfileAvatar,
  deleteProfileAvatar
} from '../api/client'
import Avatar from '../components/Avatar'
import ArticleCard from '../components/ArticleCard'

export default function Profile() {
  const { username } = useParams()
  const navigate = useNavigate()

  const [author, setAuthor] = useState(null)
  const [articles, setArticles] = useState([])
  const [status, setStatus] = useState('loading')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [photoBusy, setPhotoBusy] = useState(false)

  const currentUser = getCurrentUser()

  useEffect(() => {
    let cancelled = false

    setStatus('loading')

    getAuthorByUsername(username)
      .then(async (authorData) => {
        if (cancelled) return

        setAuthor(authorData)

        const theirArticles =
          await getArticlesByUsername(username)

        if (!cancelled) {
          setArticles(theirArticles)
          setStatus('ready')
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatus('not-found')
        }
      })

    return () => {
      cancelled = true
    }
  }, [username])

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-measure px-6 py-16 text-muted font-sans">
        Loading…
      </div>
    )
  }

  if (status === 'not-found' || !author) {
    return (
      <div className="mx-auto max-w-measure px-6 py-16 text-muted font-sans">
        No writer found.
      </div>
    )
  }

  const isOwnProfile =
    isLoggedIn() &&
    currentUser &&
    Number(currentUser.id) === Number(author.id)

  async function handleSave(event) {
    event.preventDefault()

    setEditError('')
    setUsernameError('')
    setSaving(true)

    const form = new FormData(event.currentTarget)

    const name = form.get('name').trim()
    const newUsername = form.get('username').trim()

    if (!/^[a-zA-Z0-9._]+$/.test(newUsername)) {
      setUsernameError('Only letters, numbers, dot (.) and underscore (_) are allowed.')
      setSaving(false)
      return
    }

    if (newUsername.length > 20) {
      setUsernameError('Username must be 20 characters or less.')
      setSaving(false)
      return
    }
    const bio = form.get('bio').trim()
    const avatarUrl = author.avatarUrl || ''

    try {
      const updatedUser = await updateProfile({
        name,
        username: newUsername,
        bio,
        avatarUrl
      })

      setAuthor(updatedUser)
      setEditing(false)

      if (newUsername !== username) {
        navigate(`/profile/${newUsername}`, {
          replace: true
        })
      }
    } catch (err) {
      const message = err.message || 'Could not update your profile.'

      if (/username is already taken/i.test(message)) {
        setUsernameError('Username is already taken')
      } else {
        setEditError(message)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-measure px-6 py-14">

      {/* Existing profile header */}

      <div className="flex items-start justify-between gap-6 mb-4">

        <div className="flex items-center gap-4">
          <Avatar author={author} size={64} />

          <div>
            <h1 className="font-display text-3xl font-medium">
              {author.name}
            </h1>

            <p className="font-sans text-sm text-muted">
              @{author.username}
            </p>
          </div>
        </div>

        {isOwnProfile && !editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="shrink-0 rounded-full border border-line px-4 py-2 text-sm font-sans text-ink hover:border-accent"
          >
            Edit profile
          </button>
        )}

      </div>

      {/* Edit form */}

      {isOwnProfile && editing && (
        <form
          onSubmit={handleSave}
          className="mb-10 border border-line rounded-md p-6"
        >
          <h2 className="font-display text-2xl font-medium mb-6">
            Edit profile
          </h2>

          <div className="space-y-5">

            <div>
              <label className="block font-sans text-sm font-medium mb-2">
                Name
              </label>

              <input
                name="name"
                defaultValue={author.name || ''}
                maxLength={80}
                required
                className="w-full font-sans bg-transparent border border-line rounded-md px-4 py-3 outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium mb-2">
                Username
              </label>

              <input
                name="username"
                defaultValue={author.username || ''}
                maxLength={20}
                required
                onChange={() => {
                  setUsernameError('')
                  setEditError('')
                }}
                className={`w-full font-sans bg-transparent border rounded-md px-4 py-3 outline-none focus:border-accent ${
                  usernameError ? 'border-brick' : 'border-line'
                }`}
              />

              {usernameError && (
                <p className="mt-2 text-sm font-sans text-brick">
                  {usernameError}
                </p>
              )}
            </div>

            <div>
              <label className="block font-sans text-sm font-medium mb-2">
                Bio
              </label>

              <textarea
                name="bio"
                defaultValue={author.bio || ''}
                maxLength={500}
                rows={4}
                className="w-full font-serif text-base leading-relaxed bg-transparent border border-line rounded-md px-4 py-3 outline-none focus:border-accent resize-y"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium mb-2">
                Profile photo
              </label>

              <div className="flex items-center gap-4">
                <Avatar author={author} size={72} />

                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer rounded-full border border-line px-4 py-2 text-sm font-sans text-ink hover:border-accent">
                    {photoBusy ? 'Uploading…' : 'Choose photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      disabled={photoBusy || saving}
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ''
                        if (!file) return

                        setEditError('')
                        setPhotoBusy(true)
                        try {
                          const updatedUser = await uploadProfileAvatar(file)
                          setAuthor(updatedUser)
                        } catch (err) {
                          setEditError(err.message || 'Could not upload your photo.')
                        } finally {
                          setPhotoBusy(false)
                        }
                      }}
                    />
                  </label>

                  {author.avatarUrl && (
                    <button
                      type="button"
                      disabled={photoBusy || saving}
                      onClick={async () => {
                        setEditError('')
                        setPhotoBusy(true)
                        try {
                          const updatedUser = await deleteProfileAvatar()
                          setAuthor(updatedUser)
                        } catch (err) {
                          setEditError(err.message || 'Could not remove your photo.')
                        } finally {
                          setPhotoBusy(false)
                        }
                      }}
                      className="rounded-full border border-line px-4 py-2 text-sm font-sans text-ink hover:border-brick disabled:opacity-50"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>

              <p className="mt-2 text-xs font-sans text-muted">
                JPG, PNG, GIF or WebP · maximum 5 MB
              </p>
            </div>

          </div>

          {editError && (
            <p className="mt-4 text-sm font-sans text-brick">
              {editError}
            </p>
          )}

          <div className="flex items-center gap-3 mt-6">

            <button
              type="submit"
              disabled={saving || photoBusy}
              className="rounded-full bg-ink text-paper px-5 py-2 font-sans text-sm hover:bg-accent disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>

            <button
              type="button"
              onClick={() => {
                setEditing(false)
                setEditError('')
                setUsernameError('')
              }}
              disabled={saving || photoBusy}
              className="rounded-full border border-line px-5 py-2 font-sans text-sm text-ink hover:border-accent"
            >
              Cancel
            </button>

          </div>
        </form>
      )}

      {/* Existing bio */}

      {!editing && author.bio && (
        <p className="font-serif text-ink-soft leading-relaxed mb-10 max-w-measure">
          {author.bio}
        </p>
      )}

      {/* Existing articles — untouched */}

      <h2 className="font-sans text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        Published
      </h2>

      {articles.length === 0 && (
        <p className="text-muted font-sans">
          No published stories yet.
        </p>
      )}

      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          author={article.author}
        />
      ))}

    </div>
  )
}