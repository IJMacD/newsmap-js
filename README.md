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

When you build for `prod` you'll have to set environment variable `REACT_APP_API_ROOT` to an RSS news source compatible with Google News (or a proxy to it).

* Bash compatible shell

       REACT_APP_API_ROOT=https://example.com npm run build

* Powershell

       $env:REACT_APP_API_ROOT = "https://example.com"; npm run build

FAQ
---

### Where's Spain?

Google News hasn't been available in Spain since 2014.

You can check out this blog post: https://europe.googleblog.com/2014/12/an-update-on-google-news-in-spain.html
Or these news articles from the time:

* https://www.theguardian.com/technology/2014/dec/11/google-news-spain-to-close-in-response-to-tax-on-story-links
* https://www.theverge.com/2014/12/11/7375733/google-news-spain-shutdown
* https://www.eff.org/deeplinks/2014/12/google-news-shuts-shop-spain-thanks-ancillary-copyright-law

Donation
--------
Some people have asked for a donation link. While I feel that it's mostly unnecessary since I feel this work is conceptually derivative if not actually technically derived from any pre-existing code. It also comes pretty close to selling Google News - itself just a content aggregator.

That being said, you can do whatever you like with the following links:

* [Amazon Gift Cards](https://www.amazon.co.uk/Amazon-Amazon-co-uk-eGift-Voucher/dp/B006AUF6X0/) can be sent to IJMacD@gmail.com
* [PayPal.Me](https://www.paypal.me/ijmacd)
