import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AlumnoAdd } from './components/AlumnoAdd';
import { AlumnoList } from './components/AlumnoList';
import { usePushNotifications } from './hooks/usePushNotification';
import { useEffect } from 'react';


export default function App() {
  const { subscription, error, subscribeUser } = usePushNotifications();
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let isMounted = true;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        if (isMounted) {
          console.log('✅ Service Worker registrado con éxito. Scope:', registration.scope);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('❌ Falló el registro del Service Worker:', err);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <BrowserRouter>
      <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
        {subscription ? (
          <div style={{ color: 'green', fontWeight: 'bold' }}>
            ✅ ¡Estás suscrito para recibir notificaciones push!
          </div>
        ) : (
          <button
            onClick={subscribeUser}
            style={{ padding: '10px 20px', fontSize: '1rem', backgroundColor: '#0d6efd', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Activar Notificaciones Push
          </button>
        )}

        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
      <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc' }}>

        {/* Barra de navegación superior con Links */}
        <nav style={styles.nav}>
          <Link to="/" style={styles.link}>🏠 Ver Clientes</Link>
          <Link to="/nuevo" style={styles.link}>➕ Registrar Cliente</Link>
        </nav>

        {/* Contenedor donde cambian las páginas dinámicamente */}
        <main style={{ padding: '2rem' }}>
          <Routes>
            <Route path="/" element={<AlumnoList />} />
            <Route path="/nuevo" element={<AlumnoAdd />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  );
}

// Estilos sencillos para el menú
const styles = {
  nav: {
    display: 'flex',
    gap: '1.5rem',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  link: {
    textDecoration: 'none',
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: '1rem'
  }
};