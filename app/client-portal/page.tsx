'use client';

import { useState, useEffect } from 'react';

interface Report {
  id: string;
  title: string;
  date: string;
  status: string;
}

export default function ClientPortalPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports');
        if (!response.ok) {
          throw new Error('No autorizado para ver reportes.');
        }
        const data = await response.json();
        setReports(data);
      } catch (err: any) {
        setError(err.message || 'Error al cargar los reportes.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <p className="p-8">Cargando portal del cliente...</p>;
  }

  if (error) {
    return <p className="p-8 text-red-500">{error}</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Portal del Cliente</h1>
      <div className="mt-6">
        <h2 className="text-xl">Reportes de Servicio</h2>
        <ul className="mt-4 space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="p-4 border rounded-lg flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-500">Fecha: {report.date} - Estado: {report.status}</p>
              </div>
              <button className="px-4 py-2 text-sm text-white bg-blue-600 rounded">Descargar Certificado</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
