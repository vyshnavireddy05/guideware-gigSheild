import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import ClaimCard from '../components/ClaimCard.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import * as api from '../services/api.js'
import { formatInr } from '../utils/format.js'

const TABS = ['All', 'Paid', 'Approved', 'Fraud Check', 'Rejected']

export default function ClaimsPage() {
  const { user } = useAuth()
  const { showError } = useToast()
  const [activePolicy, setActivePolicy] = useState(undefined)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('All')
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const pol = await api.policy.getActive(user.id)
        const list = await api.claims.getMyClaims(user.id)
        if (alive) {
          setActivePolicy(pol && pol.id ? pol : null)
          setClaims(list)
        }
      } catch (e) {
        showError(e.response?.data?.error || e.message || 'Failed to load claims')
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (user?.id) load()
    return () => {
      alive = false
    }
  }, [user?.id, showError])

  const filtered = useMemo(() => {
    if (tab === 'All') return claims
    const map = {
      Paid: 'PAID',
      Approved: 'APPROVED',
      'Fraud Check': 'FRAUD_CHECK',
      Rejected: 'REJECTED',
    }
    const st = map[tab]
    return claims.filter((c) => c.status === st)
  }, [claims, tab])

  const totals = useMemo(() => {
    const total = claims.length
    const paid = claims.filter((c) => c.status === 'PAID')
    const paidSum = paid.reduce((a, c) => a + Number(c.approvedAmount || c.claimedAmount || 0), 0)
    const pending = claims.filter((c) => ['FRAUD_CHECK', 'AUTO_INITIATED', 'APPROVED'].includes(c.status)).length
    return { total, paidSum, pending }
  }, [claims])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex flex-1 justify-center py-20">
          <Spinner />
        </main>
      </div>
    )
  }

  if (!activePolicy?.id) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-semibold text-[#1A1A1A]">Purchase a policy first to get covered</p>
          <Link to="/policy" className="mt-4 rounded-xl bg-[#E53935] px-6 py-3 font-semibold text-white">
            View policy &amp; premium
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 space-y-8 overflow-auto p-6 lg:p-10">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-[#E53935] hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[#1A1A1A]">My Claims</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
            <p className="text-sm text-[#6B7280]">Total Claims</p>
            <p className="text-2xl font-bold text-[#1A1A1A]">{totals.total}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
            <p className="text-sm text-[#6B7280]">Total Paid Out</p>
            <p className="text-2xl font-bold text-[#43A047]">{formatInr(totals.paidSum)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
            <p className="text-sm text-[#6B7280]">Pending Claims</p>
            <p className="text-2xl font-bold text-[#FB8C00]">{totals.pending}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                tab === t ? 'bg-[#E53935] text-white' : 'bg-gray-100 text-[#6B7280]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filtered.map((c) => (
            <ClaimCard
              key={c.id}
              claim={c}
              expanded={!!expanded[c.id]}
              onToggle={() => setExpanded((e) => ({ ...e, [c.id]: !e[c.id] }))}
            />
          ))}
          {!filtered.length && <p className="text-center text-[#6B7280]">No claims in this filter.</p>}
        </div>
      </main>
    </div>
  )
}
