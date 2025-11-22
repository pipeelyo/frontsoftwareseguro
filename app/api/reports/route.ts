import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const userRole = req.headers.get('x-user-role');

  if (userRole !== 'CLIENTE' && userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  try {
    // In a real application, you would fetch data from the external API (AS-CLI)
    // For now, we return mock data.
    const mockReports = [
      { id: 'report-1', title: 'Reporte de Cumplimiento Semanal', date: '2023-10-27', status: 'Completado' },
      { id: 'report-2', title: 'Trazabilidad de Activos', date: '2023-10-26', status: 'En Progreso' },
      { id: 'report-3', title: 'Reporte de Desempeño Mensual', date: '2023-09-30', status: 'Completado' },
    ];

    return NextResponse.json(mockReports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
