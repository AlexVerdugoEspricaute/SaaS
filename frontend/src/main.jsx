import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline, GlobalStyles } from '@mui/material'
import theme from './theme'
import LandingPage from './LandingPage'
import Login from './Login'
import Dashboard from './Dashboard'
import Upload from './Upload'

// Font imports for Inter
const globalStyles = (
  <GlobalStyles styles={{
    '@import': [
      'url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap")'
    ],
    '*': {
      margin: 0,
      padding: 0,
      boxSizing: 'border-box'
    },
    html: {
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    },
    body: {
      background: '#f8fafc',
      fontFamily: theme.typography.fontFamily
    },
    '#root': {
      minHeight: '100vh'
    }
  }} />
)

function App(){
  const [token, setToken] = React.useState(() => localStorage.getItem('token'))

  function handleLogin(t) {
    setToken(t)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <BrowserRouter>
        <Routes>
          {/* Landing page como página principal */}
          <Route path="/" element={!token ? <LandingPage /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!token ? <Login onLogin={handleLogin}/> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={token ? <Dashboard onLogout={handleLogout}/> : <Navigate to="/login" />} />
          <Route path="/upload" element={token ? <Upload/> : <Navigate to="/login" />} />
          {/* Redirect any unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(<App />)
