import { Routes, Route } from 'react-router-dom'
import OAuthSuccess from './pages/OAuthSuccess'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Feed from './pages/Feed'
import Article from './pages/Article'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Editor from './pages/Editor'
import About from './pages/About'
import Rules from './pages/Rules'
import Contact from './pages/Contact'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>

          <Route path="/" element={<Feed />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/write" element={<Editor />} />
          <Route path="/write/:slug" element={<Editor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
