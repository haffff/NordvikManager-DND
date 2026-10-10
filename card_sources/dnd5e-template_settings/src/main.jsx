import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

if (import.meta.env.DEV) {
  const { ApiMock } = await import('../ApiMock.js')
  // In the game this card's styles come from the addon's shared.css (settings_card view).
  await import('../../../addon_files/Resources/shared.css')
  root.render(
    <StrictMode>
      <App Api={ApiMock} />
    </StrictMode>
  )
} else {
  window.addEventListener('cardapi:ready', () => {
    root.render(
      <StrictMode>
        <App Api={window.CardAPI} additionalArguments={window.CardAPI.additionalArguments} />
      </StrictMode>
    )
  }, { once: true })
}
