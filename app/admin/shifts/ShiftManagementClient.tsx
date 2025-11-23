'use client';

import { useState } from 'react';
import EditShiftModal from './EditShiftModal';

export default function ShiftManagementClient({ initialShifts }: { initialShifts: any[] }) {
  const [shifts, setShifts] = useState(initialShifts);
  const [selectedShift, setSelectedShift] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (shift: any) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedShift(null);
  };

  const handleSaveShift = (updatedShift: any) => {
    setShifts(shifts.map(s => s._id === updatedShift._id ? updatedShift : s));
  };

  return (
    <>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fin</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Novedades</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {shifts.map((shift: any) => (
              <tr key={shift._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{shift.userId?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-500">{shift.userId?.email || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(shift.startTime).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shift.endTime ? new Date(shift.endTime).toLocaleString() : 'En progreso'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{shift.incidents && shift.incidents.length > 0 ? shift.incidents.map((i: { description: string }) => i.description).join(', ') : 'Sin novedades'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEditClick(shift)} className="text-indigo-600 hover:text-indigo-900">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedShift && (
        <EditShiftModal
          shift={selectedShift}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveShift}
        />
      )}
    </>
  );
}
