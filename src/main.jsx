import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import './index.css';

// تسجيل Service Worker للعمل دون اتصال مع تحديث تلقائي
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter: يعمل على GitHub Pages ودون اتصال بلا إعدادات خادم */}
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </React.StrictMode>
);
