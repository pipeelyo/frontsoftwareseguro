import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import AuditLog from '@/models/AuditLog';
import User from '@/models/User'; // Ensure User model is registered

async function getAuditLogs() {
  await dbConnect();
  const logs = await AuditLog.find({}).sort({ timestamp: -1 }).populate('userId', 'name email').lean();
  return logs;
}

export default async function AuditPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  // This is a simplified check. In a real app, you'd verify the token.
  // For now, we assume if the middleware let them through, they are an admin.
  if (!token) {
    redirect('/');
  }

  const logs = await getAuditLogs();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Log de Auditoría</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log._id.toString()}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.userId ? (log.userId as any).name : 'Sistema'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ipAddress}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{JSON.stringify(log.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
