import { ucfirst, urlize } from './util';

import editions from './editions.json';

const API_ROOT = `//${window.location.host}/api`;

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

    const gl = edition.gl;
    const hl = edition.hl;
    return xmlFetch(`${API_ROOT}/news/rss/headlines/section/topic/${capCase}.${ed}/${titleCase}?ned=${ed}&gl=${gl}&hl=${hl}`)
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

function xmlFetch (url) {
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

function escapeHtml (str) {
    var map =
    {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, m => map[m]);
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
