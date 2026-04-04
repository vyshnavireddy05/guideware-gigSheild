import { formatDate, formatInr } from '../utils/format.js'

export default function PolicyCard({ policy }) {
  if (!policy?.id) {
    return (
      <div className="rounded-2xl border-l-4 border-[#FB8C00] bg-white p-6 shadow-md">
        <p className="font-semibold text-[#1A1A1A]">You&apos;re not covered this week</p>
        <p className="mt-1 text-sm text-[#6B7280]">Purchase a policy to unlock instant parametric payouts.</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border-l-4 border-[#E53935] bg-white p-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-bold text-[#1A1A1A]">Active policy #{policy.id}</h3>
        <span className="rounded-full bg-[#43A047] px-3 py-1 text-xs font-semibold text-white">
          {policy.status}
        </span>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <p className="text-[#6B7280]">Premium paid</p>
          <p className="font-semibold text-[#1A1A1A]">{formatInr(policy.weeklyPremium)}</p>
        </div>
        <div>
          <p className="text-[#6B7280]">Coverage</p>
          <p className="font-semibold text-[#1A1A1A]">{formatInr(policy.maxCoverageAmount)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-[#6B7280]">Valid</p>
          <p className="font-semibold text-[#1A1A1A]">
            {formatDate(policy.weekStartDate)} → {formatDate(policy.weekEndDate)}
          </p>
        </div>
      </div>
    </div>
  )
}
