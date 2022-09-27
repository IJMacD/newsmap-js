import React from 'react';
import ReactDOM from 'react-dom';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';

import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/array/find';
import 'core-js/fn/object/entries';
import 'core-js/fn/string/pad-start';

import ErrorHandler from './ErrorHandler';
import App from './App';
import './index.css';

ReactDOM.render(<ErrorHandler><App /></ErrorHandler>, document.getElementById('root'));
unregisterServiceWorker();


window.location = "https://newsmap.ijmacd.com";