import fetch from 'node-fetch';

export default async function ssr(url, prerenderToken, prerenderUrl = 'https://service.prerender.io/') {
    const options = {
        method: 'GET',
        headers: {'X-Prerender-Token': prerenderToken}
    };

    return await fetch(prerenderUrl + url, options).then(res => res.text());
}

const {url, token, prerenderUrl} = require('minimist')(process.argv.slice(2));

if (url && token) {
    // eslint-disable-next-line no-console
    (async () => console.log(await ssr(url, token, prerenderUrl)))();
}
