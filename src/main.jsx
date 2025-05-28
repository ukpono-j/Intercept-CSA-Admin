import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import colors from './utils/colors';
import 'react-toastify/dist/ReactToastify.css';

colors.applyTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);