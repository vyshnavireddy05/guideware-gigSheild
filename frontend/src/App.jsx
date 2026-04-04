import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import WorkerDashboard from './pages/WorkerDashboard.jsx'
import PolicyPage from './pages/PolicyPage.jsx'
import ClaimsPage from './pages/ClaimsPage.jsx'
import PayoutsPage from './pages/PayoutsPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function RequireAuth({ children, adminOnly }) {
  const { token, user } = useAuth()
  if (!token || !user) {
    return <Navigate to="/login" replace />
  }
  if (adminOnly && user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }
  if (!adminOnly && user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <WorkerDashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/policy"
        element={
          <RequireAuth>
            <PolicyPage />
          </RequireAuth>
        }
      />
      <Route
        path="/claims"
        element={
          <RequireAuth>
            <ClaimsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/payouts"
        element={
          <RequireAuth>
            <PayoutsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAuth adminOnly>
            <AdminDashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
