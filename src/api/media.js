export const BACKEND_ORIGIN =
  import.meta.env.VITE_API_ORIGIN || 'http://localhost:8080'

export function resolveMediaUrl(value) {
  if (!value) return ''
  const raw = String(value).trim()
  if (!raw) return ''

  if (/^(https?:|data:|blob:)/i.test(raw)) return raw

  // New stable media endpoint.
  if (raw.startsWith('/api/media/')) return `${BACKEND_ORIGIN}${raw}`

  // Convert old database URLs to the stable media endpoint too.
  if (raw.startsWith('/uploads/avatars/')) {
    const fileName = raw.slice('/uploads/avatars/'.length)
    return `${BACKEND_ORIGIN}/api/media/avatars/${encodeURIComponent(fileName)}`
  }

  if (raw.startsWith('/uploads/articles/')) {
    const fileName = raw.slice('/uploads/articles/'.length)
    return `${BACKEND_ORIGIN}/api/media/articles/${encodeURIComponent(fileName)}`
  }

  if (raw.startsWith('/api/')) return `${BACKEND_ORIGIN}${raw}`
  if (raw.startsWith('/')) return `${BACKEND_ORIGIN}${raw}`
  return `${BACKEND_ORIGIN}/${raw}`
}
