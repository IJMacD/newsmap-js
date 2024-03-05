const express = require('express');
const proxy = require('express-http-proxy');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();

const port = process.env.PORT || 8000;

// Inject ENV variables
app.get('/', function (req, res) {
  var html = fs.readFileSync(__dirname + '/static/index.html', 'utf8');
  var $ = cheerio.load(html);

  const env = {
    API_ROOT: process.env.API_ROOT,
    DONATION_LINK: process.env.DONATION_LINK,
  };
  var scriptNode = `<script>window['env'] = ${JSON.stringify(env)};</script>`;
  $('body').append(scriptNode);

  if (process.env.GA_TRACKING) {
    const gtag = `
    <script async src="https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', '${process.env.GA_TRACKING}');
    </script>`;
    $('head').append(gtag);
  }

  res.send($.html());
});

app.use(express.static("static"));

app.use("/api", proxy("https://news.google.com", {
  proxyReqOptDecorator(proxyReqOpts) {
    //  -H 'Sec-Fetch-Dest: empty'   -H 'Sec-Fetch-Mode: cors'   -H 'Sec-Fetch-Site: cross-site'
    delete proxyReqOpts.headers['origin'];
    delete proxyReqOpts.headers['sec-fetch-dest'];
    delete proxyReqOpts.headers['sec-fetch-mode'];
    delete proxyReqOpts.headers['sec-fetch-site'];

    return proxyReqOpts;
  },
  userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
    // receives an Object of headers, returns an Object of headers.
    if (userReq.headers["origin"]) {
      const origin = userReq.headers["origin"];
      if (origin === "https://newsmap.ijmacd.com" || origin.startsWith("http://localhost:")) {
        headers["access-control-allow-origin"] = origin;
      }
    }
    headers["cache-control"] = "max-age=300";

    delete headers["accept-ch"];
    delete headers["content-security-policy"];
    delete headers["expires"];
    delete headers["p3p"];
    delete headers["permissions-policy"];
    delete headers["pragma"];
    delete headers["set-cookie"];
    delete headers["vary"];

    return headers;
  }
}));

app.listen(port, () => console.log("Listening on port " + port));