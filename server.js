const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

const port = process.env.PORT || 8000;

app.use(express.static("static"));

app.use("/api", proxy("https://news.google.com"));

app.listen(port, () => console.log("Listening on port " + port));