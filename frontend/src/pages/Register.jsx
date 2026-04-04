import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Spinner from '../components/Spinner.jsx'
import { formatInr } from '../utils/format.js'

const ZONES = {
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

const CITIES = Object.keys(ZONES)

export default function Register() {
  const { register } = useAuth()
  const { showError } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    platform: 'ZOMATO',
    city: 'Hyderabad',
    zone: ZONES.Hyderabad[0],
    avgWeeklyIncome: 5000,
    upiId: '',
    aadhaarNumber: '',
  })

  const zones = ZONES[form.city] || []

  useEffect(() => {
    if (zones.length) setForm((f) => ({ ...f, zone: zones[0] }))
  }, [form.city])

  const preview = useMemo(() => {
    const base = 30
    const zoneM =
      form.zone && ['LB Nagar', 'Dilsukhnagar'].includes(form.zone) ? 1.6 : form.zone === 'Madhapur' ? 1.0 : 1.3
    const m = new Date().getMonth() + 1
    const sM = m >= 6 && m <= 9 ? 1.4 : m >= 3 && m <= 5 ? 1.2 : 1
    const raw = base * zoneM * sM
    const prem = Math.min(120, Math.max(30, raw))
    const cov = form.avgWeeklyIncome * 0.7
    return { prem, cov }
  }, [form.zone, form.avgWeeklyIncome])

  const submit = async (e) => {
    e.preventDefault()
    if (step < 3) return
    setLoading(true)
    try {
      await register({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        platform: form.platform,
        city: form.city,
        zone: form.zone,
        avgWeeklyIncome: form.avgWeeklyIncome,
        upiId: form.upiId,
        aadhaarNumber: form.aadhaarNumber,
        latitude: null,
        longitude: null,
      })
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-[#E53935] to-red-800 p-10 text-white lg:flex">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span className="text-3xl">🛡</span> GigShield
            </div>
            <ul className="mt-10 space-y-4 text-sm opacity-95">
              <li>✓ Parametric triggers: rain, heat, AQI, outages</li>
              <li>✓ Fraud-aware routing with instant UPI rails (mock)</li>
              <li>✓ Weekly micro-premiums from ₹30</li>
            </ul>
          </div>
          <p className="text-lg font-semibold">Join 10,000+ delivery partners</p>
        </div>

        <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
          <div className="mx-auto w-full max-w-lg">
            <div className="mb-6 flex gap-2 text-xs font-medium text-[#6B7280]">
              {['Personal Info', 'Work Details', 'Payment & KYC'].map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStep(i + 1)}
                  className={`flex-1 rounded-lg border px-2 py-2 ${
                    step === i + 1 ? 'border-[#E53935] bg-red-50 text-[#E53935]' : 'border-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mb-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm">
              <p className="font-semibold text-[#1A1A1A]">Estimated weekly premium: {formatInr(preview.prem)}</p>
              <p className="text-[#6B7280]">Coverage up to: {formatInr(preview.cov)}</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-[#1A1A1A]">Personal Info</h2>
                  <input
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input
                    required
                    pattern="\d{10}"
                    maxLength={10}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="Phone (10 digits)"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  />
                  <input
                    type="email"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="Email (optional)"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <input
                    required
                    type="password"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-[#1A1A1A]">Work Details</h2>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  >
                    <option value="ZOMATO">Zomato 🔴</option>
                    <option value="SWIGGY">Swiggy 🟠</option>
                  </select>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  >
                    {zones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                  <div>
                    <label className="text-sm text-[#6B7280]">Average Weekly Earnings (₹1000–₹15000)</label>
                    <input
                      required
                      type="number"
                      min={1000}
                      max={15000}
                      className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3"
                      value={form.avgWeeklyIncome}
                      onChange={(e) => setForm({ ...form, avgWeeklyIncome: Number(e.target.value) })}
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="font-bold text-[#1A1A1A]">Payment &amp; KYC</h2>
                  <input
                    required
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="UPI ID (e.g. name@upi)"
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                  />
                  <input
                    required
                    pattern="\d{4}"
                    maxLength={4}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3"
                    placeholder="Aadhaar last 4 digits"
                    value={form.aadhaarNumber}
                    onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                  />
                  <p className="text-xs text-[#6B7280]">Phase 3: GPS capture stub — not collected on this form.</p>
                </div>
              )}

              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-[#6B7280]"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="flex-1 rounded-xl bg-[#E53935] py-3 font-semibold text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#E53935] py-3 font-semibold text-white disabled:opacity-60"
                  >
                    {loading ? <Spinner className="h-5 w-5 border-white border-t-transparent" /> : null}
                    Get Protected Now
                  </button>
                )}
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-[#6B7280]">
              Already registered?{' '}
              <Link className="font-semibold text-[#E53935]" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
