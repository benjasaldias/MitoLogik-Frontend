import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './common/index.css'
import { BrowserRouter } from 'react-router-dom';
import App from './common/App.jsx'
import { Authentication } from './pages/Authentication';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Authentication> 
        <App />
      </Authentication>
    </BrowserRouter>
  </StrictMode>,
)
