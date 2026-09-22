/**
 * HDFilmCehennemi Nuvio Provider
 * Domain: https://www.hdfilmcehennemi.nl
 */

const BASE_URL = 'https://www.hdfilmcehennemi.nl';

function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve) => {
    // 1. TMDB'den Türkçe isim veya ID bilgisi için TMDB API isteği (Nuvio iç yapısından tetiklenebilir)
    // Örnek arama sorgusu:
    const searchUrl = `${BASE_URL}/search?q=${encodeURIComponent(tmdbId)}`;

    fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': BASE_URL
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Arama isteği başarısız.');
        return res.text();
      })
      .then((html) => {
        // Sayfa içeriğinden yayın bağlantılarını (Rapidrame, Vidmoly, vb.) ayıklama
        const streams = [];

        // Örnek regex ile iframe / player kaynaklarını ayıklama
        const iframeMatches = html.match(/<iframe[^>]+src="([^"]+)"/g);

        if (iframeMatches) {
          iframeMatches.forEach((iframe, index) => {
            const srcMatch = iframe.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
              let streamUrl = srcMatch[1];
              if (streamUrl.startsWith('//')) {
                streamUrl = 'https:' + streamUrl;
              }

              streams.push({
                name: `HDFilmCehennemi Source #${index + 1}`,
                type: 'embed',
                url: streamUrl,
                quality: '1080p'
              });
            }
          });
        }

        resolve(streams);
      })
      .catch((err) => {
        console.log('[HDFilmCehennemi] Hata:', err.message);
        // Hata durumunda uygulamanın kilitlenmemesi için boş dizi dönülür
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStreams };
}
