import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import PremiumQuoteBox from '../components/PremiumQuoteBox.jsx'
import Spinner from '../components/Spinner.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import * as api from '../services/api.js'
import { formatDate, formatInr } from '../utils/format.js'

export default function PolicyPage() {
  const { user } = useAuth()
  const { showError, showSuccess } = useToast()
  const [quote, setQuote] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const [q, h] = await Promise.all([api.policy.getQuote(user.id), api.policy.getHistory(user.id)])
        if (alive) {
          setQuote(q)
          setHistory(h)
        }
      } catch (e) {
        showError(e.response?.data?.error || e.message || 'Failed to load policy')
      } finally {
        if (alive) setLoading(false)
      }
    }
    if (user?.id) load()
    return () => {
      alive = false
    }
  }, [user?.id, showError])

  const purchase = async () => {
    setBuying(true)
    try {
      await api.policy.purchase(user.id)
      showSuccess('Policy purchased — you are covered this week!')
      const [q, h] = await Promise.all([api.policy.getQuote(user.id), api.policy.getHistory(user.id)])
      setQuote(q)
      setHistory(h)
    } catch (e) {
      showError(e.response?.data?.error || e.message || 'Purchase failed')
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <main className="flex-1 space-y-10 overflow-auto p-6 lg:p-10">
        <div>
          <Link to="/dashboard" className="text-sm font-medium text-[#E53935] hover:underline">
            ← Dashboard
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-[#1A1A1A]">My Policy</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <>
            <PremiumQuoteBox quote={quote} />
            <button
              type="button"
              disabled={buying}
              onClick={purchase}
              className="flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-[#E53935] py-4 text-lg font-bold text-white shadow-md hover:bg-red-600 disabled:opacity-60 sm:w-auto sm:px-12"
            >
              {buying ? <Spinner className="h-6 w-6 border-white border-t-transparent" /> : null}
              Pay {formatInr(quote?.weeklyPremium)} &amp; Get Covered Now
            </button>
            <p className="text-xs text-[#6B7280]">Powered by mock UPI payment</p>

            <section>
              <h2 className="text-lg font-bold text-[#1A1A1A]">Policy history</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 shadow-md">
                <table className="w-full min-w-[600px] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-[#6B7280]">
                    <tr>
                      <th className="px-4 py-3">Week</th>
                      <th className="px-4 py-3">Premium</th>
                      <th className="px-4 py-3">Coverage</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Payment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((p) => (
                      <tr key={p.id} className="border-b border-gray-50">
                        <td className="px-4 py-3">
                          {formatDate(p.weekStartDate)} — {formatDate(p.weekEndDate)}
                        </td>
                        <td className="px-4 py-3">{formatInr(p.weeklyPremium)}</td>
                        <td className="px-4 py-3">{formatInr(p.maxCoverageAmount)}</td>
                        <td className="px-4 py-3">{p.status}</td>
                        <td className="px-4 py-3">{p.paymentStatus}</td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[#6B7280]">
                          No past policies
                        </td>
                      </tr>
                    )}
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
