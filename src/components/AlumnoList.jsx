import { useState, useEffect } from 'react';

export function AlumnoList() {
    const [Alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getAlumnos() {
            try {
                const response = await fetch('http://localhost:8080/alumno', {
                    headers: {
                        'Content-Type': 'application/json',
                        'flow': 'tu_valor_para_el_header'
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los datos del servidor');
                }

                const data = await response.json();
                setAlumnos(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        getAlumnos();
    }, []);

    if (loading) return <p>Cargando clientes...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h1>Lista de Clientes (React PWA)</h1>
            {Alumnos.map((Alumno) => (
                <div key={Alumno.id} style={{
                    background: '#fff',
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    borderLeft: '4px solid #2563eb'
                }}>
                    <h3>{Alumno.name}</h3>
                    <p>ID: {Alumno.id}</p>
                    <p>Teléfono: {Alumno.phone}</p>
                </div>
            ))}
        </div>
    );
}
