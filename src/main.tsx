import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

// Initialize MSW in development
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')
  
  try {
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js',
        options: {
          scope: '/',
        },
      },
    })
    console.log('✅ MSW worker started successfully')
  } catch (error) {
    console.warn('⚠️ MSW worker failed to start:', error)
    console.warn('⚠️ Continuing without MSW - API calls will fail unless backend is running')
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})

