export function formatInr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '₹0.00'
  const n = Number(amount)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(isoOrStr) {
  if (!isoOrStr) return '—'
  const d = new Date(isoOrStr.includes('T') ? isoOrStr : `${isoOrStr}T00:00:00`)
  if (Number.isNaN(d.getTime())) return isoOrStr
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

export function greetingName(name) {
  const h = new Date().getHours()
  const g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  return `${g}, ${name?.split(' ')[0] || 'Partner'}`
}
