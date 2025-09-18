// OMA Digital Service Worker - Offline Support & Performance Caching
// Version: 1.0.0
// Date: 2025-09-01

const CACHE_NAME = 'oma-digital-v2.2';
const urlsToCache = [
  '/',
  '/images/logo.webp',
  '/videos/hero1.webm',
  '/videos/hero2.webm',
  '/videos/hero3.webm',
  '/videos/hero4.webm',
  '/videos/hero5.webm',
  '/_next/static/css/',
  '/_next/static/js/',
  '/fonts/', // Cache font files
  '/manifest.json' // Cache manifest file
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache-first strategy with network fallback and stale-while-revalidate
async function cacheFirstWithNetworkFallback(request) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    
    // For critical assets, return cached version immediately
    const isCriticalAsset = request.url.includes('/images/') || 
                          request.url.includes('/videos/') || 
                          request.url.includes('/_next/static/');
    
    if (cachedResponse && isCriticalAsset) {
      // For critical assets, return cached version immediately and update in background
      updateCacheInBackground(request);
      return cachedResponse;
    }
    
    // If not in cache or not critical, fetch from network
    const networkResponse = await fetch(request);
    
    // Only cache successful responses that are not partial (status 206)
    // Also exclude API routes and dynamic content
    const shouldCache = networkResponse && 
        networkResponse.status === 200 && 
        networkResponse.type === 'basic' &&
        !networkResponse.headers.get('content-range') &&
        !networkResponse.headers.get('content-encoding') &&
        !request.url.includes('/api/') &&
        !request.url.includes('_next/webpack-hmr') &&
        request.method === 'GET';
    
    if (shouldCache) {
      try {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseToCache);
      } catch (cacheError) {
        // Silently fail cache operations to avoid breaking the app
        console.log('Cache operation failed:', cacheError);
      }
    }
    
    // Return network response if available, otherwise cached response
    return networkResponse || cachedResponse;
  } catch (error) {
    // Try to return cached response as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    console.log('Fetch failed; returning offline page instead.', error);
    // You could return a cached offline page here
    throw error;
  }
}

// Update cache in background for stale-while-revalidate pattern
async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, responseToCache);
    }
  } catch (error) {
    console.log('Background cache update failed:', error);
  }
}

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // COMPLETELY DISABLE in development to avoid ALL cache issues
  if (self.location.hostname === 'localhost' || 
      self.location.hostname === '127.0.0.1' ||
      self.location.port === '3000' ||
      self.location.port === '3001' ||
      self.location.port === '3002' ||
      self.location.port === '3003' ||
      self.location.port === '3004' ||
      self.location.port === '3005' ||
      self.location.port === '3006' ||
      self.location.port === '3007' ||
      self.location.port === '3008' ||
      self.location.port === '3009') {
    // Skip ALL requests in development
    return;
  }

  // Only cache in production
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin) ||
      event.request.url.includes('/api/') ||
      event.request.url.includes('_next/webpack-hmr') ||
      event.request.url.includes('hot-update')) {
    return;
  }

  event.respondWith(cacheFirstWithNetworkFallback(event.request));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'OMA Digital';
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/images/logo.webp',
      badge: '/images/logo.webp',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
