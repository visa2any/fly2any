import { NextRequest, NextResponse } from 'next/server';

export interface Campaign {
  id: number;
  name: string;
  type: string;
  destination: string;
  status: 'Ativa' | 'Pausada' | 'Finalizada' | 'Rascunho';
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  startDate: string;
  endDate: string;
  channels: string[];
  description: string;
  targetAudience: string;
  createdAt: string;
  updatedAt?: string;
}

const campaigns: Campaign[] = [
  {
    id: 1,
    name: 'Promoção Verão 2024',
    type: 'Email Marketing',
    destination: 'Caribe',
    status: 'Ativa',
    budget: 5000,
    spent: 3200,
    leads: 245,
    conversions: 18,
    startDate: '2024-01-15',
    endDate: '2024-03-15',
    channels: ['Email', 'Instagram', 'Google Ads'],
    description: 'Campanha promocional para destinos caribenhos com desconto de 20%',
    targetAudience: 'Casais, 25-45 anos, alta renda',
    createdAt: '2024-01-10T14:30:00'
  },
  {
    id: 2,
    name: 'Europa Cultural',
    type: 'Google Ads',
    destination: 'Europa',
    status: 'Pausada',
    budget: 8000,
    spent: 4500,
    leads: 189,
    conversions: 12,
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    channels: ['Google Ads', 'Facebook'],
    description: 'Pacotes culturais para principais cidades europeias',
    targetAudience: 'Famílias, 30-55 anos, interesse em cultura',
    createdAt: '2024-01-25T09:15:00'
  },
  {
    id: 3,
    name: 'Lua de Mel Maldivas',
    type: 'Instagram Ads',
    destination: 'Maldivas',
    status: 'Finalizada',
    budget: 3000,
    spent: 2850,
    leads: 98,
    conversions: 8,
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    channels: ['Instagram', 'WhatsApp'],
    description: 'Pacotes românticos para lua de mel nas Maldivas',
    targetAudience: 'Noivos, 25-40 anos, alta renda',
    createdAt: '2023-11-15T16:45:00'
  },
  {
    id: 4,
    name: 'Aventura Patagônia',
    type: 'Social Media',
    destination: 'Patagônia',
    status: 'Rascunho',
    budget: 6000,
    spent: 0,
    leads: 0,
    conversions: 0,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    channels: ['Instagram', 'Facebook', 'YouTube'],
    description: 'Expedições e trilhas na Patagônia Argentina e Chilena',
    targetAudience: 'Aventureiros, 20-50 anos, interesse em ecoturismo',
    createdAt: '2024-01-20T11:20:00'
  }
];

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');

    let filteredCampaigns = [...campaigns];

    if (status && status !== 'Todas') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }

    if (type && type !== 'Todos') {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.type === type);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(campaign => 
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.destination.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredCampaigns,
      total: campaigns.length
    });
  } catch (error) {
    console.error('Erro ao buscar campanhas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newCampaign: Campaign = {
      id: Math.max(...campaigns.map(c => c.id), 0) + 1,
      name: body.name,
      type: body.type,
      destination: body.destination,
      status: 'Rascunho',
      budget: body.budget,
      spent: 0,
      leads: 0,
      conversions: 0,
      startDate: body.startDate,
      endDate: body.endDate,
      channels: body.channels || [],
      description: body.description || '',
      targetAudience: body.targetAudience || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    campaigns.unshift(newCampaign);

    return NextResponse.json({
      success: true,
      data: newCampaign,
      message: 'Campanha criada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    campaigns[campaignIndex] = {
      ...campaigns[campaignIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: campaigns[campaignIndex],
      message: 'Campanha atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    const campaignIndex = campaigns.findIndex(campaign => campaign.id === id);
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada' },
        { status: 404 }
      );
    }

    const deletedCampaign = campaigns.splice(campaignIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedCampaign,
      message: 'Campanha excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir campanha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
