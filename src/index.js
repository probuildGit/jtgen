// CACHE BUST: 2025-09-30T07:30:00Z - Using App.local.js directly
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.local.js';
import reportWebVitals from './reportWebVitals';

// Force cache bust
console.log('🏠 LOCAL APP: Loading App.local.js directly - Cache bust timestamp:', new Date().toISOString());

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
