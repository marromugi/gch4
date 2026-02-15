import './index.css'

import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApiClientProvider } from './lib/api'
import { AuthProvider } from './lib/auth'
import { ThemeProvider } from './lib/theme'
import { router } from './router'

const AUTH_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="system">
        <ApiClientProvider>
          <AuthProvider config={{ baseURL: AUTH_BASE_URL }} callbackURL={APP_URL}>
            <RouterProvider router={router} />
          </AuthProvider>
        </ApiClientProvider>
      </ThemeProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
