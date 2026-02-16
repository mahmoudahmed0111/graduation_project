import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

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
      <App />
    </React.StrictMode>,
  )
})

