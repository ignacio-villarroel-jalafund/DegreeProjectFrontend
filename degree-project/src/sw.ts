/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';

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
  new NetworkFirst({ cacheName: 'user-data-cache' })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname === `${API_BASE.pathname}/recipes/search`,
  new StaleWhileRevalidate({ cacheName: 'api-search-cache' })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === API_BASE.origin &&
    url.pathname.startsWith(`${API_BASE.pathname}/tasks/`),
  new NetworkFirst({ cacheName: 'api-tasks-cache' })
);

registerRoute(
  ({ url, request }) =>
    request.method === 'POST' &&
    url.origin === API_BASE.origin &&
    (url.pathname.startsWith(`${API_BASE.pathname}/users`) ||
     url.pathname === `${API_BASE.pathname}/recipes/scrape` ||
     url.pathname === `${API_BASE.pathname}/recipes/analyze`),
  new NetworkOnly(),
  'POST'
);

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('Service Worker cargado con estrategias de caching actualizadas.');