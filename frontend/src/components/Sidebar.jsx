import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const workerItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/policy', label: 'My Policy', icon: '📋' },
  { to: '/claims', label: 'My Claims', icon: '📝' },
  { to: '/payouts', label: 'Payouts', icon: '💸' },
]

export default function Sidebar({ variant = 'worker' }) {
  const { user, logout } = useAuth()

  const items = variant === 'admin' ? [] : workerItems

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-gray-100 bg-white">
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center gap-2 font-bold text-[#E53935]">
          <span className="text-xl">🛡</span>
          GigShield
        </div>
        {variant === 'admin' && (
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Admin</p>
        )}
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {variant === 'admin' ? (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? 'border-l-4 border-[#E53935] bg-red-50 text-[#E53935]'
                  : 'border-l-4 border-transparent text-[#6B7280] hover:bg-gray-50'
              }`
            }
          >
            <span>📊</span> Admin Home
          </NavLink>
        ) : (
          items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'border-l-4 border-[#E53935] bg-red-50 text-[#E53935]'
                    : 'border-l-4 border-transparent text-[#6B7280] hover:bg-gray-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))
        )}
        <div className="mt-auto border-t border-gray-100 pt-3">
          <p className="truncate px-3 text-xs text-[#6B7280]">👤 {user?.name}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[#6B7280] hover:bg-gray-50"
          >
            🚪 Logout
          </button>
        </div>
      </nav>
    </aside>
  )
}
