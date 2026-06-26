import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const initials = user?.email?.[0].toUpperCase() ?? '?'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/feed"
          className="text-indigo-700 font-bold text-lg tracking-tight"
        >
          Chatter
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/write"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Write
          </Link>

          <Link
            to="/dashboard"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>

          {/* Avatar → profile */}
          <Link
            to="/profile"
            className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-medium hover:bg-indigo-700 transition-colors"
          >
            {initials}
          </Link>

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>
    </nav>
  )
}