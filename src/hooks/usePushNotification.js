import { useState, useEffect } from 'react';

// Función auxiliar para convertir la llave VAPID pública a Uint8Array
function urlBase64ToUint8Array(base64String) {
    if (!base64String) {
        throw new Error("La clave VAPID pública está vacía o no está definida.");
    }

    // Rellenar caracteres faltantes de padding '=' si es necesario
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    try {
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    } catch (error) {
        console.error("Error al decodificar la cadena Base64:", base64);
        throw new Error("La clave VAPID pública no es una cadena Base64 válida.");
    }
}

export function usePushNotifications() {
    const [subscription, setSubscription] = useState(null);
    const [error, setError] = useState(null);

    const subscribeUser = async () => {
        try {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) {
                throw new Error('Las notificaciones Push no son soportadas por este navegador.');
            }

            const permissionResult = await Notification.requestPermission();
            if (permissionResult !== 'granted') {
                throw new Error('Permiso de notificaciones denegado por el usuario.');
            }

            const registration = await navigator.serviceWorker.ready;

            // Llave pública VAPID provista por tu servidor backend
            const publicVapidKey = 'BGKWM3fraRMc-hEOoOgYe8Gf-qN5Ze22yM_K5_oQrqCr5H4VUms-DOgDqN6DUfNeUrlbh7K7gmnzjl1rLJi2Ikw';
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
            });

            setSubscription(sub);
            console.log('Suscripción Push exitosa:', sub);

            // Aquí enviarías el objeto `sub` a tu servidor backend mediante una petición POST
            // await fetch('https://tu-api.com/subscribe', { method: 'POST', body: JSON.stringify(sub), ... });

        } catch (err) {
            console.error('Error al suscribir a push notifications:', err);
            setError(err.message);
        }
    };

    return { subscription, error, subscribeUser };
}