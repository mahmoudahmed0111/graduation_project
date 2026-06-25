import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { ThemeProvider } from './providers/ThemeProvider'

/**
 * Collapse duplicate slashes in the URL path before React Router reads it.
 * Some backend emails build links by joining a base that ends in `/` with a
 * path that starts with `/` — e.g. `https://host//resetPassword/<token>`. The
 * leading `//` matches no route and the catch-all bounces the user to home.
 * Normalizing here (before <BrowserRouter> mounts) makes such links resolve.
 */
function normalizePathSlashes() {
  const { pathname, search, hash } = window.location
  if (/\/{2,}/.test(pathname)) {
    const fixed = pathname.replace(/\/{2,}/g, '/')
    window.history.replaceState(null, '', fixed + search + hash)
  }
}
normalizePathSlashes()

// MSW only when VITE_USE_MSW=true (default: use real backend at VITE_API_URL)
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }
  if (import.meta.env.VITE_USE_MSW !== 'true') {
    return
  }

  const { worker } = await import('./mocks/browser')
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: { scope: '/' },
      },
    })
    console.log('✅ MSW worker started successfully (mocking enabled)')
  } catch (error) {
    console.warn('⚠️ MSW worker failed to start:', error)
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </ThemeProvider>
    </React.StrictMode>,
  )
})

