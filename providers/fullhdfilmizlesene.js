/**
 * FullHDFilmizlesene Nuvio Provider
 * Domain: https://www.fullhdfilmizlesene.pw
 */

const BASE_URL = 'https://www.fullhdfilmizlesene.pw';

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve) => {
    const searchUrl = `${BASE_URL}/arama/${encodeURIComponent(tmdbId)}`;

    fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': BASE_URL
      }
    })
      .then((res) => res.text())
      .then((html) => {
        const streams = [];
        const playerMatches = html.match(/file:\s*"([^"]+)"/g);

        if (playerMatches) {
          playerMatches.forEach((match, index) => {
            const streamUrl = match.replace(/file:\s*"/, '').replace('"', '');
            streams.push({
              name: `FullHDFilmizlesene #${index + 1}`,
              type: 'direct',
              url: streamUrl,
              quality: '1080p'
            });
          });
        }
        resolve(streams);
      })
      .catch((err) => {
        console.log('[FullHDFilmizlesene] Hata:', err.message);
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStreams };
}
