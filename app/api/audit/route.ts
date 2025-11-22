import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User'; // Import User model to ensure schema is registered

export async function GET(req: NextRequest) {
  const userRole = req.headers.get('x-user-role');

  if (userRole !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format') || 'json'; // Default to json

  try {
    await dbConnect();

    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).populate('userId', 'name email');

    if (format === 'csv') {
      let csv = 'timestamp,action,userId,userName,userEmail,details,ipAddress\n';
      logs.forEach((log: any) => {
        const details = JSON.stringify(log.details || {}).replace(/"/g, '""');
        csv += `${log.timestamp.toISOString()},${log.action},${log.userId?._id || ''},${log.userId?.name || ''},${log.userId?.email || ''},"${details}",${log.ipAddress || ''}\n`;
      });

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="audit_log.csv"',
        },
      });
    }

    // Default to JSON
    return NextResponse.json(logs);

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
