/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly, NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

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
  new NetworkFirst({
    cacheName: 'user-data-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    (url.pathname === `${API_BASE.pathname}/recipes/search` || url.pathname.startsWith(`${API_BASE.pathname}/recipes/details`)),
  new CacheFirst({
    cacheName: 'api-recipes-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/locations/subdivisions`,
  new NetworkFirst({
    cacheName: 'api-subdivisions-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname.startsWith(`${API_BASE.pathname}/tasks/`),
  new NetworkFirst({
    cacheName: 'api-tasks-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 1 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    true,
  new CacheFirst({
    cacheName: 'api-general-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'POST' &&
    url.origin === API_BASE.origin &&
    (
      url.pathname.startsWith(`${API_BASE.pathname}/users`) ||
      url.pathname === `${API_BASE.pathname}/recipes/scrape` ||
      url.pathname === `${API_BASE.pathname}/recipes/adapt`
    ),
  new NetworkOnly(),
  'POST'
);

registerRoute(
  ({ request, url }) => request.destination === 'image' && url.origin !== self.origin,
  new StaleWhileRevalidate({
    cacheName: 'cross-origin-images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker updated: /locations/subdivisions uses NetworkFirst, other general GETs CacheFirst.');