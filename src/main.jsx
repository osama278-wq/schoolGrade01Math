import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { initI18n } from './i18n/index.js';
import { LangRoot } from './i18n/LangToggle.jsx';
import './index.css';

// تسجيل Service Worker للعمل دون اتصال مع تحديث تلقائي
registerSW({ immediate: true });

// Arabic ⇄ English: apply saved language (dir/lang/title) before first render
initI18n();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter: يعمل على GitHub Pages ودون اتصال بلا إعدادات خادم */}
    <HashRouter>
      <AppProvider>
        <LangRoot>
          <App />
        </LangRoot>
      </AppProvider>
    </HashRouter>
  </React.StrictMode>
);
