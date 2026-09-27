import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

if (import.meta.env.DEV) {
  const { ApiMock } = await import('../ApiMock.js')
  root.render(<StrictMode><App Api={ApiMock} /></StrictMode>)
} else {
  window.addEventListener('cardapi:ready', () => {
    const api = window.CardAPI
    root.render(<StrictMode><App Api={api} additionalArguments={api.additionalArguments} /></StrictMode>)
  }, { once: true })
}
