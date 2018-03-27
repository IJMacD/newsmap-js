import App from './App'
import React from 'react'
import ReactDOMServer from 'react-dom/server'

export function prerender () {
  return ReactDOMServer.renderToString(<App />);
}
