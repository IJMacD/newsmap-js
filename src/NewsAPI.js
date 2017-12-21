export default function NewsAPI (api_key) {
    return {
        getNews (options) {
            const queryString = Object.entries(options).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
            return fetch(`https://newsapi.org/v2/top-headlines?${queryString}&language=en&apiKey=${api_key}`)
                .then(r => r.json());
        }
    }
}