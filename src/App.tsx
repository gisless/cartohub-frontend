import './App.css'
import { HashRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
import { Map } from './pages/Map'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

function App(): React.ReactNode {

  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/maps/:map_id" element={<Map />} />
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App
