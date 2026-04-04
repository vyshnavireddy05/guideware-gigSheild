import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import Spinner from '../components/Spinner.jsx'
import { useToast } from '../context/ToastContext.jsx'
import * as api from '../services/api.js'
import { formatInr } from '../utils/format.js'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const ZONE_OPTIONS = {
  Hyderabad: [
    'Banjara Hills',
    'LB Nagar',
    'Kukatpally',
    'Secunderabad',
    'Kondapur',
    'Madhapur',
    'Dilsukhnagar',
    'Mehdipatnam',
  ],
  Mumbai: ['Andheri', 'Bandra', 'Dadar', 'Kurla', 'Thane'],
  Bangalore: ['Koramangala', 'Whitefield', 'Indiranagar', 'Marathahalli', 'HSR Layout'],
  Delhi: ['Connaught Place', 'Rohini', 'Dwarka', 'Karol Bagh', 'Noida Sector 62'],
  Chennai: ['T Nagar', 'Velachery', 'OMR', 'Adyar', 'Anna Nagar'],
}

const DISRUPTION_TYPES = [
  { v: 'HEAVY_RAIN', label: 'Heavy Rain' },
  { v: 'FLOOD', label: 'Flood' },
  { v: 'EXTREME_HEAT', label: 'Extreme Heat' },
  { v: 'HIGH_AQI', label: 'High AQI' },
  { v: 'CURFEW', label: 'Curfew' },
  { v: 'PLATFORM_OUTAGE', label: 'Platform Outage' },
]

const COLORS = {
  HEAVY_RAIN: '#3B82F6',
  EXTREME_HEAT: '#FB923C',
  HIGH_AQI: '#A855F7',
  FLOOD: '#22D3EE',
  PLATFORM_OUTAGE: '#9CA3AF',
  CURFEW: '#64748B',
}

export default function AdminDashboard() {
  const { showError, showSuccess } = useToast()
  const [dash, setDash] = useState(null)
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('Hyderabad')
  const [zone, setZone] = useState(ZONE_OPTIONS.Hyderabad[0])
  const [disruptionType, setDisruptionType] = useState('HEAVY_RAIN')
  const [severity, setSeverity] = useState('HIGH')
  const [triggering, setTriggering] = useState(false)
  const [lastAffected, setLastAffected] = useState([])
  const [claimFilter, setClaimFilter] = useState('ALL')

  useEffect(() => {
    setZone(ZONE_OPTIONS[city]?.[0] || '')
  }, [city])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [d, c] = await Promise.all([api.dashboard.getAdminDashboard(), api.claims.getAllClaims()])
      setDash(d)
      setClaims(c)
    } catch (e) {
      showError(e.response?.data?.error || e.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pieData = useMemo(() => {
    return (dash?.claimsByType || []).map((x) => ({
      name: x.type.replace(/_/g, ' '),
      value: x.count,
      type: x.type,
    }))
  }, [dash])

  const lineData = dash?.dailyClaimsTrend || []

  const lossRatio = Number(dash?.lossRatio ?? 0)
  const lossColor = lossRatio < 50 ? 'text-[#43A047]' : lossRatio <= 80 ? 'text-[#FB8C00]' : 'text-[#E53935]'

  const filteredClaims = useMemo(() => {
    if (claimFilter === 'ALL') return claims
    return claims.filter((c) => c.status === claimFilter)
  }, [claims, claimFilter])

  const trigger = async () => {
    setTriggering(true)
    setLastAffected([])
    try {
      const res = await api.disruptions.mockTrigger({
        disruptionType,
        city,
        zone,
        severity,
      })
      showSuccess('Mock disruption triggered — auto-claims created for active policies in zone.')
      setLastAffected(res.affectedWorkers || [])
      await loadAll()
    } catch (e) {
      showError(e.response?.data?.error || e.message || 'Trigger failed')
    } finally {
      setTriggering(false)
    }
  }

  const approve = async (id) => {
    try {
      await api.claims.processClaim(id, 'APPROVE')
      showSuccess('Claim approved & payout initiated')
      await loadAll()
    } catch (e) {
      showError(e.response?.data?.error || e.message || 'Action failed')
    }
  }

  const reject = async (id) => {
    try {
      await api.claims.processClaim(id, 'REJECT', 'Rejected from admin console')
      showSuccess('Claim rejected')
      await loadAll()
    } catch (e) {
      showError(e.response?.data?.error || e.message || 'Action failed')
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar variant="admin" />
      <main className="flex-1 space-y-10 overflow-auto p-6 lg:p-10">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Admin Dashboard</h1>
          <p className="text-sm text-[#6B7280]">Operations, risk, and demo controls</p>
        </div>

        {loading && !dash ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Stat label="Total Workers" value={dash?.totalWorkers} />
              <Stat label="Active Policies" value={dash?.totalActivePolicies} />
              <Stat label="Premiums Collected" value={formatInr(dash?.totalPremiumsCollected)} />
              <Stat label="Payouts Made" value={formatInr(dash?.totalPayoutsProcessed)} />
              <Stat label="Claims This Week" value={dash?.totalClaimsThisWeek} />
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
                <p className="text-xs font-medium text-[#6B7280]">Loss Ratio %</p>
                <p className={`text-2xl font-bold ${lossColor}`}>{lossRatio.toFixed(2)}%</p>
              </div>
            </div>

            <section className="rounded-2xl border-2 border-[#E53935] bg-white p-6 shadow-md">
              <h2 className="text-lg font-bold text-[#E53935]">🚨 Trigger Mock Disruption (Demo)</h2>
              <p className="mt-1 text-sm text-[#6B7280]">
                Auto-claims will be created for all active workers in this zone with an active policy.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <select
                  className="rounded-xl border border-gray-200 px-3 py-2"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {Object.keys(ZONE_OPTIONS).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-gray-200 px-3 py-2"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                >
                  {(ZONE_OPTIONS[city] || []).map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-gray-200 px-3 py-2"
                  value={disruptionType}
                  onChange={(e) => setDisruptionType(e.target.value)}
                >
                  {DISRUPTION_TYPES.map((d) => (
                    <option key={d.v} value={d.v}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-xl border border-gray-200 px-3 py-2"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                >
                  {['LOW', 'MEDIUM', 'HIGH', 'EXTREME'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={triggering}
                onClick={trigger}
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#E53935] px-8 py-3 font-bold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {triggering ? <Spinner className="h-5 w-5 border-white border-t-transparent" /> : null}
                Trigger Now
              </button>
              {lastAffected.length > 0 && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                  <p className="font-semibold text-[#1A1A1A]">Workers affected</p>
                  <ul className="mt-2 list-inside list-disc text-[#6B7280]">
                    {lastAffected.map((w) => (
                      <li key={w.userId}>
                        {w.name} ({w.zone}) — claim #{w.claimId} · {w.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#1A1A1A]">Predictive Analytics</h3>
                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-[#6B7280]">
                  Coming Soon
                </span>
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">Forecasting loss ratios and zone-level exposure.</p>
            </section>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
                <h3 className="mb-2 font-semibold text-[#1A1A1A]">Claims by disruption type</h3>
                <div className="h-72">
                  {pieData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                          {pieData.map((e) => (
                            <Cell key={e.type} fill={COLORS[e.type] || '#94A3B8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="flex h-full items-center justify-center text-sm text-[#6B7280]">No claims this week</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
                <h3 className="mb-2 font-semibold text-[#1A1A1A]">Daily claims (this week)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#E53935" strokeWidth={2} dot />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#1A1A1A]">Claims management</h3>
                <select
                  className="rounded-lg border border-gray-200 px-3 py-1 text-sm"
                  value={claimFilter}
                  onChange={(e) => setClaimFilter(e.target.value)}
                >
                  <option value="ALL">All</option>
                  <option value="FRAUD_CHECK">Fraud Check</option>
                  <option value="PAID">Paid</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-[#6B7280]">
                    <tr>
                      <th className="px-3 py-2">Worker</th>
                      <th className="px-3 py-2">Zone</th>
                      <th className="px-3 py-2">Disruption</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Fraud</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-50 ${c.status === 'FRAUD_CHECK' ? 'bg-orange-50' : ''}`}
                      >
                        <td className="px-3 py-2">{c.workerName}</td>
                        <td className="px-3 py-2">{c.zone}</td>
                        <td className="px-3 py-2">{c.disruptionType?.replace(/_/g, ' ')}</td>
                        <td className="px-3 py-2">{formatInr(c.claimedAmount)}</td>
                        <td className="px-3 py-2">{c.fraudScore != null ? Number(c.fraudScore).toFixed(2) : '—'}</td>
                        <td className="px-3 py-2">{c.status}</td>
                        <td className="px-3 py-2">
                          {c.status === 'FRAUD_CHECK' ? (
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => approve(c.id)}
                                className="rounded-lg bg-[#43A047] px-2 py-1 text-xs font-semibold text-white"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => reject(c.id)}
                                className="rounded-lg bg-[#E53935] px-2 py-1 text-xs font-semibold text-white"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h3 className="mb-4 text-lg font-bold text-[#1A1A1A]">Zone risk</h3>
              <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-[#6B7280]">
                    <tr>
                      <th className="px-3 py-2">Zone</th>
                      <th className="px-3 py-2">Workers</th>
                      <th className="px-3 py-2">Avg Risk</th>
                      <th className="px-3 py-2">Claims</th>
                      <th className="px-3 py-2">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dash?.zoneWiseRiskData || []).map((z) => (
                      <tr key={`${z.city}-${z.zone}`} className="border-b border-gray-50">
                        <td className="px-3 py-2">
                          {z.zone} <span className="text-xs text-[#6B7280]">({z.city})</span>
                        </td>
                        <td className="px-3 py-2">{z.workersCovered}</td>
                        <td className="px-3 py-2">{z.avgRiskScore}</td>
                        <td className="px-3 py-2">{z.claimsCount}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                              z.riskLevel === 'HIGH'
                                ? 'bg-red-100 text-red-800'
                                : z.riskLevel === 'MEDIUM'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {z.riskLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-md">
      <p className="text-xs font-medium text-[#6B7280]">{label}</p>
      <p className="text-xl font-bold text-[#1A1A1A]">{value ?? '—'}</p>
    </div>
  )
}
