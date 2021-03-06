const version = '20190210005438';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/general/2019/01/10/Interspeech2019SpecialSession/","/general/2018/09/01/interspeech-2018/","/general/2018/05/07/asa-2018/","/general/2018/04/15/icassp-2018/","/NEW-JEKYLL-SITE-VOiCES/404/","/Interspeech2019-Special-Session/","/Interspeech2019_SpecialSession/","/about/","/categories/","/downloads/","/blog/","/NEW-JEKYLL-SITE-VOiCES/","/","/links/","/manifest.json","/offline/","/organizers/","/reading/","/rooms/","/assets/search.json","/search/","/assets/styles.css","/thanks/","/assets/css/style.css","/Interpeech_FAQ/","/Lab41-SRI-VOiCES_README/","/VOiCES_InterspeechChallenge2019_FAQ/","/redirects.json","/feed.xml","/sitemap.xml","/robots.txt","/blog/page2/","/images/VOiCES_logo.png", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
