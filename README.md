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
       cd newsmap-js/newsmap-js
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

Donation
--------
Due to the way the news data needs to be fetched, I have to run a server to
proxy requests upstream to Google News.

There is a small hosting cost associated with this.

If NewsMap.JS is useful to you and you wish to help with these costs; donations
are very much appreciated at this link [PayPal.Me](https://www.paypal.me/ijmacd).
