import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// Configure axios globally for Sanctum + cross-site cookies
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://dialiease-backend-1.onrender.com'
axios.defaults.withCredentials = true // <-- very important for cookies

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
