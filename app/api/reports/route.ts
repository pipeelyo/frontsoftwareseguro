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
      {
        id: 'report-1',
        title: 'Reporte de Cumplimiento Semanal',
        date: '2023-10-27',
        status: 'Completado',
        details: {
          turnosCompletados: 138,
          turnosProgramados: 140,
          coberturaHoraria: '98.57%',
          incidentesReportados: 12,
          puntosDeControlVerificados: '99.8%',
          resumen: 'El cumplimiento general de los turnos fue alto, con una cobertura horaria casi total. Se reportaron 12 incidentes menores, todos resueltos según el protocolo. La verificación de puntos de control fue excelente.'
        }
      },
      {
        id: 'report-2',
        title: 'Trazabilidad de Activos',
        date: '2023-10-26',
        status: 'En Progreso',
        details: {
          activosMonitoreados: 50,
          activosConNovedad: 2,
          ultimaUbicacionConocida: 'Bodega Central, Zona Franca',
          resumen: 'El 96% de los activos se encuentran en su ubicación esperada. Se ha perdido la señal de dos dispositivos, se ha iniciado protocolo de búsqueda.'
        }
      },
      {
        id: 'report-3',
        title: 'Reporte de Desempeño Mensual',
        date: '2023-09-30',
        status: 'Completado',
        details: {
          tiempoRespuestaPromedio: '5 minutos',
          incidentesResueltos: '95%',
          satisfaccionCliente: '4.8/5',
          resumen: 'El desempeño general del equipo ha sido excelente, con tiempos de respuesta rápidos y una alta tasa de resolución de incidentes. La satisfacción del cliente se mantiene en niveles muy altos.'
        }
      },
    ];

    return NextResponse.json(mockReports);

  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
