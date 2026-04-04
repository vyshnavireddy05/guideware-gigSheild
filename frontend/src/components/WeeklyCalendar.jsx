import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function WeeklyCalendar({ data }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <h3 className="text-lg font-semibold text-[#1A1A1A]">Weekly activity</h3>
      <p className="text-sm text-[#6B7280]">Earnings protected (₹)</p>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #eee' }}
              formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Protected']}
            />
            <Bar dataKey="amount" fill="#E53935" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-center text-xs text-[#6B7280]">{DAYS.join(' · ')}</p>
    </div>
  )
}
