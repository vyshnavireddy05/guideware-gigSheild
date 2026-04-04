import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold text-[#1A1A1A]">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E53935] text-2xl text-white">
                🛡
              </span>
              GigShield
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight text-[#1A1A1A] md:text-5xl">
              Your income. Protected. Always.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-[#6B7280]">
              AI-powered income protection for Zomato &amp; Swiggy delivery partners. Get covered against rain, floods
              &amp; disruptions.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="rounded-full bg-[#E53935] px-6 py-3 font-semibold text-white shadow-md hover:bg-red-600"
              >
                Get Protected →
              </Link>
              <a
                href="#how"
                className="rounded-full border-2 border-[#E53935] px-6 py-3 font-semibold text-[#E53935] hover:bg-red-50"
              >
                Learn How It Works
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
              <p className="text-sm font-medium text-[#E53935]">Live alert</p>
              <p className="mt-2 text-lg font-bold text-[#1A1A1A]">Heavy Rain Detected in Banjara Hills</p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#43A047] text-white">✓</span>
                <div>
                  <p className="font-semibold text-[#43A047]">₹640 credited to your UPI instantly</p>
                  <p className="text-xs text-[#6B7280]">Parametric payout · No forms</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            { icon: '⚡', title: 'Instant Payouts', text: 'No claims to file — we detect disruptions and pay automatically.' },
            { icon: '🛡️', title: 'AI Protection', text: 'Smart risk assessment tuned for your zone and season.' },
            { icon: '💰', title: '₹30/week', text: 'Starts at just ₹30 per week with transparent caps.' },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
              <span className="text-3xl">{c.icon}</span>
              <h3 className="mt-3 font-bold text-[#1A1A1A]">{c.title}</h3>
              <p className="mt-2 text-sm text-[#6B7280]">{c.text}</p>
            </div>
          ))}
        </section>

        <section id="how" className="mt-24">
          <h2 className="text-center text-2xl font-bold text-[#1A1A1A]">How it works</h2>
          <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Register', icon: '📝' },
              { step: '2', title: 'Get Covered', icon: '📋' },
              { step: '3', title: 'Disruption Detected', icon: '🌧️' },
              { step: '4', title: 'Get Paid', icon: '💸' },
            ].map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < 3 && (
                  <div className="absolute left-[60%] top-8 hidden h-0.5 w-[80%] bg-gray-200 md:block" aria-hidden />
                )}
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E53935] bg-white text-2xl font-bold text-[#E53935]">
                  {s.icon}
                </div>
                <p className="mt-3 text-xs font-semibold text-[#E53935]">Step {s.step}</p>
                <p className="font-semibold text-[#1A1A1A]">{s.title}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
