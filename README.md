NewsMap.JS
=========

A pure javascript replacement for the now defunct http://newsmap.jp.

Shows a visual representation of headlines from Google News. Select one or more editions and enable/disable categories to suit yourself.

Implemented in pure Javascript using react. Open source - read source, ask questions, send pull requests. Don't worry I know it's far from perfect!

Running Locally
---------------

Follow the steps below to get it running locally. In `dev` environment API requests will be proxied automatically.

1. Install

       git clone https://github.com/IJMacD/newsmap-js.git
       cd newsmap-js
       npm install

2. Run development server

       npm start

Building for Prod
-----------------

When you build for `prod` you'll have to set environment variable `VITE_API_ROOT` to an RSS news source compatible with Google News (or a proxy to it).

* Bash compatible shell

       VITE_API_ROOT=https://example.com npm run build

* Powershell

       $env:VITE_API_ROOT = "https://example.com"; npm run build
