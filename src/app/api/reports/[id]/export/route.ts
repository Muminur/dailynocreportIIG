/**
 * Export Report API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { ReportModel } from '@/lib/db/models';
import { generateXLSX, generatePDF } from '@/lib/export';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'xlsx';

    const report = await ReportModel.findById(params.id);
    
    if (!report || report.userId !== session.user.email) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const exportData = {
      date: report.date,
      entries: report.entries,
      statistics: report.statistics,
    };

    if (format === 'xlsx') {
      const buffer = await generateXLSX(exportData);
      return new Response(new Uint8Array(buffer), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="report-${report.date.toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    if (format === 'pdf') {
      const blob = generatePDF(exportData);
      return new Response(blob, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="report-${report.date.toISOString().split('T')[0]}.pdf"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

