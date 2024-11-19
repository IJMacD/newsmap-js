import React from 'react';
import { createRoot } from 'react-dom/client';

import ErrorHandler from './Components/ErrorHandler.jsx';
import { Playground } from './Components/Playground.jsx';

// @ts-ignore
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorHandler>
      <Playground />
    </ErrorHandler>
  </React.StrictMode>
);
