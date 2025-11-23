'use client';

const dataCatalog = [
  {
    name: 'Información de Usuario',
    description: 'Datos personales de los usuarios, incluyendo nombre, email y rol.',
    classification: 'PII (Información Personalmente Identificable)',
    retentionPolicy: 'Hasta la eliminación de la cuenta + 1 año',
  },
  {
    name: 'Registros de Turno',
    description: 'Detalles de los turnos de los vigilantes, incluyendo horas de inicio/fin y estado.',
    classification: 'Confidencial',
    retentionPolicy: '5 años',
  },
  {
    name: 'Novedades de Turno (Incidentes)',
    description: 'Reportes de incidentes ocurridos durante un turno.',
    classification: 'Confidencial',
    retentionPolicy: '5 años',
  },
  {
    name: 'Logs de Auditoría',
    description: 'Registros de todas las acciones críticas realizadas en el sistema.',
    classification: 'Estrictamente Confidencial',
    retentionPolicy: '7 años',
  },
];

const retentionPolicies = [
  {
    name: 'Política de Retención Estándar (5 años)',
    description: 'Los datos operativos, como turnos e incidentes, se conservan durante 5 años por motivos de auditoría y análisis histórico. Pasado este tiempo, se anonimizan o eliminan de forma segura.',
  },
  {
    name: 'Política de Retención de Auditoría (7 años)',
    description: 'Los registros de auditoría se mantienen durante 7 años para cumplir con normativas de seguridad y cumplimiento. Son de acceso restringido.',
  },
  {
    name: 'Política de Cuentas de Usuario',
    description: 'La información personal del usuario se elimina 1 año después de que el usuario solicita la eliminación de su cuenta, para permitir la recuperación en caso de solicitud accidental.',
  },
];

export default function DataGovernancePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Catálogo de Datos y Políticas de Retención</h1>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold">Catálogo de Datos</h2>
        <div className="mt-4 bg-white shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Dato</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clasificación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Política de Retención</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dataCatalog.map((item) => (
                <tr key={item.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-500">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.classification.includes('PII') ? 'bg-yellow-100 text-yellow-800' : item.classification.includes('Confidencial') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.classification}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.retentionPolicy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold">Políticas de Retención Activas</h2>
        <div className="mt-4 space-y-4">
          {retentionPolicies.map((policy) => (
            <div key={policy.name} className="p-4 border rounded-lg bg-white">
              <h3 className="font-semibold text-gray-900">{policy.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
