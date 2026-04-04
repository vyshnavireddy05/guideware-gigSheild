import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import * as api from '../services/api.js'
import { formatDate, formatInr } from '../utils/format.js'

export default function PayoutsPage() {
  const { user } = useAuth()
  const { showError } = useToast()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const data = await api.payouts.getMyPayouts(user.id)
        if (alive) setRows(data)
      } catch (e) {
        showError(e.response?.data?.error || e.message || 'Failed to load payouts')
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (user?.id) load()
    return () => {
      alive = false
    }
  }, [user?.id, showError])

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10">
        <Link to="/dashboard" className="text-sm font-medium text-[#E53935] hover:underline">
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-[#1A1A1A]">Payouts</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {rows.map((p) => (
              <div key={p.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-[#6B7280]">Claim #{p.claimId}</p>
                    <p className="text-xl font-bold text-[#1A1A1A]">{formatInr(p.amount)}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      p.status === 'SUCCESS' ? 'bg-[#43A047] text-white' : 'bg-gray-200 text-[#1A1A1A]'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#6B7280]">
                  {p.transactionId} · {formatDate(p.completedAt || p.initiatedAt)}
                </p>
                <p className="text-sm text-[#6B7280]">UPI: {p.upiId || '—'}</p>
              </div>
            ))}
            {!rows.length && <p className="text-[#6B7280]">No payouts yet.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
