const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

const port = process.env.PORT || 8000;

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