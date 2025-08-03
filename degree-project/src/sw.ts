/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();

const API_BASE = new URL(import.meta.env.VITE_API_BASE_URL);

precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler);
registerRoute(navigationRoute);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/users/me`,
  new StaleWhileRevalidate({
    cacheName: 'user-data-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/users/me/history`,
  new StaleWhileRevalidate({
    cacheName: 'user-history-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 1 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/users/me/favorites`,
  new StaleWhileRevalidate({
    cacheName: 'user-favorites-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 1 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/recipes/search`,
  new CacheFirst({
    cacheName: 'search-results-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/locations/subdivisions`,
  new StaleWhileRevalidate({
    cacheName: 'api-subdivisions-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname.startsWith(`${API_BASE.pathname}/tasks/`),
  new StaleWhileRevalidate({
    cacheName: 'api-tasks-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 1 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/recipes/scrape`,
  new StaleWhileRevalidate({
    cacheName: 'scraped-recipes-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    (url.pathname.startsWith(`${API_BASE.pathname}/allergies`) || url.pathname.startsWith(`${API_BASE.pathname}/diets`)),
  new CacheFirst({
    cacheName: 'static-recipe-options-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 2, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/recipes/ingredient-info`,
  new CacheFirst({
    cacheName: 'ingredient-info-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/supermarkets/supermarkets`,
  new StaleWhileRevalidate({
    cacheName: 'supermarkets-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 1 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname.startsWith(`${API_BASE.pathname}/recommendations`),
  new StaleWhileRevalidate({
    cacheName: 'recommendations-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 6 * 60 * 60 })],
  })
);

registerRoute(
  ({ request, url }) => request.destination === 'image' && url.origin !== self.origin,
  new StaleWhileRevalidate({
    cacheName: 'cross-origin-images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

registerRoute(
  ({ url, request }) =>
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE') &&
    url.origin === API_BASE.origin,
  new NetworkOnly()
);

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
