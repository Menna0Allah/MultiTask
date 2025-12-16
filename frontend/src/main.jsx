import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import OnboardingProvider from './components/onboarding/OnboardingProvider'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </AuthProvider>
  </BrowserRouter>,
)