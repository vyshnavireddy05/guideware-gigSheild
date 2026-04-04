import { formatDate, formatInr } from '../utils/format.js'

const statusStyles = {
  PAID: 'bg-[#43A047] text-white',
  APPROVED: 'bg-blue-600 text-white',
  FRAUD_CHECK: 'bg-[#FB8C00] text-white',
  REJECTED: 'bg-[#E53935] text-white',
  AUTO_INITIATED: 'bg-gray-400 text-white',
}

export default function ClaimCard({ claim, expanded, onToggle, onView }) {
  const st = claim.status || 'AUTO_INITIATED'
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-md">
      <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌧️</span>
          <div>
            <p className="font-semibold text-[#1A1A1A]">{claim.disruptionType?.replace(/_/g, ' ')}</p>
            <p className="text-sm text-[#6B7280]">{formatDate(claim.createdAt)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-[#6B7280]">Hours</p>
            <p className="font-medium">{claim.disruptionHours ?? '—'}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">Claimed</p>
            <p className="font-medium">{formatInr(claim.claimedAmount)}</p>
          </div>
          <div>
            <p className="text-[#6B7280]">Approved</p>
            <p className="font-medium">{formatInr(claim.approvedAmount)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[st] || statusStyles.AUTO_INITIATED}`}>
            {st.replace(/_/g, ' ')}
          </span>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-[#E53935] hover:bg-red-50"
          >
            {expanded ? 'Hide' : 'View Details'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 text-sm">
          <p className="text-[#6B7280]">
            Severity: <span className="text-[#1A1A1A]">{claim.disruptionSeverity}</span> · Started:{' '}
            {claim.disruptionStartedAt ? formatDate(claim.disruptionStartedAt) : '—'}
          </p>
          <div className="mt-3">
            <p className="text-xs font-medium text-[#6B7280]">Fraud score</p>
            <FraudBar score={Number(claim.fraudScore ?? 0)} />
          </div>
          {claim.payoutTransactionId && (
            <p className="mt-2 text-xs text-[#43A047]">Txn: {claim.payoutTransactionId}</p>
          )}
          {onView && (
            <button type="button" onClick={onView} className="mt-2 text-[#E53935] underline">
              Open
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FraudBar({ score }) {
  const pct = Math.min(100, Math.max(0, score * 100))
  let label = `Low Risk (${score.toFixed(2)})`
  let fill = '#43A047'
  if (score >= 0.7) {
    label = `High Risk (${score.toFixed(2)})`
    fill = '#E53935'
  } else if (score >= 0.4) {
    label = `Under Review (${score.toFixed(2)})`
    fill = '#FB8C00'
  }
  return (
    <>
      <svg viewBox="0 0 100 6" className="mt-1 h-2 w-full" preserveAspectRatio="none" aria-hidden>
        <rect width="100" height="6" fill="#E5E7EB" rx="3" />
        <rect width={pct} height="6" fill={fill} rx="3" />
      </svg>
      <p className="mt-1 text-xs text-[#6B7280]">{label}</p>
    </>
  )
}
