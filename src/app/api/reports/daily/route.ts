import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

interface DailyReport {
  date: string;
  total_events: number;
  total_conversions: number;
  total_value: number;
  top_source: string;
  conversion_rate: number;
  cost_per_acquisition: number;
  events_by_type: {
    page_views: number;
    form_submissions: number;
    phone_clicks: number;
    whatsapp_clicks: number;
  };
  sources_performance: Array<{
    source: string;
    events: number;
    conversions: number;
    value: number;
  }>;
}

async function generateDailyReport(date: string): Promise<DailyReport> {
  // Get total events for the day
  const totalEventsResult = await sql`
    SELECT COUNT(*) as total_events
    FROM analytics_events 
    WHERE DATE(created_at) = ${date}
  `;

  // Get total conversions (form submissions, phone clicks, whatsapp clicks)
  const conversionsResult = await sql`
    SELECT COUNT(*) as total_conversions, SUM(COALESCE(value, 0)) as total_value
    FROM analytics_events 
    WHERE DATE(created_at) = ${date}
    AND event_name IN ('form_submission', 'phone_click', 'whatsapp_click')
  `;

  // Get events by type
  const eventsByTypeResult = await sql`
    SELECT 
      event_name,
      COUNT(*) as count
    FROM analytics_events 
    WHERE DATE(created_at) = ${date}
    GROUP BY event_name
  `;

  // Get top performing source
  const topSourceResult = await sql`
    SELECT 
      campaign_source,
      COUNT(*) as events,
      COUNT(CASE WHEN event_name IN ('form_submission', 'phone_click', 'whatsapp_click') THEN 1 END) as conversions,
      SUM(COALESCE(value, 0)) as value
    FROM analytics_events 
    WHERE DATE(created_at) = ${date}
    AND campaign_source IS NOT NULL
    GROUP BY campaign_source
    ORDER BY conversions DESC, events DESC
    LIMIT 10
  `;

  const totalEvents = parseInt(totalEventsResult.rows[0]?.total_events || '0');
  const totalConversions = parseInt(conversionsResult.rows[0]?.total_conversions || '0');
  const totalValue = parseFloat(conversionsResult.rows[0]?.total_value || '0');

  // Process events by type
  const eventsByType = {
    page_views: 0,
    form_submissions: 0,
    phone_clicks: 0,
    whatsapp_clicks: 0,
  };

  eventsByTypeResult.rows.forEach(row => {
    switch (row.event_name) {
      case 'page_view':
        eventsByType.page_views = parseInt(row.count);
        break;
      case 'form_submission':
        eventsByType.form_submissions = parseInt(row.count);
        break;
      case 'phone_click':
        eventsByType.phone_clicks = parseInt(row.count);
        break;
      case 'whatsapp_click':
        eventsByType.whatsapp_clicks = parseInt(row.count);
        break;
    }
  });

  // Process sources performance
  const sourcesPerformance = topSourceResult.rows.map(row => ({
    source: row.campaign_source,
    events: parseInt(row.events),
    conversions: parseInt(row.conversions || '0'),
    value: parseFloat(row.value || '0'),
  }));

  const topSource = sourcesPerformance[0]?.source || 'direct';
  const conversionRate = totalEvents > 0 ? (totalConversions / totalEvents) * 100 : 0;
  const costPerAcquisition = totalConversions > 0 ? totalValue / totalConversions : 0;

  return {
    date,
    total_events: totalEvents,
    total_conversions: totalConversions,
    total_value: totalValue,
    top_source: topSource,
    conversion_rate: conversionRate,
    cost_per_acquisition: costPerAcquisition,
    events_by_type: eventsByType,
    sources_performance: sourcesPerformance,
  };
}

async function sendEmailReport(report: DailyReport) {
  // In a real application, you would integrate with an email service like SendGrid, Resend, or AWS SES
  // For now, we'll just log the report
  
  const emailContent = `
    📊 RELATÓRIO DIÁRIO - ${new Date(report.date).toLocaleDateString('pt-BR')}
    
    📈 RESUMO GERAL:
    • Total de Eventos: ${report.total_events.toLocaleString()}
    • Conversões: ${report.total_conversions}
    • Valor Total: $${report.total_value.toFixed(2)}
    • Taxa de Conversão: ${report.conversion_rate.toFixed(2)}%
    • CPA: $${report.cost_per_acquisition.toFixed(2)}
    • Top Fonte: ${report.top_source}
    
    📱 EVENTOS POR TIPO:
    • Visualizações: ${report.events_by_type.page_views}
    • Formulários: ${report.events_by_type.form_submissions}
    • Telefone: ${report.events_by_type.phone_clicks}
    • WhatsApp: ${report.events_by_type.whatsapp_clicks}
    
    🎯 TOP FONTES:
    ${report.sources_performance.map(source => 
      `• ${source.source}: ${source.events} eventos, ${source.conversions} conversões, $${source.value.toFixed(2)}`
    ).join('\n')}
    
    🔗 Dashboard: https://fly2any.com/admin/campanhas
  `;

  console.log('📧 Daily Report Email Content:', emailContent);
  
  // TODO: Replace with actual email sending logic
  // await sendEmail({
  //   to: process.env.ADMIN_EMAIL,
  //   subject: `Fly2Any - Relatório Diário ${report.date}`,
  //   text: emailContent
  // });
}

async function storeReport(report: DailyReport) {
  try {
    // Create daily_reports table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id SERIAL PRIMARY KEY,
        report_date DATE UNIQUE NOT NULL,
        total_events INTEGER DEFAULT 0,
        total_conversions INTEGER DEFAULT 0,
        total_value DECIMAL(10,2) DEFAULT 0,
        top_source VARCHAR(100),
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        cost_per_acquisition DECIMAL(10,2) DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        form_submissions INTEGER DEFAULT 0,
        phone_clicks INTEGER DEFAULT 0,
        whatsapp_clicks INTEGER DEFAULT 0,
        sources_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert or update daily report
    await sql`
      INSERT INTO daily_reports (
        report_date,
        total_events,
        total_conversions,
        total_value,
        top_source,
        conversion_rate,
        cost_per_acquisition,
        page_views,
        form_submissions,
        phone_clicks,
        whatsapp_clicks,
        sources_data
      ) VALUES (
        ${report.date},
        ${report.total_events},
        ${report.total_conversions},
        ${report.total_value},
        ${report.top_source},
        ${report.conversion_rate},
        ${report.cost_per_acquisition},
        ${report.events_by_type.page_views},
        ${report.events_by_type.form_submissions},
        ${report.events_by_type.phone_clicks},
        ${report.events_by_type.whatsapp_clicks},
        ${JSON.stringify(report.sources_performance)}
      )
      ON CONFLICT (report_date) 
      DO UPDATE SET
        total_events = EXCLUDED.total_events,
        total_conversions = EXCLUDED.total_conversions,
        total_value = EXCLUDED.total_value,
        top_source = EXCLUDED.top_source,
        conversion_rate = EXCLUDED.conversion_rate,
        cost_per_acquisition = EXCLUDED.cost_per_acquisition,
        page_views = EXCLUDED.page_views,
        form_submissions = EXCLUDED.form_submissions,
        phone_clicks = EXCLUDED.phone_clicks,
        whatsapp_clicks = EXCLUDED.whatsapp_clicks,
        sources_data = EXCLUDED.sources_data,
        created_at = CURRENT_TIMESTAMP
    `;

    console.log(`📊 Daily report stored for ${report.date}`);
  } catch (error) {
    console.error('Error storing daily report:', error);
    throw error;
  }
}

// Manual trigger for daily report generation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, send_email = false } = body;
    
    // Default to yesterday if no date provided
    const reportDate = date || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    console.log(`📊 Generating daily report for ${reportDate}`);
    
    const report = await generateDailyReport(reportDate);
    await storeReport(report);
    
    if (send_email) {
      await sendEmailReport(report);
    }
    
    return NextResponse.json({
      success: true,
      report,
      message: `Daily report generated for ${reportDate}`
    });
    
  } catch (error) {
    console.error('Error generating daily report:', error);
    return NextResponse.json(
      { error: 'Failed to generate daily report' },
      { status: 500 }
    );
  }
}

// Get historical daily reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    await sql`
      CREATE TABLE IF NOT EXISTS daily_reports (
        id SERIAL PRIMARY KEY,
        report_date DATE UNIQUE NOT NULL,
        total_events INTEGER DEFAULT 0,
        total_conversions INTEGER DEFAULT 0,
        total_value DECIMAL(10,2) DEFAULT 0,
        top_source VARCHAR(100),
        conversion_rate DECIMAL(5,2) DEFAULT 0,
        cost_per_acquisition DECIMAL(10,2) DEFAULT 0,
        page_views INTEGER DEFAULT 0,
        form_submissions INTEGER DEFAULT 0,
        phone_clicks INTEGER DEFAULT 0,
        whatsapp_clicks INTEGER DEFAULT 0,
        sources_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const result = await sql`
      SELECT * FROM daily_reports 
      WHERE report_date >= CURRENT_DATE - INTERVAL '${days} days'
      ORDER BY report_date DESC
    `;

    return NextResponse.json({
      success: true,
      reports: result.rows,
      period: `${days} days`
    });
    
  } catch (error) {
    console.error('Error fetching daily reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily reports' },
      { status: 500 }
    );
  }
}