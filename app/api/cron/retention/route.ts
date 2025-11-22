import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import VerificationToken from '@/models/VerificationToken';
import AuditLog from '@/models/AuditLog';
import { logAuditEvent } from '@/lib/audit';

export async function GET(req: NextRequest) {
  // 1. Secure the endpoint
  const authHeader = req.headers.get('authorization');
  if (process.env.VERCEL_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    await dbConnect();

    // 2. Apply retention policy for Verification Tokens
    const oneDayAgo = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
    const deletedTokensResult = await VerificationToken.deleteMany({ expires: { $lt: oneDayAgo } });

    // 3. Apply retention policy for Audit Logs
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const deletedLogsResult = await AuditLog.deleteMany({ timestamp: { $lt: oneYearAgo } });

    // 4. Generate summary log (Automatic Audit Report)
    const summary = {
      deletedVerificationTokens: deletedTokensResult.deletedCount,
      deletedAuditLogs: deletedLogsResult.deletedCount,
    };

    console.log('Daily Retention Policy Execution Summary:', summary);
    await logAuditEvent({ action: 'CRON_RETENTION_SUCCESS', details: summary });

    return NextResponse.json({ success: true, summary });

  } catch (error: any) {
    console.error('Cron job failed:', error);
    await logAuditEvent({ action: 'CRON_RETENTION_FAILURE', details: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
