import { useEffect, useState } from 'react'
import { resolveMediaUrl } from '../api/media'

// The backend doesn't store a per-user color, so derive a stable one from
// the username/id — same input always produces the same swatch.
const PALETTE = ['#2F5233', '#8B3A3A', '#4A473F', '#6B5B95', '#3D5A80', '#7A5C2E']

function colorFor(seed) {
  const str = String(seed || '')
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

function resolveAvatarUrl(value) {
  return resolveMediaUrl(value)
}

export default function Avatar({ author, size = 40 }) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [author?.avatarUrl])

  if (!author) return null

  const initials = (author.name || author.username || '?')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const avatarUrl = resolveAvatarUrl(author.avatarUrl)

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt={`${author.name || author.username || 'User'} profile photo`}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
        onError={() => setImageFailed(true)}
      />
    )
  }

  return (
    <div
      className="flex items-center justify-center rounded-full font-sans font-medium shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(author.username || author.id),
        color: '#F6F4EF',
        fontSize: size * 0.4
      }}
      aria-hidden="true"
    >
      {initials}
    </div>
  )
}
