import type { Metadata } from "next";
import ResponsiveHeader from "@/components/ResponsiveHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Termos de Uso | Fly2Any",
  description: "Conheça os termos e condições de uso dos serviços da Fly2Any.",
  robots: "index, follow",
  openGraph: {
    title: "Termos de Uso | Fly2Any",
    description: "Conheça os termos e condições de uso dos serviços da Fly2Any.",
    url: "https://fly2any.com/termos-uso",
  },
};

export default function TermosUso() {
  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header Responsivo */}
      <ResponsiveHeader />

      {/* Background com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, #1e40af 0%, #a21caf 50%, #713f12 100%)',
        minHeight: 'calc(100vh - 70px)',
        paddingTop: '80px'
      }}>
        
        {/* Main Content */}
        <main style={{ paddingBottom: '80px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              
              {/* Card principal */}
              <div className="termos-card">
                <h1 className="termos-title">
                  Termos de Uso
                </h1>
                
                <div style={{ color: 'rgba(255, 255, 255, 0.9)', lineHeight: '1.7' }}>
                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>1. Aceitação dos Termos</h2>
                  <p style={{ marginBottom: '16px' }}>
                    Ao utilizar os serviços da Fly2Any, você concorda com estes termos de uso. 
                    Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
                  </p>
                  <p>
                    Estes termos constituem um acordo legal entre você e a Fly2Any e governam 
                    o uso de nossos serviços de consultoria e intermediação de viagens.
                  </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>2. Descrição dos Serviços</h2>
                  <p style={{ marginBottom: '16px' }}>A Fly2Any oferece serviços de:</p>
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '24px',
                    marginBottom: '16px'
                  }}>
                    <li style={{ marginBottom: '8px' }}>Consultoria e intermediação para passagens aéreas</li>
                    <li style={{ marginBottom: '8px' }}>Reservas de hotéis e acomodações</li>
                    <li style={{ marginBottom: '8px' }}>Aluguel de veículos</li>
                    <li style={{ marginBottom: '8px' }}>Seguro viagem e assistência</li>
                    <li style={{ marginBottom: '8px' }}>Pacotes de passeios e tours</li>
                    <li style={{ marginBottom: '8px' }}>Suporte e atendimento ao cliente</li>
                  </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>3. Responsabilidades do Cliente</h2>
                  <p style={{ marginBottom: '16px' }}>Ao utilizar nossos serviços, você se compromete a:</p>
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '24px',
                    marginBottom: '16px'
                  }}>
                    <li style={{ marginBottom: '8px' }}>Fornecer informações precisas e atualizadas</li>
                    <li style={{ marginBottom: '8px' }}>Verificar documentação necessária para viagem</li>
                    <li style={{ marginBottom: '8px' }}>Cumprir prazos de pagamento acordados</li>
                    <li style={{ marginBottom: '8px' }}>Seguir políticas das companhias aéreas e hotéis</li>
                    <li style={{ marginBottom: '8px' }}>Comunicar alterações ou cancelamentos em tempo hábil</li>
                  </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>4. Políticas de Pagamento</h2>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>4.1 Formas de Pagamento</h3>
                    <p style={{ marginBottom: '12px' }}>Aceitamos pagamentos via cartão de crédito, débito, transferência bancária e PIX.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>4.2 Prazos</h3>
                    <p style={{ marginBottom: '12px' }}>Pagamentos devem ser realizados conforme cronograma acordado na cotação.</p>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>4.3 Reembolsos</h3>
                    <p>Reembolsos seguem políticas específicas de cada fornecedor (companhias aéreas, hotéis, etc.).</p>
                  </div>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>5. Cancelamentos e Alterações</h2>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>5.1 Cancelamentos pelo Cliente</h3>
                    <p style={{ marginBottom: '12px' }}>Cancelamentos estão sujeitos às políticas dos fornecedores e podem incorrer em taxas.</p>
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>5.2 Alterações de Reserva</h3>
                    <p style={{ marginBottom: '12px' }}>Alterações dependem de disponibilidade e podem resultar em diferenças tarifárias.</p>
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#fbbf24',
                      marginBottom: '8px'
                    }}>5.3 Cancelamentos pela Fly2Any</h3>
                    <p>Reservamos o direito de cancelar serviços em casos excepcionais, com reembolso integral.</p>
                  </div>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>6. Limitação de Responsabilidade</h2>
                  <p style={{ marginBottom: '16px' }}>A Fly2Any atua como intermediária e não é responsável por:</p>
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '24px',
                    marginBottom: '16px'
                  }}>
                    <li style={{ marginBottom: '8px' }}>Alterações ou cancelamentos pelos fornecedores</li>
                    <li style={{ marginBottom: '8px' }}>Atrasos, perdas de conexão ou problemas operacionais</li>
                    <li style={{ marginBottom: '8px' }}>Questões de visto, documentação ou imigração</li>
                    <li style={{ marginBottom: '8px' }}>Condições climáticas ou casos fortuitos</li>
                    <li style={{ marginBottom: '8px' }}>Bagagens perdidas ou danificadas</li>
                  </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>7. Propriedade Intelectual</h2>
                  <p>
                    Todo conteúdo do site, incluindo textos, imagens, logos e design, é propriedade da Fly2Any 
                    ou licenciado por terceiros. É proibida a reprodução sem autorização prévia.
                  </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>8. Suporte ao Cliente</h2>
                  <p style={{ marginBottom: '16px' }}>Oferecemos suporte através de:</p>
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '24px',
                    marginBottom: '16px'
                  }}>
                    <li style={{ marginBottom: '8px' }}>Formulário de contato: /contato</li>
                    <li style={{ marginBottom: '8px' }}>WhatsApp: https://wa.me/551151944717</li>
                    <li style={{ marginBottom: '8px' }}>Horário: Segunda a sexta, 9h às 18h (EST)</li>
                  </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>9. Modificações dos Termos</h2>
                  <p>
                    Estes termos podem ser alterados a qualquer momento. Alterações significativas 
                    serão comunicadas com antecedência de 30 dias.
                  </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>10. Lei Aplicável</h2>
                  <p>
                    Estes termos são regidos pelas leis brasileiras e americanas, conforme aplicável. 
                    Disputas serão resolvidas preferencialmente por mediação ou arbitragem.
                  </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                  <h2 style={{
                    fontSize: '24px',
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '16px'
                  }}>11. Contato</h2>
                  <p style={{ marginBottom: '16px' }}>
                    Para questões sobre estes termos, entre em contato:
                  </p>
                  <ul style={{
                    listStyleType: 'disc',
                    marginLeft: '24px',
                    marginBottom: '16px'
                  }}>
                    <li style={{ marginBottom: '8px' }}>Formulário de contato: /contato</li>
                    <li style={{ marginBottom: '8px' }}>CNPJ: [Número do CNPJ]</li>
                  </ul>
                </section>

                <div style={{
                  marginTop: '32px',
                  padding: '16px',
                  background: 'rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: 'rgba(191, 219, 254, 0.9)',
                    margin: 0
                  }}>
                    <strong>Última atualização:</strong> 28 de julho de 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
      
      {/* Estilos responsivos */}
      <style jsx>{`
        .termos-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .termos-title {
          font-size: 48px;
          font-weight: bold;
          color: white;
          margin-bottom: 32px;
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        @media (max-width: 768px) {
          .termos-card {
            padding: 24px;
            border-radius: 16px;
          }
          
          .termos-title {
            font-size: 32px;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </div>
  );
}