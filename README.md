# PWA Alumno 2

Aplicación web progresiva (PWA) desarrollada con React + Vite para gestionar alumnos y permitir recibir notificaciones push desde un backend o servicio de mensajería.

## Descripción general

Esta app combina un flujo de administración de alumnos con soporte de notificaciones push en navegador. Cuando el usuario acepta el permiso, el navegador crea una suscripción push y la app puede recibir mensajes incluso cuando la pestaña no está abierta.

## Tecnologías principales

- React 19
- Vite
- Vite PWA (`vite-plugin-pwa`)
- Service Worker (`public/sw.js`)
- Web Push API / PushManager
- Notifications API

## Estructura relevante

- `src/App.jsx`: registra el Service Worker y muestra el botón para activar notificaciones.
- `src/hooks/usePushNotification.js`: lógica de suscripción push, permisos y conversión de la clave VAPID pública.
- `public/sw.js`: escucha los eventos `push` y `notificationclick`.
- `vite.config.js`: configuración del manifiesto PWA y metadata de la aplicación.

## ¿Qué son las notificaciones push?

Las notificaciones push son mensajes que un servidor envía al navegador, sin necesidad de que la aplicación esté abierta. En este proyecto, la app utiliza el navegador como cliente y el backend puede enviar mensajes usando la API Web Push.

El flujo típico es:

1. El usuario hace clic en "Activar Notificaciones Push".
2. La app pide permiso con `Notification.requestPermission()`.
3. El navegador crea una suscripción usando `registration.pushManager.subscribe()`.
4. La suscripción se envía al backend.
5. El backend usa la clave VAPID privada para enviar el push.
6. El Service Worker recibe el evento `push` y ejecuta `showNotification()`.

## Configuración de notificaciones push

### 1. Claves VAPID

Para enviar mensajes push, el backend necesita un par de claves VAPID (Voluntary Application Server Identification): pública y privada.

La clave pública se usa en el frontend para crear la suscripción y debe ser válida en el formato Base64 URL-safe.

Se genera de esta forma:

```bash
npx web-push generate-vapid-keys
```

Salida esperada:

```text
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nks8Wk
Private Key: 12345abcdef... 
```

Importante:

- La clave pública se coloca en el frontend, por ejemplo en `src/hooks/usePushNotification.js`.
- La clave privada debe permanecer en el servidor backend y nunca exponerse al navegador.
- La propiedad `userVisibleOnly: true` indica que la notificación debe ser visible para el usuario.

### 2. Configuración del frontend

En `src/hooks/usePushNotification.js` se hace lo siguiente:

```js
const publicVapidKey = 'BGKWM3fraRMc-hEOoOgYe8Gf-qN5Ze22yM_K5_oQrqCr5H4VUms-DOgDqN6DUfNeUrlbh7K7gmnzjl1rLJi2Ikw';

const sub = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
});
```

La función `urlBase64ToUint8Array()` convierte la llave pública VAPID a un `Uint8Array` que el navegador acepta para crear la suscripción.

### 3. Registro del Service Worker

En `src/App.jsx` se registra el archivo `sw.js`.

```js
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => console.log('Service Worker registrado'))
      .catch((error) => console.error('Error de registro', error));
  });
}
```

Esto es necesario porque el Service Worker es quien recibe el evento `push` y muestra la notificación al usuario.

## Configuración del Service Worker

El archivo `public/sw.js` escucha dos eventos importantes:

### `push`

Cuando el backend envía una notificación, el navegador dispara el evento `push` y el service worker ejecuta `showNotification()`.

```js
self.addEventListener('push', (event) => {
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

  event.waitUntil(self.registration.showNotification(data.title, options));
});
```

### `notificationclick`

Cuando el usuario hace clic en la notificación, el service worker puede cerrarla y abrir la aplicación:

```js
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
```

## Manifest y configuración PWA

El archivo `vite.config.js` define información de la PWA, como nombre, colores y iconos:

```js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Mi PWA de Notificaciones',
    short_name: 'PWA Push',
    description: 'Aplicación Web Progresiva con React y Push Notifications',
    theme_color: '#0d6efd',
    background_color: '#ffffff',
    display: 'standalone',
    icons: [
      { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
})
```

Esto ayuda a que la app se comporte como una aplicación nativa instalada, con iconos y apariencia propia del sistema operativo.

## Requisitos de navegador

La funcionalidad push requiere:

- HTTPS o localhost
- Soporte de `Notification` API
- Soporte de `Service Worker`
- Soporte de `PushManager`

En navegadores modernos (Chrome, Edge, Firefox con compatibilidad parcial) suele funcionar correctamente.

## Flujo de integración con backend

La aplicación front-end solo crea la suscripción. El backend debe:

1. Recibir la suscripción del usuario.
2. Guardarla en base de datos.
3. Enviar una petición push con la clave privada VAPID.
4. Incluir en el payload un `title` y `body`.

Ejemplo de payload:

```json
{
  "title": "Recordatorio",
  "body": "Tienes un alumno pendiente por revisar."
}
```

El backend puede enviar la notificación a todos los dispositivos registrados para que el navegador la muestre a través del Service Worker.

## Ejecución local

Instalar dependencias:

```bash
npm install
```

Iniciar la app en modo desarrollo:

```bash
npm run dev
```

Crear build de producción:

```bash
npm run build
```

Previsualizar producción:

```bash
npm run preview
```

## Notas importantes

- La suscripción push no se puede crear si el usuario no acepta las notificaciones.
- El navegador puede bloquear la funcionalidad si la app no está sobre HTTPS en producción.
- La clave privada VAPID nunca debe alojarse en el cliente.
- El backend debe mantener una lista de suscripciones para enviar mensajes a cada usuario o a todos los clientes registrados.

## Resumen

El proyecto demuestra cómo implementar una PWA con soporte de notificaciones push usando React, Service Worker y claves VAPID. La parte visual de la app permite activar el permiso y suscribirse; la parte técnica del navegador recibe el push y muestra la notificación, mientras que el servidor es responsable de enviar mensajes a los dispositivos conectados.


### Author

||
|:--:|
|Dr. Alfonso José Barroso Barajas |
|Technology Architect|