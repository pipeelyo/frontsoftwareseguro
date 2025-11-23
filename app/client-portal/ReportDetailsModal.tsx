'use client';

export default function ReportDetailsModal({ report, isOpen, onClose }: { report: any, isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles del Reporte</h3>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-md font-semibold text-gray-800">{report.title}</h4>
                <p className="text-sm text-gray-500">Fecha: {report.date} | Estado: {report.status}</p>
              </div>
              {report.details && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  {report.title === 'Reporte de Cumplimiento Semanal' ? (
                    <>
                      <h5 className="font-semibold mb-2">Detalles del Cumplimiento:</h5>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Turnos Completados:</strong> {report.details.turnosCompletados} / {report.details.turnosProgramados}</li>
                        <li><strong>Cobertura Horaria:</strong> {report.details.coberturaHoraria}</li>
                        <li><strong>Incidentes Reportados:</strong> {report.details.incidentesReportados}</li>
                        <li><strong>Puntos de Control Verificados:</strong> {report.details.puntosDeControlVerificados}</li>
                      </ul>
                      <p className="mt-4 pt-4 border-t border-gray-200"><strong>Resumen:</strong> {report.details.resumen}</p>
                    </>
                  ) : report.title === 'Trazabilidad de Activos' ? (
                    <>
                      <h5 className="font-semibold mb-2">Detalles de Trazabilidad:</h5>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Activos Monitoreados:</strong> {report.details.activosMonitoreados}</li>
                        <li><strong>Activos con Novedad:</strong> {report.details.activosConNovedad}</li>
                        <li><strong>Última Ubicación General:</strong> {report.details.ultimaUbicacionConocida}</li>
                      </ul>
                      <p className="mt-4 pt-4 border-t border-gray-200"><strong>Resumen:</strong> {report.details.resumen}</p>
                    </>
                  ) : report.title === 'Reporte de Desempeño Mensual' ? (
                    <>
                      <h5 className="font-semibold mb-2">Detalles del Desempeño:</h5>
                      <ul className="space-y-2 text-sm">
                        <li><strong>Tiempo de Respuesta Promedio:</strong> {report.details.tiempoRespuestaPromedio}</li>
                        <li><strong>Incidentes Resueltos:</strong> {report.details.incidentesResueltos}</li>
                        <li><strong>Satisfacción del Cliente:</strong> {report.details.satisfaccionCliente}</li>
                      </ul>
                      <p className="mt-4 pt-4 border-t border-gray-200"><strong>Resumen:</strong> {report.details.resumen}</p>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
