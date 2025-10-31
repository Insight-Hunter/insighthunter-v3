"use strict";
const CACHE_NAME = 'insighthunter-cache-v2';
const CACHE_FILES = [
    '/',
    '/index.html',
    '/static/js/bundle.js',
    '/static/css/main.css',
    // Add any other core assets you want to cache
];
// Installation: caching resources
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_FILES)));
    self.skipWaiting();
});
// Activation: cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
            return caches.delete(key);
        }
        return Promise.resolve();
    }))));
    self.clients.claim();
});
// Fetch: stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
            // Update cache with fresh version asynchronously
            caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
        });
        // Return cached first if exists, else wait for network
        return cachedResponse || fetchPromise;
    }));
});
