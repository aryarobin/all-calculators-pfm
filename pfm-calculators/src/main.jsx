import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './lib/analytics'

const LearnPage = lazy(() => import('./components/LearnPage.jsx'))

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/learn" element={<Suspense fallback={null}><LearnPage /></Suspense>} />
          <Route path="/learn/:guideSlug" element={<Suspense fallback={null}><LearnPage /></Suspense>} />
          <Route path="/:slug" element={<App />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
