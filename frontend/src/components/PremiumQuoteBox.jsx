import { formatDate, formatInr } from '../utils/format.js'

export default function PremiumQuoteBox({ quote }) {
  if (!quote) return null
  const risk = quote.riskLevel || 'MEDIUM'
  const riskColor =
    risk === 'HIGH' ? 'bg-red-100 text-red-800' : risk === 'MEDIUM' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      <h2 className="text-xl font-bold text-[#1A1A1A]">Your Coverage for This Week</h2>
      <p className="mt-1 text-sm text-[#6B7280]">
        {formatDate(quote.weekStartDate)} — {formatDate(quote.weekEndDate)}
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="text-[#1A1A1A]">
            <tr className="border-b border-gray-100">
              <td className="py-2 text-[#6B7280]">Base Premium</td>
              <td className="py-2 text-right font-medium">{formatInr(quote.basePremium ?? 30)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-[#6B7280]">
                Zone Risk ({risk} ×{quote.zoneMultiplier})
              </td>
              <td className="py-2 text-right font-medium">{formatInr(quote.zoneRiskAddon ?? 0)}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-2 text-[#6B7280]">
                Season Factor (×{quote.seasonMultiplier})
              </td>
              <td className="py-2 text-right font-medium">{formatInr(quote.seasonFactorAddon ?? 0)}</td>
            </tr>
            <tr>
              <td className="py-3 font-bold">Your Weekly Premium</td>
              <td className="py-3 text-right font-bold text-[#E53935]">{formatInr(quote.weeklyPremium)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        <p>
          <span className="text-[#6B7280]">Max Coverage Amount:</span>{' '}
          <span className="font-semibold">{formatInr(quote.maxCoverageAmount)}</span>
        </p>
        <p>
          <span className="text-[#6B7280]">Coverage Hours:</span>{' '}
          <span className="font-semibold">{quote.coverageHours} hrs/week</span>
        </p>
        <p>
          <span className="text-[#6B7280]">Hourly Rate Covered:</span>{' '}
          <span className="font-semibold">{formatInr(quote.hourlyRateCovered)}</span>/hr
        </p>
        <p className="flex items-center gap-2">
          <span className="text-[#6B7280]">Risk Level:</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${riskColor}`}>{risk}</span>
        </p>
      </div>

      {quote.zoneFactors?.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#6B7280]">Zone factors</p>
          <ul className="mt-1 list-inside list-disc text-sm text-[#1A1A1A]">
            {quote.zoneFactors.map((z) => (
              <li key={z}>{z}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <p className="text-xs font-medium text-[#6B7280]">Parametric triggers covered</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['🌧️ Heavy Rain', '🌊 Floods', '🔥 Extreme Heat', '😷 High AQI', '📵 Platform Outage'].map((t) => (
            <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-[#1A1A1A]">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
