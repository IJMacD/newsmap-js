import React from 'react';
import { createRoot } from 'react-dom/client';

import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';
import 'core-js/fn/object/entries';
import 'core-js/fn/string/pad-start';

import ErrorHandler from './Components/ErrorHandler.jsx';
import App from './Components/App.jsx';
import './index.css';

// @ts-ignore
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorHandler>
      <App />
    </ErrorHandler>
  </React.StrictMode>
);

if (window['env']['GA_TRACKING']) {
  // @ts-ignore
  const ga = function () { (ga.q = ga.q || []).push(arguments) };
  ga.l = +new Date();

  window['ga'] = ga;
  ga('create', window['env']['GA_TRACKING'], 'auto');

  const a = document.createElement('script');
  a.async = true;
  a.src = 'https://www.google-analytics.com/analytics.js';
  document.head.appendChild(a);
}
