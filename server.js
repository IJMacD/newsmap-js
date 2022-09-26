const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static("static"));

app.use("/api", proxy("https://news.google.com", {
    proxyReqOptDecorator(proxyReqOpts) {
        //  -H 'Sec-Fetch-Dest: empty'   -H 'Sec-Fetch-Mode: cors'   -H 'Sec-Fetch-Site: cross-site'
        proxyReqOpts.headers['Sec-Fetch-Dest'] = null;
        proxyReqOpts.headers['Sec-Fetch-Mode'] = null;
        proxyReqOpts.headers['Sec-Fetch-Site'] = null;

        return proxyReqOpts;
    },
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
      // recieves an Object of headers, returns an Object of headers.
      headers["access-control-allow-origin"] = "https://newsmap.ijmacd.com";
      return headers;
    }
}));

app.listen(port, () => console.log("Listening on port " + port));