/**
 * FilmModu Nuvio Provider
 * Domain: https://www.filmmodu.org
 */

const BASE_URL = 'https://www.filmmodu.org';

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve) => {
    const searchUrl = `${BASE_URL}/arama?q=${encodeURIComponent(tmdbId)}`;

    fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': BASE_URL
      }
    })
      .then((res) => res.text())
      .then((html) => {
        const streams = [];
        const iframeMatches = html.match(/<iframe[^>]+src="([^"]+)"/gi);

        if (iframeMatches) {
          iframeMatches.forEach((iframe, index) => {
            const srcMatch = iframe.match(/src="([^"]+)"/i);
            if (srcMatch && srcMatch[1]) {
              let url = srcMatch[1];
              if (url.startsWith('//')) url = 'https:' + url;

              streams.push({
                name: `FilmModu #${index + 1}`,
                type: 'embed',
                url: url,
                quality: '1080p'
              });
            }
          });
        }
        resolve(streams);
      })
      .catch((err) => {
        console.log('[FilmModu] Hata:', err.message);
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStreams };
}
