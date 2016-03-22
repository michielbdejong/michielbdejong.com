/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */


(function (self) {
  'use strict';

  // On install, cache resources and skip waiting so the worker won't
  // wait for clients to be closed before becoming active.
  self.addEventListener('install', event =>
    event.waitUntil(
      oghliner.cacheResources()
      .then(() => self.skipWaiting())
    )
  );

  // On activation, delete old caches and start controlling the clients
  // without waiting for them to reload.
  self.addEventListener('activate', event =>
    event.waitUntil(
      oghliner.clearOtherCaches()
      .then(() => self.clients.claim())
    )
  );

  // Retrieves the request following oghliner strategy.
  self.addEventListener('fetch', event => {
    if (event.request.method === 'GET') {
      event.respondWith(oghliner.get(event.request));
    } else {
      event.respondWith(self.fetch(event.request));
    }
  });

  var oghliner = self.oghliner = {

    // This is the unique prefix for all the caches controlled by this worker.
    CACHE_PREFIX: 'offline-cache:michielbdejong/michielbdejong.com:' + (self.registration ? self.registration.scope : '') + ':',

    // This is the unique name for the cache controlled by this version of the worker.
    get CACHE_NAME() {
      return this.CACHE_PREFIX + '6c4cd380e7a52ea108b375b6b363aab8108961ae';
    },

    // This is a list of resources that will be cached.
    RESOURCES: [
      'adventures/1-draft.html', // d0f85b7bee60840fe875ec3f3def176ea248d2ce
      'adventures/2-draft.html', // b970b00268be37c2e6efa187109a5074a40b2d2f
      'adventures/3-draft.html', // 00183d18fffc59889ab083f363608c4c2d7f25ea
      'adventures/4-draft.html', // a092850433791471e52b513835b7f5191c1f96c3
      'adventures/5-draft.html', // adb0c211e66d9ce252b197181f4293f1ad3cea05
      'adventures/bluelining.png', // 39eda5e151b05f95e408d7f3866d1879ca31fd9f
      'adventures/fb-from-app.png', // 2b3242ae31c711d6438aed92626f67f3e1727337
      'adventures/fb-from-explorer.png', // a64be044fbaaa9c1dfa532fc5af485b6bdfa852b
      'adventures/fb-get-token.png', // c1ee2b60262de77d969247f45e8a83bae3392e90
      'adventures/pinger-example.png', // e8583180e54eebccd43fced583d03d480115e449
      'adventures/pinger-expbackoff.png', // 983393db66d1254b4a15acfc221955fb2e1c63a9
      'blog/1.html', // 13a30ccb5d4d4c6792081edd044c93600e5ccc7c
      'blog/10.html', // ea10ee6d89a3cb445d6023ce3d778d518ef4fd32
      'blog/11.html', // d3a7728ef15ce57ab8aec3bb66fc9ea0eed0ba74
      'blog/12.html', // b651144b6327188b6bba2cefefc6ac7528c3b3ad
      'blog/13.html', // 6138d834694db5239afdc7f5b568495c3a65e766
      'blog/14.html', // fb76fe0b37631dec93ebc220fb957cfd5e9bcf39
      'blog/15.html', // e71e4cf17afc813872d598ba679d1b7009e95587
      'blog/16.html', // cd1a8d8e9de50d8d683ad2e125b1ac673abd91d8
      'blog/17.html', // 4852c4e7229cff8c2ec52077fbf727223dcd0bb8
      'blog/18.html', // 6aa6ebacf85c7ed4ed7a54a07aeea53bd378f5d4
      'blog/19.html', // 382a32c5a6c2826a843b2ec524757158ca8f9448
      'blog/2.html', // b0b1310ffe2b7ed3460e7bf02a4278b98fddc088
      'blog/3.html', // d65940d993d8900e5f731d8261073ff63ab7f0b3
      'blog/4.html', // fcf212ef308aa5006a1ff74b289876011e907764
      'blog/5.html', // fafba25517e0d40905808cd510025add516de20a
      'blog/6.html', // 648dddaa4ac12bbe10ad24f798ba264d310c3047
      'blog/7.html', // db480898866744676078c43f9cd98ad71a96db69
      'blog/8.html', // c8ad500987300df5211be8b1e7b974e66ad0fb23
      'blog/9.html', // 2dd252a93e9cc5bff1e4dd792397a6396e6204b0
      'chat.html', // c379e13946b70ac6f2b1b22b5e145cec87946260
      'CNAME', // f3f1d1a6ed5d5094a7836e0962e0078b72b9dbe3
      'commit-cache.html', // 46abfba7f348134c5cc732d8a2cdf05c1b411553
      'crashMyNightly.html', // 202ac9c8d3211c93c6f30e2bfff4022fce41bea3
      'img/468_60_banner_footprint.jpg', // 957c5cc6e3f783cd30c8d054b6f3c0de1341abf2
      'img/bg.jpg', // 8b5de6c475dc82585185989612c41b0027a4dcfb
      'img/blog-2-1.png', // fa3930a71dca33855e1d7c57ed5c876a09068138
      'img/blog-2-10.png', // 93ff79911c3fe4fafc8c4efe12dda3c77e2f5ae5
      'img/blog-2-11.png', // a2eaecd7eef8a9d947df7e4614e65087a3790559
      'img/blog-2-12.jpg', // b54769b898a3e785e3b9ede0c21e3a09a867fa3d
      'img/blog-2-13.jpg', // 1d123628a679fce18fffac4b8722c7547a735e85
      'img/blog-2-14.jpg', // b53803b8ee1fa4222788207a86ca49036e89d036
      'img/blog-2-15.png', // 6c0e5f1a1285841c4be8bda7088beb9793d814e3
      'img/blog-2-2.png', // 30e76fd81ec746ad5f40d4bc0ecceaab46f6525b
      'img/blog-2-3.png', // b70caff28fd38d3a820ed442d7790d3b83e55ac1
      'img/blog-2-4.png', // a561fce2d2c9530c5920d303cf29dbd71a131ec9
      'img/blog-2-5.png', // ae91fdc436048680c4a70ddf9e70c044588037b7
      'img/blog-2-6.png', // f35ae788872cb14cc629b1c0d22188993bf89268
      'img/blog-2-7.png', // 591ea14ca5422a61947b48a263a110718ab4638b
      'img/blog-2-8.png', // 976495cea1cdb814f0ab4090fc404473134e4765
      'img/blog-2-9.png', // cfd8873f82d3dead4a2ff8bda64233ea60cf904a
      'img/me.jpg', // 14c6dbee00986f98d2cf2ae1637932ad9ba8803a
      'img/opentabs.png', // 7200e5f9e3b04af88fd1cf6ad8625887c82b49a0
      'index.html', // 13bc8f3fa0df03365865a40fdc57a58cc91e16ec
      'logo.svg', // 2ea10d7cdc9c3f0c3b5b765b274370fbd792f248
      'me.jpg', // 59d30b3d5da0213dbd40e19b36264d6e351b525d
      'me.png', // 1741c0fd342dc41d16600fbb37d1b80a72650603
      'name.jpg', // baeab788efa81f8e498ed83b367189a5c83b6aad
      'offline-manager.js', // e2e09e000c5b64035940ae44e9c0936eb25ecd51
      'pierre_michiel/IMG_6816.JPG', // 97201a021598978dfc6a2fcf996640520d37f7d6
      'pierre_michiel/IMG_6819.JPG', // 3f22ab7fc252d01c702604a81dbeb29406534e1d
      'pierre_michiel/IMG_6820.JPG', // 054849aae5dab189bb43978e52afc5e8dfad0465
      'pierre_michiel/IMG_6822.JPG', // 954fa167af08d0a12273a1273010c666cfa543ab
      'pierre_michiel/IMG_6826.JPG', // ca2ac7c412241f0a344ffe0900a0166d543ca386
      'pierre_michiel/IMG_6827.JPG', // b75c6393a156cd46c6092b8821faddf44d3c0fab
      'pierre_michiel/IMG_6828.JPG', // 418e5a5e3a096de98d3a71ab8032ff6c23bc0ab4
      'pierre_michiel/michiel.png', // 82f62703dc3b9c78441f1e7bf97d5db2abd2e919
      'pierre_michiel/pierre.jpeg', // 6be1dec6f0aa3a36f60960e335872e0aea5c32ee
      'public-key.txt', // b7004a929bdb3edfe9ff323d57e3bf548f9f3410
      'public.key', // b7004a929bdb3edfe9ff323d57e3bf548f9f3410
      'send.html', // 53bc31bd424336a2e1bd2d3a4bb8f25df56706f4
      'sockjs-0.3.min.js', // 5166a9fb71d360a3a9bdae260485fe414bc7031e
      'sponsorship.html', // af5549a0757eb8e826451ef681b1bcc88e36c73c
      'sticker.svg', // ff7bd1affad7d2343c57f06e38bb0cba5aabc3ab
      'tshirt-idea.html', // 961abf4f55e8c7ccd6e699e25c3dc98b6825d1e5
      'tshirt.svg', // 224010c20d3ab13fbbdc3cda29aae95a5e593f87
      'tshirt2.svg', // 8b92bc257a60ba8edf1aff4e261d6e840c50d00b
      'unhosted_1.pdf', // 83628d0fd97e1eeb981b48c19dfa4369da279df7
      'useraddress/index.html', // 3a37395b7c880c0995022b9e78b2d985e3ea5526
      'webrtc.html', // 3543d60e0f8e4db70096e3296f7ad5c458abcfa6
      'wordlookup.html', // 42c2d1328159cf56e424771fa792b75cbaa444dd

    ],

    // Adds the resources to the cache controlled by this worker.
    cacheResources: function () {
      var now = Date.now();
      var baseUrl = self.location;
      return this.prepareCache()
      .then(cache => Promise.all(this.RESOURCES.map(resource => {
        // Bust the request to get a fresh response
        var url = new URL(resource, baseUrl);
        var bustParameter = (url.search ? '&' : '') + '__bust=' + now;
        var bustedUrl = new URL(url.toString());
        bustedUrl.search += bustParameter;

        // But cache the response for the original request
        var requestConfig = { credentials: 'same-origin' };
        var originalRequest = new Request(url.toString(), requestConfig);
        var bustedRequest = new Request(bustedUrl.toString(), requestConfig);
        return fetch(bustedRequest)
        .then(response => {
          if (response.ok) {
            return cache.put(originalRequest, response);
          }
          console.error('Error fetching ' + url + ', status was ' + response.status);
        });
      })));
    },

    // Remove the offline caches not controlled by this worker.
    clearOtherCaches: function () {
      var outOfDate = cacheName => cacheName.startsWith(this.CACHE_PREFIX) && cacheName !== this.CACHE_NAME;

      return self.caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
        .filter(outOfDate)
        .map(cacheName => self.caches.delete(cacheName))
      ));
    },

    // Get a response from the current offline cache or from the network.
    get: function (request) {
      return this.openCache()
      .then(cache => cache.match(() => this.extendToIndex(request)))
      .then(response => {
        if (response) {
          return response;
        }
        return self.fetch(request);
      });
    },

    // Make requests to directories become requests to index.html
    extendToIndex: function (request) {
      var url = new URL(request.url, self.location);
      var path = url.pathname;
      if (path[path.length - 1] !== '/') {
        return request;
      }
      url.pathname += 'index.html';
      return new Request(url.toString(), request);
    },

    // Prepare the cache for installation, deleting it before if it already exists.
    prepareCache: function () {
      return self.caches.delete(this.CACHE_NAME)
      .then(() => this.openCache());
    },

    // Open and cache the offline cache promise to improve the performance when
    // serving from the offline-cache.
    openCache: function () {
      if (!this._cache) {
        this._cache = self.caches.open(this.CACHE_NAME);
      }
      return this._cache;
    }

  };
}(self));
