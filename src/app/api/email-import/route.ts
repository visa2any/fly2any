import { NextRequest, NextResponse } from 'next/server';
import { emailImportService } from '@/lib/email-import';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const action = formData.get('action') as string;

    if (action === 'sample') {
      // Retornar CSV de exemplo
      const sampleCSV = emailImportService.generateSampleCSV();
      return new NextResponse(sampleCSV, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="exemplo-emails.csv"'
        }
      });
    }

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum arquivo enviado' 
      }, { status: 400 });
    }

    // Verificar tipo de arquivo
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Apenas arquivos CSV são aceitos' 
      }, { status: 400 });
    }

    // Verificar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        error: 'Arquivo muito grande. Máximo 10MB.' 
      }, { status: 400 });
    }

    // Ler conteúdo do arquivo
    const csvContent = await file.text();
    
    // Processar CSV
    const result = await emailImportService.processCSV(csvContent);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'stats':
        const stats = await emailImportService.getContactStats();
        return NextResponse.json(stats);

      case 'contacts':
        const segment = searchParams.get('segment');
        const contacts = await emailImportService.getContactsBySegment(segment || undefined);
        return NextResponse.json({ contacts });

      case 'sample':
        const sampleCSV = emailImportService.generateSampleCSV();
        return new NextResponse(sampleCSV, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': 'attachment; filename="exemplo-emails.csv"'
          }
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Ação não especificada' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    }, { status: 500 });
  }
}