import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-[#1A1A1A]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E53935] text-white">🛡</span>
          GigShield
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-[#6B7280]">
          <Link to="/login" className="hover:text-[#E53935]">
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-full bg-[#E53935] px-4 py-2 text-white hover:bg-red-600"
          >
            Get Protected
          </Link>
        </nav>
      </div>
    </header>
  )
}
