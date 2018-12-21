import runtimeEnv from '@mars/heroku-js-runtime-env';
import { urlize } from './util';

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
    const ed = options.edition;
    const edition = findEdition(ed);

    const urls = require(`./editions/${ed}.json`);
    const path = urls[options.category.toLowerCase()];

    if (!edition) {
        throw Error("Invalid Edition");
    }

    if (!path) {
        throw Error("Can't find URL for edition/category");
    }

    return xmlFetch(`${API_ROOT}/rss/topics/${path}`)
        .then(/** @param {document} data */ data => {
            const items = Array.from(data.getElementsByTagName("item"))
                .map(itemEl => {
                    const titleEl = itemEl.getElementsByTagName("title")[0];
                    let title = titleEl ? decodeHtml(titleEl.textContent || titleEl.innerHTML) : "";

                    const linkEl = itemEl.getElementsByTagName("link")[0];
                    const url = linkEl ? linkEl.textContent || linkEl.innerHTML : "";

                    const idEl = itemEl.getElementsByTagName("guid")[0];
                    const id = idEl ? idEl.textContent || idEl.innerHTML : "";

                    const sourceNameEl = itemEl.getElementsByTagName("source")[0];
                    const sourceName = sourceNameEl ? sourceNameEl.textContent || sourceNameEl.innerHTML : "";

                    const sourceTail = ` - ${sourceName}`;
                    if (title.endsWith(sourceTail)) {
                        title = title.substring(0, title.length - sourceTail.length);
                    }

                    const dateEl = itemEl.getElementsByTagName("pubDate")[0];
                    const publishedAt = dateEl ? new Date(dateEl.textContent || dateEl.innerHTML).toISOString() : "";

                    const imageEl = itemEl.getElementsByTagName("media:content")[0];
                    let imageURL = imageEl ? imageEl.attributes.getNamedItem("url").textContent : "";

                    let sources;
                    const descEl = itemEl.getElementsByTagName("description")[0];

                    if (descEl) {
                        const desc = decodeHtml(descEl.textContent || descEl.innerHTML);
                        const descDoc = (new DOMParser()).parseFromString(desc, "text/html");

                        sources = Array.from(descDoc.getElementsByTagName("li"))
                            .map(liEl => {
                                const nameEl = liEl.getElementsByTagName("font")[0];
                                const name = nameEl ? nameEl.textContent || nameEl.innerText : "";

                                const id = urlize(name);

                                const aEl = liEl.getElementsByTagName("a")[0];
                                let title = aEl ? aEl.textContent || aEl.innerText : "";
                                const url = aEl ? aEl.attributes.getNamedItem("href").textContent : "";


                                const sourceTail = ` - ${name}`;
                                if (title.endsWith(sourceTail)) {
                                    title = title.substring(0, title.length - sourceTail.length);
                                }

                                return {
                                    id,
                                    name,
                                    title,
                                    url,
                                };
                            }).filter(s => s.name);
                    }

                    if (!sources || sources.length === 0) {
                        sources = [{
                            id: urlize(sourceName),
                            name: sourceName,
                            title,
                            url,
                        }];
                    }

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

function xmlFetch (url) {
    if (DOMParser) {
        // Clearing out Accept-Language stops Google's servers from redirecting to a different language
        const headers = new Headers({ "Accept-Language": "" });
        return fetch(url, { headers })
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
