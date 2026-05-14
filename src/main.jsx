import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Buffer } from 'buffer'
import './style.css'
import App from './App.jsx'
// import { Buffer } from 'buffer';

// Ensure Buffer is globally available
window.Buffer = Buffer;

console.log(
  "%cDeveloped by Vedant Purkar | vedant.purkar05@gmail.com",
  "font-weight: bold;"
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
