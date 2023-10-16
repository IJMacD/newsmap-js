const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static("static"));

app.use("/api", proxy("https://news.google.com", {
    proxyReqOptDecorator(proxyReqOpts) {
        //  -H 'Sec-Fetch-Dest: empty'   -H 'Sec-Fetch-Mode: cors'   -H 'Sec-Fetch-Site: cross-site'
        delete proxyReqOpts.headers['Sec-Fetch-Dest'];
        delete proxyReqOpts.headers['Sec-Fetch-Mode'];
        delete proxyReqOpts.headers['Sec-Fetch-Site'];

        return proxyReqOpts;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      // receives an Object of headers, returns an Object of headers.
      headers["access-control-allow-origin"] = "https://newsmap.ijmacd.com";
      headers["cache-control"] = "max-age=300";

      delete headers["accept-ch"];
      delete headers["content-security-policy"];
      delete headers["expires"];
      delete headers["p3p"];
      delete headers["permissions-policy"];
      delete headers["pragma"];
      delete headers["set-cookie"];

      return headers;
    }
}));

app.listen(port, () => console.log("Listening on port " + port));