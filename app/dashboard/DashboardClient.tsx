'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Define types for decoded token and user roles
interface DecodedToken {
  userId: string;
  role: 'VIGILANTE' | 'SUPERVISOR' | 'ADMIN' | 'CLIENTE' | 'ADMINISTRATIVO';
  exp: number;
}

// Re-define components here as they are needed by the client
const IncidentForm = ({ shiftId }: { shiftId: string }) => {
  const [description, setDescription] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const location = { lat: 0, lon: 0 };
    const response = await fetch('/api/incidents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description, location }) });
    if (response.ok) { alert('Novedad registrada con éxito'); setDescription(''); } else { alert('Error al registrar la novedad'); }
  };
  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Registrar Novedad</h3>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 mt-2 border rounded" placeholder="Describe la novedad..." required />
      <button type="submit" className="px-4 py-2 mt-2 text-white bg-blue-600 rounded">Enviar Novedad</button>
    </form>
  );
};

const VigilanteDashboard = () => {
  const [activeShift, setActiveShift] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkActiveShift = async () => {
    try {
      const response = await fetch('/api/shifts/my-active-shift');
      if (response.ok) { setActiveShift(await response.json()); }
    } catch (error) { console.error('Error fetching active shift:', error); } finally { setLoading(false); }
  };
  useEffect(() => { checkActiveShift(); }, []);
  const handleStartShift = async () => {
    const location = { lat: 0, lon: 0 };
    const response = await fetch('/api/shifts/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location }) });
    if (response.ok) { setActiveShift(await response.json()); alert('Turno iniciado con éxito'); }
  };
  const handleEndShift = async () => {
    const location = { lat: 0, lon: 0 };
    const response = await fetch('/api/shifts/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location }) });
    if (response.ok) { setActiveShift(null); alert('Turno finalizado con éxito'); }
  };
  if (loading) return <p>Cargando...</p>;
  return (
    <div className="p-4">
      <div className="mt-4">
        {activeShift ? (
          <div>
            <button onClick={handleEndShift} className="px-4 py-2 text-white bg-red-600 rounded">Finalizar Turno</button>
            <IncidentForm shiftId={(activeShift as any)._id} />
          </div>
        ) : <button onClick={handleStartShift} className="px-4 py-2 text-white bg-green-600 rounded">Iniciar Turno</button>}
      </div>
    </div>
  );
};

const AdminSection = () => (
  <div className="mt-8 p-4 border-t">
    <h2 className="text-xl font-bold">Panel de Administración</h2>
    <div className="mt-4"><a href="/audit" className="px-4 py-2 text-white bg-gray-700 rounded">Ver Log de Auditoría</a></div>
  </div>
);

const SupervisorDashboard = ({ userRole }: { userRole: DecodedToken['role'] }) => {
  const [shifts, setShifts] = useState([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  useEffect(() => {
    const fetchShifts = async () => {
      const response = await fetch('/api/shifts');
      if (response.ok) { setShifts(await response.json()); }
    };
    fetchShifts();
  }, []);
  const handleShiftClick = async (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setLoadingIncidents(true);
    try {
      const response = await fetch(`/api/incidents?shiftId=${shiftId}`);
      if (response.ok) { setIncidents(await response.json()); }
    } catch (error) { console.error('Error fetching incidents:', error); setIncidents([]); } finally { setLoadingIncidents(false); }
  };
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard del Supervisor</h1>
      {userRole === 'ADMIN' && (
        <div className="mt-8 p-4 border-t border-dashed">
          <h2 className="text-xl font-bold text-gray-600">Panel de Acciones de Vigilante</h2>
          <VigilanteDashboard />
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-xl">Turnos Recientes</h2>
        <ul className="mt-2">
          {shifts.map((shift: any) => (
            <li key={shift._id} className="p-2 border-b cursor-pointer hover:bg-gray-100" onClick={() => handleShiftClick(shift._id)}>
              {shift.userId.name} - {shift.status} - {new Date(shift.startTime).toLocaleString()}
            </li>
          ))}
        </ul>
        {selectedShiftId && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Novedades del Turno</h3>
            {loadingIncidents ? <p>Cargando novedades...</p> : (
              <ul>
                {incidents.length > 0 ? incidents.map((incident: any) => (
                  <li key={incident._id} className="p-2 border-t">{incident.description}</li>
                )) : <p>No hay novedades para este turno.</p>}
              </ul>
            )}
          </div>
        )}
      </div>
      {userRole === 'ADMIN' && <AdminSection />}
    </div>
  );
};

export default function DashboardClient({ token }: { token: string | undefined }) {
  const [userRole, setUserRole] = useState<DecodedToken['role'] | null>(null);

  useEffect(() => {
    console.log(`[Dashboard Client] Token from props: ${token ? 'found' : 'not found'}`);
    if (token) {
      try {
        console.log('[Dashboard Client] Decoding token...');
        const decoded = jwtDecode<DecodedToken>(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
    }
  }, [token]);

  if (!userRole) {
    return <p>Cargando o no autorizado...</p>;
  }

  switch (userRole) {
    case 'VIGILANTE':
      return <VigilanteDashboard />;
    case 'SUPERVISOR':
    case 'ADMIN':
      return <SupervisorDashboard userRole={userRole} />;
    default:
      return <p>Acceso no permitido a este dashboard para el rol '{userRole}'.</p>;
  }
}
