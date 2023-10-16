import React from 'react';
import { createRoot } from 'react-dom/client';

import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';
import 'core-js/fn/object/entries';
import 'core-js/fn/string/pad-start';

import ErrorHandler from './ErrorHandler.jsx';
import App from './App.jsx';
import './index.css';

const root = createRoot(document.getElementById('root'));
root.render(<ErrorHandler><App /></ErrorHandler>);

if (import.meta.env.VITE_GA_TRACKING) {
  const ga = function(){(ga.q = ga.q||[]).push(arguments)};
  ga.l = +new Date();
  window.ga = ga;
  ga('create', process.env.VITE_GA_TRACKING, 'auto');

  const a = document.createElement('script');
  a.async = true;
  a.src = 'https://www.google-analytics.com/analytics.js';
  document.head.appendChild(a);
}
