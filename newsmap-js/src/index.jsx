import React from 'react';
import { createRoot } from 'react-dom/client';

import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';
import 'core-js/fn/object/entries';
import 'core-js/fn/string/pad-start';

import ErrorHandler from './Components/ErrorHandler.jsx';
import App from './Components/App.jsx';
import { getEnv } from './env.js';
import './index.css';

// @ts-ignore
const root = createRoot(document.getElementById('root'));

const env = getEnv();

root.render(
  <React.StrictMode>
    <ErrorHandler>
      <App
        refreshTime={+env['UPDATE_FREQUENCY']}
        donationLink={env['DONATION_LINK']}
      />
    </ErrorHandler>
  </React.StrictMode>
);
