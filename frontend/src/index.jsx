import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './index.css';

// Configure axios to include auth token in all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Add a global error handler to help debug resource loading issues
window.addEventListener('error', function(e) {
  console.log('Resource error:', e.target.src || e.target.href);
}, true);

// Log the base URL to confirm we're loading from the right place
console.log('Base URL:', window.location.origin);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 