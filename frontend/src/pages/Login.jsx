import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useToast } from '../context/ToastContext.jsx'
import Spinner from '../components/Spinner.jsx'

export default function Login() {
  const { login } = useAuth()
  const { showError } = useToast()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [asAdmin, setAsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(phone, password, { asAdmin })
    } catch (err) {
      showError(err.response?.data?.error || err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-md">
        <div className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#E53935] text-3xl text-white">
            🛡
          </span>
          <h1 className="mt-4 text-2xl font-bold text-[#1A1A1A]">GigShield</h1>
          <p className="text-sm text-[#6B7280]">Sign in to your account</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            required
            type="password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E53935] py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? <Spinner className="h-5 w-5 border-white border-t-transparent" /> : null}
            {asAdmin ? 'Login as Admin' : 'Login as Worker'}
          </button>

          <button
            type="button"
            onClick={() => setAsAdmin((a) => !a)}
            className="w-full text-center text-sm font-medium text-[#E53935] hover:underline"
          >
            {asAdmin ? 'Switch to worker login' : 'Login as Admin'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6B7280]">
          New to GigShield?{' '}
          <Link to="/register" className="font-semibold text-[#E53935]">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}
