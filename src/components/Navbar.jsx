import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Avatar from './Avatar'
import { getCurrentUser, isLoggedIn, logout } from '../api/client'

export default function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const loggedIn = isLoggedIn()
  const user = getCurrentUser()

  function handleLogout() {
    logout()
    setMenuOpen(false)
    navigate('/')
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  const linkClass = ({ isActive }) =>
    `underline-grow ${isActive ? 'text-ink' : 'text-ink-soft'
    } hover:text-ink transition-colors`

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">

        {/* Top Navbar */}
        <div className="flex items-center justify-between py-4">
          <Link
            to="/"
            onClick={closeMenu}
            className="font-display text-2xl font-medium tracking-tight text-ink"
          >
            Inkline
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-sm">
            <NavLink to="/" end className={linkClass}>
              Feed
            </NavLink>

            {loggedIn && (
              <NavLink to="/write" className={linkClass}>
                Write
              </NavLink>
            )}

            <NavLink to="/contact" className={linkClass}>
              Contact Us
            </NavLink>

            <NavLink to="/rules" className={linkClass}>
              Rules
            </NavLink>

            <NavLink to="/about" className={linkClass}>
              About
            </NavLink>

            {loggedIn && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center gap-2 rounded-full border border-line pl-1 pr-3 py-1 hover:border-accent transition-colors"
                >
                  <Avatar author={user} size={26} />
                  <span className="text-ink-soft">{user.username}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-ink-soft hover:text-brick underline-grow"
                >
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center rounded-lg border border-line px-3 py-2 text-xl text-ink"
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {menuOpen && (
          <nav className="md:hidden border-t border-line py-4 flex flex-col gap-4 font-sans text-sm">
            <NavLink to="/" end onClick={closeMenu} className={linkClass}>
              Feed
            </NavLink>

            {loggedIn && (
              <NavLink to="/write" onClick={closeMenu} className={linkClass}>
                Write
              </NavLink>
            )}

            <NavLink to="/contact" onClick={closeMenu} className={linkClass}>
              Contact Us
            </NavLink>

            <NavLink to="/rules" onClick={closeMenu} className={linkClass}>
              Rules
            </NavLink>

            <NavLink to="/about" onClick={closeMenu} className={linkClass}>
              About
            </NavLink>

            {loggedIn && user ? (
              <>
                <Link
                  to={`/profile/${user.username}`}
                  onClick={closeMenu}
                  className="text-ink-soft"
                >
                  Profile ({user.username})
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-left text-ink-soft hover:text-brick"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="text-ink-soft"
                >
                  Log in
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="rounded-full bg-ink text-paper px-4 py-2 text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}