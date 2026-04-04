export default function Spinner({ className = '' }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-[#E53935] border-t-transparent ${className}`}
      aria-label="Loading"
    />
  )
}
