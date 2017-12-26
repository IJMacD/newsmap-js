const https = require("https");

const editions = require("./src/editions.json");

const API_ROOT = "https://news.google.com";

/*
 * After scraping the editions from the html we can't just use them directly.
 * Google redirects to certain other language specific urls based on edition.
 * Due to CORS this won't work on the client so we need to perform it in advance.
 */

const newEditions = editions.map(ed => {
  const url = `${API_ROOT}/news/rss/headlines/section/topic/WORLD.${ed.value}/World?ned=${ed.value}`;

  return fetch(url).then(res => {
    const loc = res.headers.location;

    const glMatch = /gl=([^&]+)/.exec(loc);
    const hlMatch = /hl=([^&]+)/.exec(loc);

    if (glMatch && hlMatch) {
      return {
        name: ed.name,
        value: ed.value,
        gl: glMatch[1],
        hl: hlMatch[1],
      };
    }
  });
});

Promise.all(newEditions).then(eds => {
  console.log(JSON.stringify(eds));
});


function fetch (url) {
  return new Promise((resolve, reject) => {
    https.get(url, resolve).on('error', reject);
  });
}