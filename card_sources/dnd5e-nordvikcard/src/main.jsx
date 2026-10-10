import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

if (import.meta.env.DEV) {
  const { ApiMock } = await import('../ApiMock.js')
  // In the game the sheet's styles come from the addon's shared.css (character template).
  await import('../../../addon_files/Resources/shared.css')
  root.render(<StrictMode><App Api={ApiMock} /></StrictMode>)
} else {
  window.addEventListener('cardapi:ready', () => {
    const api = window.CardAPI
    root.render(<StrictMode><App Api={api} additionalArguments={api.additionalArguments} /></StrictMode>)
  }, { once: true })
}
