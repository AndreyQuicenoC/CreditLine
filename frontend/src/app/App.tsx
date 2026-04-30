import { BrowserRouter } from 'react-router'
import { useAuth } from './context/AuthContext'
import Routes from './routes'
import { Toaster } from 'sonner'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EEF2FF]">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#64748B]">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes />
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}
