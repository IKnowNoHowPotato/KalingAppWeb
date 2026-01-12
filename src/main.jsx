import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

// Migrate old localStorage key `registrations` -> `users` if needed
try {
  const old = localStorage.getItem('registrations')
  const current = localStorage.getItem('users')
  if (old && !current) {
    localStorage.setItem('users', old)
    localStorage.removeItem('registrations')
    console.info('Migrated localStorage key registrations -> users')
  }
} catch (err) {
  console.warn('LocalStorage migration skipped', err)
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
