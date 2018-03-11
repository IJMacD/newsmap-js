import React from 'react';
import ReactDOM from 'react-dom';
import runtimeEnv from '@mars/heroku-js-runtime-env';
import registerServiceWorker from './registerServiceWorker';

import App from './App';
import './index.css';

ReactDOM.render(<App />, document.getElementById('root'));

registerServiceWorker();

const env = runtimeEnv();

if (env.REACT_APP_GA_TRACKING) {
  const ga = function(){(ga.q = ga.q||[]).push(arguments)};
  ga.l = +new Date();
  window.ga = ga;
  ga('create', env.REACT_APP_GA_TRACKING, 'auto');
  ga('send', 'pageview');

  const a = document.createElement('script');
  a.async = true;
  a.src = 'https://www.google-analytics.com/analytics.js';
  document.head.appendChild(a);
}
