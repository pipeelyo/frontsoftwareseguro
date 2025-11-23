'use client';

import { useState, useEffect } from 'react';

export default function EditIncidentModal({ incident, isOpen, onClose, onSave }: { incident: any, isOpen: boolean, onClose: () => void, onSave: (updatedIncident: any) => void }) {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (incident) {
      setDescription(incident.description);
    }
  }, [incident]);

  if (!isOpen) return null;

  const handleSaveChanges = async () => {
    const response = await fetch(`/api/incidents/${incident._id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      }
    );

    if (response.ok) {
      const updatedIncident = await response.json();
      onSave(updatedIncident);
      onClose();
    } else {
      alert('Error al guardar los cambios.');
    }
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Editar Novedad</h3>
            <div className="mt-4">
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button onClick={handleSaveChanges} type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">
              Guardar Cambios
            </button>
            <button onClick={onClose} type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
