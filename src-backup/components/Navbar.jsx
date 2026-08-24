import { Link, NavLink, useNavigate } from 'react-router-dom'
import Avatar from './Avatar'
import { getCurrentUser, isLoggedIn, logout } from '../api/client'

export default function Navbar() {
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()
  const user = getCurrentUser()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-display text-2xl font-medium tracking-tight text-ink">
          Inkline
        </Link>

        <nav className="flex items-center gap-6 font-sans text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `underline-grow ${isActive ? 'text-ink' : 'text-ink-soft'}`}
          >
            Feed
          </NavLink>

          {loggedIn && (
            <NavLink
              to="/write"
              className={({ isActive }) => `underline-grow ${isActive ? 'text-ink' : 'text-ink-soft'}`}
            >
              Write
            </NavLink>
          )}

          {loggedIn && user ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center gap-2 rounded-full border border-line pl-1 pr-3 py-1 hover:border-accent transition-colors"
              >
                <Avatar author={user} size={26} />
                <span className="text-ink-soft">{user.username}</span>
              </Link>
              <button onClick={handleLogout} className="text-ink-soft hover:text-brick underline-grow">
                Log out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-ink-soft underline-grow">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-ink text-paper px-4 py-1.5 hover:bg-accent transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
