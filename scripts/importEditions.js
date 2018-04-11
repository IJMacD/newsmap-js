const DOMParser = require("xmldom").DOMParser;
const snippet = require("./snippet");

/*
 * To find out which editions are available `snippet.js` contains a snippet of HTML
 * from the Google News homepage. This script extracts the names and edition keys.
 */

const doc = new DOMParser().parseFromString(snippet, "text/html");

const elems = Array.from(doc.documentElement.getElementsByTagName("div")).filter(el => !!el.getAttribute("data-value"));

const values = elems.map(/** @param {HTMLElement} el */ el => {
  const value = el.getAttribute("data-value");

  const name = el.childNodes[1].firstChild.textContent;

  return {
    name,
    value,
  }
});

console.log(JSON.stringify(values));
