export default function DisruptionAlertBanner({ message }) {
  if (!message) return null
  return (
    <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#B71C1C]">
      <span className="text-lg">⚠️</span>
      {message}
    </div>
  )
}
