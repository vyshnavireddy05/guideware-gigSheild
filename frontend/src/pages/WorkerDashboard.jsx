import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StatCard.jsx'
import PolicyCard from '../components/PolicyCard.jsx'
import WeeklyCalendar from '../components/WeeklyCalendar.jsx'
import DisruptionAlertBanner from '../components/DisruptionAlertBanner.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import * as api from '../services/api.js'
import { formatDate, formatInr, greetingName } from '../utils/format.js'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WorkerDashboard() {
  const { user } = useAuth()
  const { showError } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const d = await api.dashboard.getWorkerDashboard(user.id)
        if (alive) setData(d)
      } catch (e) {
        showError(e.response?.data?.error || e.message || 'Failed to load dashboard')
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (user?.id) load()
    return () => {
      alive = false
    }
  }, [user?.id, showError])

  const chartData = useMemo(() => {
    const map = Object.fromEntries(DAYS.map((d) => [d, 0]))
    const recent = data?.recentClaims || []
    recent.forEach((c) => {
      if (!c.createdAt) return
      const dt = new Date(c.createdAt)
      const idx = (dt.getDay() + 6) % 7
      const day = DAYS[idx]
      const amt = Number(c.approvedAmount || c.claimedAmount || 0)
      map[day] += amt
    })
    return DAYS.map((day) => ({ day, amount: map[day] }))
  }, [data])

  const policy = data?.activePolicy && data.activePolicy.id ? data.activePolicy : null
  const alertMsg =
    data?.isDisruptionActiveInZone &&
    `⚠️ Disruption in your zone — claim auto-initiated where eligible. Funds will follow fraud checks.`

  const claimsWeek = (data?.recentClaims || []).filter((c) => {
    if (!c.createdAt) return false
    const t = new Date(c.createdAt).getTime()
    const ws = Date.now() - 7 * 86400000
    return t >= ws
  }).length

  const paidWeek = (data?.recentClaims || []).filter(
    (c) => c.status === 'PAID' && c.createdAt && new Date(c.createdAt).getTime() >= Date.now() - 7 * 86400000
  ).length

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6 lg:p-10">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A1A]">
                  {greetingName(user?.name)} 👋
                </h1>
                <p className="text-sm text-[#6B7280]">{formatDate(new Date().toISOString())}</p>
              </div>
            </div>

            <DisruptionAlertBanner message={alertMsg} />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="🛡"
                title="This Week's Coverage"
                value={policy ? formatInr(policy.maxCoverageAmount) : 'No Active Policy'}
                sub={policy ? `Valid till ${formatDate(policy.weekEndDate)}` : 'Buy coverage for this week'}
              />
              <StatCard
                icon="₹"
                title="Income Protected"
                value={formatInr(data?.totalPayoutsReceived)}
                sub={`Across ${data?.totalClaimsCount ?? 0} claims`}
              />
              <StatCard
                icon="📄"
                title="Claims This Week"
                value={String(claimsWeek)}
                sub={`${paidWeek} paid, ${Math.max(0, claimsWeek - paidWeek)} processing`}
              />
              <StatCard
                icon="📅"
                title="Policy Status"
                value={
                  <span className={policy ? 'text-[#43A047]' : 'text-gray-500'}>{policy ? 'ACTIVE' : 'INACTIVE'}</span>
                }
                sub="Week coverage"
              />
            </div>

            <div className="mt-8 space-y-4">
              <PolicyCard policy={policy} />
              {!policy && (
                <Link
                  to="/policy"
                  className="inline-block rounded-xl bg-[#E53935] px-6 py-3 font-semibold text-white shadow-md hover:bg-red-600"
                >
                  Buy This Week&apos;s Coverage
                </Link>
              )}
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Recent claims</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-[#6B7280]">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Disruption</th>
                      <th className="px-4 py-3">Hours</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentClaims || []).map((c) => (
                      <tr key={c.id} className="border-b border-gray-50">
                        <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                        <td className="px-4 py-3">{c.disruptionType?.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-3">{c.disruptionHours ?? '—'}</td>
                        <td className="px-4 py-3">{formatInr(c.claimedAmount)}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={c.status} />
                        </td>
                      </tr>
                    ))}
                    {!(data?.recentClaims || []).length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#6B7280]">
                          No claims yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10">
              <WeeklyCalendar data={chartData} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    PAID: 'bg-[#43A047] text-white',
    APPROVED: 'bg-blue-600 text-white',
    FRAUD_CHECK: 'bg-[#FB8C00] text-white',
    REJECTED: 'bg-[#E53935] text-white',
    AUTO_INITIATED: 'bg-gray-400 text-white',
  }
  const s = status || 'AUTO_INITIATED'
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${map[s] || map.AUTO_INITIATED}`}>
      {s.replace(/_/g, ' ')}
    </span>
  )
}
