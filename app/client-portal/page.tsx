'use client';

import { useState, useEffect } from 'react';
import ReportDetailsModal from './ReportDetailsModal';

interface Report {
  id: string;
  title: string;
  date: string;
  status: string;
  details?: {
    turnosCompletados: number;
    turnosProgramados: number;
    coberturaHoraria: string;
    incidentesReportados: number;
    puntosDeControlVerificados: string;
    resumen: string;
  };
}

export default function ClientPortalPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <div className="bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => { setSelectedReport(report); setIsModalOpen(true); }} className="text-indigo-600 hover:text-indigo-900">Ver Detalles</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
