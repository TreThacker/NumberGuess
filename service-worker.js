/* <------------------------------------------------
      TITLE: Number Guessing Game
      CREATOR: Tre Thacker
      YEAR: 2026
      VERSION: 1.00
      DEDICATION:
   -------------------------------------------------> */

/* <------------------------------------------------
      SERVICE WORKER CACHE CONFIGURATION
   -------------------------------------------------> */

const CACHE_NAME =
  "number-guessing-game-v1-00";

const FILES_TO_CACHE = [

  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./favicon.ico",

  "./image/icon/icon-16.png",
  "./image/icon/icon-32.png",
  "./image/icon/icon-192.png",
  "./image/icon/icon-512.png",
  "./image/icon/apple-touch-icon.png"

];

/* <------------------------------------------------
      SERVICE WORKER INSTALL
   -------------------------------------------------> */

self.addEventListener(
  "install",
  function(event){

    event.waitUntil(
      caches
        .open(
          CACHE_NAME
        )
        .then(function(cache){

          return cache.addAll(
            FILES_TO_CACHE
          );
        })
    );

    self.skipWaiting();
  }
);

/* <------------------------------------------------
      SERVICE WORKER ACTIVATE
   -------------------------------------------------> */

self.addEventListener(
  "activate",
  function(event){

    event.waitUntil(
      caches
        .keys()
        .then(function(cacheNames){

          return Promise.all(
            cacheNames.map(function(cacheName){

              if(cacheName !== CACHE_NAME){

                return caches.delete(
                  cacheName
                );
              }

              return null;
            })
          );
        })
    );

    self.clients.claim();
  }
);

/* <------------------------------------------------
      SERVICE WORKER FETCH
   -------------------------------------------------> */

self.addEventListener(
  "fetch",
  function(event){

    event.respondWith(
      caches
        .match(
          event.request
        )
        .then(function(cachedResponse){

          return cachedResponse || fetch(
            event.request
          );
        })
    );
  }
);