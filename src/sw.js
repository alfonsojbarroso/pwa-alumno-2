// public/sw.js - Service Worker Estático Puro

self.addEventListener('install', (event) => {
    console.log('[SW] Instalado correctamente V1.0.0');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activado y en ejecución');
    event.waitUntil(clients.claim());
});

// Escucha el evento push enviado desde el backend (Spring Boot / web-push)
self.addEventListener('push', (event) => {
    console.log('[SW] ¡Evento push recibido en el navegador!', event);

    let data = { title: 'Notificación PWA', body: 'Tienes un mensaje nuevo.' };

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        vibrate: [100, 50, 100]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Opcional: Manejar clic en la notificación
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            if (clientList.length > 0) {
                let client = clientList[0];
                return client.focus();
            }
            return clients.openWindow('/');
        })
    );
});