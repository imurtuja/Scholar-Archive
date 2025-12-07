import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './light-theme.css'
import App from './App.jsx'

// Apply saved theme on page load
const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme');
  document.documentElement.classList.remove('dark-theme');
} else {
  document.documentElement.classList.add('dark-theme');
  document.documentElement.classList.remove('light-theme');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
