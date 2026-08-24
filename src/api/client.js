// Talks to the real Spring Boot backend (com.inkline.*).
// Dev server proxies /api -> http://localhost:8080 (see vite.config.js),
// and the backend's CORS config already allows http://localhost:5173.

const BASE_URL = '/api'
const TOKEN_KEY = 'inkline_token'
const USER_KEY = 'inkline_user'

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    },
    ...options
  })

  if (!res.ok) {
    // 401/403 from a protected route (e.g. token expired) -> clear session.
    if (res.status === 401 || res.status === 403) clearSession()
    const body = await res.text().catch(() => '')

    let message = body
    try {
      const parsed = JSON.parse(body)
      message =
        parsed?.message ||
        parsed?.error ||
        parsed?.detail ||
        parsed?.errors?.username ||
        body
    } catch {
      // Keep plain-text backend responses as-is.
    }

    throw new Error(
      String(message || `Request failed with status ${res.status}`).trim()
    )
  }

  if (res.status === 204 || res.status === 202) return null
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) 
  } catch {
    return text
  }
}

// ---- session helpers ---------------------------------------------------

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function isLoggedIn() {
  return Boolean(getToken())
}

function saveSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
export async function completeGoogleLogin(token) {
  localStorage.setItem(TOKEN_KEY, token)

  const user = await request('/users/me')

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  )

  return user
}

// ---- article interactions -----------------------------------------------

export async function clapArticle(slug) {
  const data = await request(
    `/articles/${encodeURIComponent(slug)}/clap`,
    {
      method: 'POST'
    }
  )

  return normalizeArticle(data)
}

export async function getClapStatus(slug) {
  return request(
    `/articles/${encodeURIComponent(slug)}/clap-status`
  )
}

export async function repostArticle(slug) {
  const data = await request(
    `/articles/${encodeURIComponent(slug)}/repost`,
    { method: 'POST' }
  )

  return normalizeArticle(data)
}

export async function getRepostStatus(slug) {
  return request(
    `/articles/${encodeURIComponent(slug)}/repost-status`
  )
}

export async function getComments(slug) {
  return request(
    `/articles/${encodeURIComponent(slug)}/comments`
  )
}

export async function addComment(slug, content) {
  return request(
    `/articles/${encodeURIComponent(slug)}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ content })
    }
  )
}

export async function deleteComment(slug, commentId) {
  return request(
    `/articles/${encodeURIComponent(slug)}/comments/${commentId}`,
    {
      method: 'DELETE'
    }
  )
}

export async function deleteArticle(slug) {
  return request(
    `/articles/${encodeURIComponent(slug)}`,
    {
      method: 'DELETE'
    }
  )
}

// ---- auth ---------------------------------------------------------------
// Backend: POST /api/auth/login, /api/auth/signup -> { token, user }

export async function requestPasswordReset(email) {
  return request('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function resetPassword(token, password) {
  return request('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password })
  })
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  saveSession(data)
  return data
}

export async function signup({ name, username, email, password }) {
  const data = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, username, email, password })
  })
  saveSession(data)
  return data
}

export function logout() {
  clearSession()
}
// ---- social authentication ---------------------------------------------

export function loginWithGoogle() {
  window.location.href =
    'http://localhost:8080/oauth2/authorization/google'
}

export function loginWithGitHub() {
  window.location.href =
    'http://localhost:8080/oauth2/authorization/github'
}

export function loginWithFacebook() {
  window.location.href =
    'http://localhost:8080/oauth2/authorization/facebook'
}
// ---- users ---------------------------------------------------------------
// Backend: GET /api/users/{id}, GET /api/users/username/{username}

export async function getAuthorByUsername(username) {
  return request(`/users/username/${encodeURIComponent(username)}`)
}

export async function getAuthorById(id) {
  return request(`/users/${id}`)
}

// ---- articles -------------------------------------------------------------
// Backend: GET /api/articles -> Spring Data Page { content, totalElements, ... }
//          GET /api/articles/{slug} -> ArticleResponse
//          POST /api/articles (auth required) -> ArticleResponse

export async function getFeed({ page = 0, size = 20 } = {}) {
  const data = await request(`/articles?page=${page}&size=${size}`)
  return {
    articles: data.content.map(normalizeArticle),
    totalPages: data.totalPages,
    totalElements: data.totalElements
  }
}

export async function getArticle(slug) {
  const data = await request(`/articles/${encodeURIComponent(slug)}`)
  return normalizeArticle(data)
}

// The backend has no "articles by author" endpoint yet. Until it does,
// pull one page of the feed and filter client-side — fine for a small
// demo dataset, not meant to scale.
export async function getArticlesByUsername(username) {
  const { articles } = await getFeed({ size: 50 })
  return articles.filter((a) => a.author.username === username)
}

export async function createArticle({ title, excerpt, content, coverUrl, status, readingTime }) {
  const data = await request('/articles', {
    method: 'POST',
    body: JSON.stringify({ title, excerpt, content, coverUrl, status, readingTime })
  })
  return normalizeArticle(data)
}

export async function updateArticle(slug, { title, excerpt, content, coverUrl, status, readingTime }) {
  const data = await request(`/articles/${encodeURIComponent(slug)}`, {
    method: 'PUT',
    body: JSON.stringify({ title, excerpt, content, coverUrl, status, readingTime })
  })
  return normalizeArticle(data)
}

// The backend's Article entity stores `content` as a single text blob, not
// a list of typed blocks. Split it into paragraphs so the reader page can
// render it the same way it rendered the old mock data.
function normalizeArticle(article) {
  return {
    ...article,
    content: (article.content || '')
      .split(/\n{2,}/)
      .map((text) => text.trim())
      .filter(Boolean)
      .map((text) => ({ type: 'p', text }))
  }
}
export async function updateProfile({
  name,
  username,
  bio,
  avatarUrl
}) {
  const data = await request('/users/me', {
    method: 'PUT',
    body: JSON.stringify({
      name,
      username,
      bio,
      avatarUrl
    })
  })

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(data)
  )

  return data
}
// ---- contact -------------------------------------------------------------
// Public endpoint: sends a contact message to the site's configured Gmail inbox.
export async function sendContactMessage({ name, email, subject, message }) {
  return request('/contact', {
    method: 'POST',
    body: JSON.stringify({ name, email, subject, message })
  })
}

export async function uploadProfileAvatar(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/users/me/avatar`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearSession()
    const body = await res.text().catch(() => '')

    let message = body
    try {
      const parsed = JSON.parse(body)
      message =
        parsed?.message ||
        parsed?.error ||
        parsed?.detail ||
        body
    } catch {
      // Keep plain-text backend responses as-is.
    }

    throw new Error(
      String(message || `Request failed with status ${res.status}`).trim()
    )
  }

  const data = await res.json()
  localStorage.setItem(USER_KEY, JSON.stringify(data))
  return data
}

export async function deleteProfileAvatar() {
  const data = await request('/users/me/avatar', {
    method: 'DELETE'
  })

  localStorage.setItem(USER_KEY, JSON.stringify(data))
  return data
}

export async function uploadArticleCover(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${BASE_URL}/articles/cover-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  })

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) clearSession()
    const body = await res.text().catch(() => '')
    let message = body
    try {
      const parsed = JSON.parse(body)
      message = parsed?.message || parsed?.error || parsed?.detail || body
    } catch {}
    throw new Error(String(message || `Request failed with status ${res.status}`).trim())
  }

  return res.json()
}
