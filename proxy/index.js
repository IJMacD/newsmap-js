const proxy = require('express-http-proxy');
const app = require('express')();

const port = 8000;

app.use('/', proxy('https://news.google.com', {
    userResHeaderDecorator: headers => { headers["Access-Control-Allow-Origin"] = "*"; return headers; },
}));

app.listen(port, () => console.log(`Google News proxy server running at http://localhost:${port}`));