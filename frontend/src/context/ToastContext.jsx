import { createContext, useCallback, useContext, useState } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showError = useCallback((message) => {
    setToast({ type: 'error', message })
    setTimeout(() => setToast(null), 5000)
  }, [])

  const showSuccess = useCallback((message) => {
    setToast({ type: 'success', message })
    setTimeout(() => setToast(null), 4000)
  }, [])

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] max-w-md rounded-xl px-4 py-3 shadow-lg ${
            toast.type === 'error' ? 'bg-[#E53935] text-white' : 'bg-[#43A047] text-white'
          }`}
          role="alert"
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast outside ToastProvider')
  return ctx
}
