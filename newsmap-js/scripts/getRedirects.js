const https = require("https");
const fs = require('fs');
const path = require('path');

const editions = require("../src/data/editions.json");
const categories = require("../src/data/categories.json");

const API_ROOT = "https://news.google.com";

/*
 * After scraping the editions from the html we can't just use them directly.
 * Google redirects to certain other language specific urls based on edition.
 * Due to CORS this won't work on the client so we need to perform it in advance.
 */

run();

async function run () {
  for (const ed of editions) {
    const out = {};

    const urls = categories.map(category => {
      const [ cc, lang ] = ed.value.split("_");
      const url = `${API_ROOT}/news/rss/headlines/section/topic/${category.toUpperCase()}?ceid=${cc}:${lang}&hl=${lang}&gl=${cc}`;

      return fetch(url).then(res => {
        out[category] = res.req.path.substring(res.req.path.lastIndexOf("/"));
      });
    });

    await Promise.all(urls).then(() => {
      fs.writeFile(path.join(__dirname, "../src/data/editions/", `${ed.value}.json`), JSON.stringify(out, null, 2), function(err) {
          if(err) {
              return console.log(err);
          }

          console.log(`Written ${ed.name || ed.value}`);
      });
    });
  }
}

function fetch (url) {
  // console.log(url);
  return new Promise((resolve, reject) => {
    https.get(url, respose => {
      if (respose.statusCode === 302) {
        const { location } = respose.headers;
        resolve(fetch(location));
      }
      return resolve(respose);
    }).on('error', reject);
  });
}
