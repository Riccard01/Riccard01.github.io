import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const redirect = sessionStorage.redirect;
if (redirect) {
  delete sessionStorage.redirect;
  history.replaceState(null, null, redirect);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Riccard01.github.io">
      <App />
    </BrowserRouter>
  </StrictMode>,
)
