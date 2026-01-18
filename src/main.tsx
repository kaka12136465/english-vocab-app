import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <meta name="mobile-web-app-capable" content="yes"></meta>
    <App />
  </React.StrictMode>,
)
