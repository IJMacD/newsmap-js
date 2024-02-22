const DOMParser = require("@xmldom/xmldom").DOMParser;
const snippet = require("./snippet");

/*
 * To find out which editions are available `snippet.js` contains a snippet of HTML
 * from the Google News homepage. This script extracts the names and edition keys.
 */

const doc = new DOMParser().parseFromString(snippet, "text/html");

const elems = Array.from(doc.documentElement.getElementsByTagName("li")).filter(el => el.getAttribute("data-n-cess"));

const values = elems.map(/** @param {HTMLElement} el */ el => {
  const value = el.getElementsByTagName("input")[0].getAttribute("value").replace(":", "_");
  const name = el.getElementsByTagName("label")[0].textContent;

  return {
    name,
    value,
  }
});

console.log(JSON.stringify(values));
