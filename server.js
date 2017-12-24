const proxy = require('express-http-proxy');
const app = require('express')();

const port = process.env.PORT || 8000;

app.use(proxy("https://news.google.com"));

app.listen(port, () => console.log("Listening on port " + port));