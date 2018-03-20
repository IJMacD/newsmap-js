import runtimeEnv from '@mars/heroku-js-runtime-env';
import { ucfirst, urlize } from './util';

import editions from './editions.json';

const env = runtimeEnv();
const API_ROOT = env.REACT_APP_API_ROOT || `//${window.location.host}/api`;

/**
 *
 * @param {object} options
 * @param {string} options.category
 * @param {string} options.edition
 */
export function getNews (options) {
    const capCase = options.category.toUpperCase();
    const titleCase = ucfirst(options.category);
    const ed = options.edition;
    const edition = findEdition(ed);

    if (!edition) {
        throw Error("Invalid Edition");
    }

    return xmlFetch(`${API_ROOT}/news/rss/headlines/section/topic/${capCase}.${ed}/${titleCase}`)
        .then(/** @param {document} data */ data => {
            const items = Array.from(data.getElementsByTagName("item"))
                .map(itemEl => {
                    const title = decodeHtml(itemEl.getElementsByTagName("title")[0].innerHTML);
                    const url = itemEl.getElementsByTagName("link")[0].innerHTML;
                    const id = itemEl.getElementsByTagName("guid")[0].innerHTML;
                    const publishedAt = new Date(itemEl.getElementsByTagName("pubDate")[0].innerHTML).toISOString();

                    const desc = decodeHtml(itemEl.getElementsByTagName("description")[0].innerHTML);
                    const descDoc = (new DOMParser()).parseFromString(desc, "text/html");
                    const imageEl = descDoc.getElementsByTagName("img")[0];
                    const imageURL = imageEl && imageEl.attributes.getNamedItem("src").textContent;

                    const sources = Array.from(descDoc.getElementsByTagName("li"))
                        .map(liEl => {
                            const name = liEl.getElementsByTagName("font")[0].innerText;
                            const id = urlize(name);
                            const aEl = liEl.getElementsByTagName("a")[0];
                            const originalTitle = aEl.innerText;
                            const originalURL = aEl.attributes.getNamedItem("href").textContent;

                            return {
                                id,
                                name,
                                originalTitle,
                                originalURL,
                            };
                        });

                    return {
                        id,
                        title,
                        url,
                        publishedAt,
                        sources,
                        imageURL,
                    }
                });

            return {
                articles: items,
            };
        });
}

function redirectFetch (request) {
    return fetch(request)
        .then(r => {
            if (r.ok) return r;
            if (r.status >= 300 && r.status < 400) {
                // We got a transparent redirect

                // The server might unintentially redirect us to http
                // so we should correct it in that case
                let url = r.headers.get("Location");
                if (/^http:/.test(url)) {
                    url = url.replace("http", "https");
                }

                return redirectFetch(url);
            }
            return Promise.reject("CORS Error");
        });
}

function xmlFetch (url) {
    if (DOMParser) {
        const request = new Request(url, { mode: "same-origin", redirect: "manual" });
        return redirectFetch(request)
            .then(r => {
                if (r.status === 0 || r.type === "opaqueredirect") {
                    // Fallback to clearing out the Accept-Language header
                    // to hopefully avoid the redirection
                    const headers = new Headers({ "Accept-Language": "" });
                    const request = new Request(url, { headers });
                    return redirectFetch(request);
                }
                return Promise.reject(`Unexpected Response: ${url}`);
            })
            .then(r => r.text())
            .then(t => (new DOMParser()).parseFromString(t, "text/xml"));
    }

    // Fallback to XMLHttpRequest
    //  * Does not handle redirect gracefully
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("GET", url, true);

        xhr.responseType = "document";

        xhr.onreadystatechange = () => {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    resolve(xhr.responseXML);
                } else if (xhr.status === 0) {
                    reject("CORS Error");
                } else {
                    reject(xhr.statusText);
                }
            }
        }

        xhr.onerror = reject;

        xhr.send(null);
    });
}

function findEdition (edition) {
    for(let i = 0; i < editions.length; i++) {
        if (editions[i].value === edition) {
            return editions[i];
        }
    }
}

function decodeHtml (str) {
    var map =
    {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#039;': "'"
    };
    return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}
