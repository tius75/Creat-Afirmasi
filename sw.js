const CACHE_NAME = 'Pembuat-Afirmasi-Video-cache-v3'; // Ubah versi cache setiap kali Anda mengubah file yang di-cache
// Daftar file penting yang akan disimpan untuk mode offline
const URLS_TO_CACHE = [
  './', // Ini adalah root aplikasi, misal: https://tius75.github.io/Creat-Afirmasi/
  './index.html',
  './manifest.json',
  './favicon32.png', // Tambahkan favicon
  './logo.png',
  './logo192.png'
  // Tambahkan semua file statis lain yang penting untuk aplikasi Anda (CSS, JS, dll.)
  // Contoh:
  // './css/style.css',
  // './js/main.js',
];

// Event saat Service Worker di-install
self.addEventListener('install', event => {
  console.log('Service Worker: Menginstal...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache dibuka, menambahkan URL ke cache.');
        return cache.addAll(URLS_TO_CACHE)
          .then(() => {
            console.log('Service Worker: Semua URL berhasil di-cache.');
            // Force the waiting service worker to become active
            // self.skipWaiting(); // Opsional: Ini akan membuat Service Worker baru langsung aktif tanpa menunggu halaman di-reload
          })
          .catch(error => {
            console.error('Service Worker: Gagal menambahkan URL ke cache:', error);
          });
      })
  );
});

// Event saat ada permintaan jaringan (fetch)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, langsung berikan dari cache
        if (response) {
          console.log('Service Worker: Melayani dari cache:', event.request.url);
          return response;
        }
        // Jika tidak, coba ambil dari jaringan
        console.log('Service Worker: Mengambil dari jaringan:', event.request.url);
        return fetch(event.request)
          .catch(error => {
            console.error('Service Worker: Fetch gagal untuk', event.request.url, error);
            // Anda bisa mengembalikan fallback page di sini jika fetch gagal (misal untuk offline)
            // if (event.request.mode === 'navigate') {
            //   return caches.match('/offline.html'); // Contoh: jika Anda punya halaman offline.html
            // }
            throw error; // Melemparkan error jika tidak ada fallback
          });
      })
  );
});

// Event saat Service Worker diaktifkan (activate)
// Ini adalah tempat terbaik untuk membersihkan cache lama
self.addEventListener('activate', event => {
  console.log('Service Worker: Mengaktifkan...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Menghapus cache lama:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
        console.log('Service Worker: Cache lama berhasil dibersihkan.');
        // Claim clients immediately so the new service worker can control all pages
        // self.clients.claim(); // Opsional: Ini akan mengambil alih kontrol atas semua klien yang terbuka
    })
  );
});
