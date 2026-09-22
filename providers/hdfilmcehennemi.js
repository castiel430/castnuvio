/**
 * HDFilmCehennemi Nuvio Provider (Gelişmiş & Çalışan Sürüm)
 * Domain: https://www.hdfilmcehennemi.nl
 */

const BASE_URL = 'https://www.hdfilmcehennemi.nl';
const TMDB_API_KEY = '15d2827043324628e772f03221e520b2'; // Nuvio genel TMDB key veya kendi key'iniz

// 1. TMDB ID'den Film/Dizi Adını Çekme
function getMediaDetails(tmdbId, mediaType) {
  const type = mediaType === 'tv' ? 'tv' : 'movie';
  const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=tr-TR`;

  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      return {
        title: data.title || data.name || data.original_title || data.original_name,
        originalTitle: data.original_title || data.original_name
      };
    })
    .catch(() => null);
}

// 2. Main Provider Fonksiyonu
function getStreams(tmdbId, mediaType, seasonNum, episodeNum) {
  return new Promise((resolve) => {
    // Önce TMDB'den isim bilgisini al
    getMediaDetails(tmdbId, mediaType)
      .then((details) => {
        if (!details || !details.title) {
          console.log('[HDFilmCehennemi] TMDB bilgisi alınamadı.');
          return resolve([]);
        }

        const query = encodeURIComponent(details.title);
        const searchUrl = `${BASE_URL}/search?q=${query}`;

        // HDFilmCehennemi üzerinde arama yap
        return fetch(searchUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': BASE_URL
          }
        })
          .then((res) => res.text())
          .then((html) => {
            // Arama sonuçlarından ilk film linkini yakala
            const linkMatch = html.match(/class="poster[^"]*"[^>]*href="([^"]+)"/i) || html.match(/href="(${BASE_URL}\/[^"]+)"/i);

            if (!linkMatch || !linkMatch[1]) {
              console.log('[HDFilmCehennemi] Arama sonucu bulunamadı.');
              return resolve([]);
            }

            let targetUrl = linkMatch[1];
            if (!targetUrl.startsWith('http')) {
              targetUrl = BASE_URL + targetUrl;
            }

            // Eğer diziyse ilgili sezon/bölüm sayfasına git
            if (mediaType === 'tv' && seasonNum && episodeNum) {
              targetUrl = `${targetUrl}/${seasonNum}-sezon-${episodeNum}-bolum`;
            }

            // Film / Bölüm sayfasını çek
            return fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': searchUrl
              }
            })
              .then((res) => res.text())
              .then((pageHtml) => {
                const streams = [];

                // Sayfadaki iframe/player kaynaklarını ayıkla (Vidmoly, Rapidrame vb.)
                const iframeMatches = pageHtml.match(/<iframe[^>]+src="([^"]+)"/gi);

                if (iframeMatches) {
                  iframeMatches.forEach((iframe, index) => {
                    const srcMatch = iframe.match(/src="([^"]+)"/i);
                    if (srcMatch && srcMatch[1]) {
                      let streamUrl = srcMatch[1];
                      if (streamUrl.startsWith('//')) {
                        streamUrl = 'https:' + streamUrl;
                      }

                      // Reklam/Social iframe'lerini filtrele
                      if (!streamUrl.includes('facebook') && !streamUrl.includes('google') && !streamUrl.includes('disqus')) {
                        streams.push({
                          name: `HDFilmCehennemi Source #${index + 1}`,
                          type: 'embed',
                          url: streamUrl,
                          quality: '1080p'
                        });
                      }
                    }
                  });
                }

                resolve(streams);
              });
          });
      })
      .catch((err) => {
        console.log('[HDFilmCehennemi] Hata:', err.message);
        resolve([]);
      });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { getStreams };
}
