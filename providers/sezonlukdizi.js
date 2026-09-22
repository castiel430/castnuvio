/**
 * SezonlukDizi Nuvio Provider
 * Domain: https://sezonlukdizi.cc
 */

const BASE_URL = 'https://sezonlukdizi.cc';

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve) => {
    // Sadece TV dizileri için çalışır
    if (mediaType !== 'tv') return resolve([]);

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
        const matches = html.match(/data-video="([^"]+)"/g);

        if (matches) {
          matches.forEach((match, index) => {
            const videoUrl = match.replace('data-video="', '').replace('"', '');
            streams.push({
              name: `SezonlukDizi #${index + 1}`,
              type: 'embed',
              url: videoUrl.startsWith('//') ? 'https:' + videoUrl : videoUrl,
              quality: '1080p'
            });
          });
        }
        resolve(streams);
      })
      .catch((err) => {
        console.log('[SezonlukDizi] Hata:', err.message);
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStreams };
}
