import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-glass border-b border-white/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-poppins">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-poppins">Fly2Any</h1>
                <p className="text-blue-100 text-sm">Especialistas Brasil-EUA</p>
              </div>
            </Link>
            <nav className="hidden md:flex gap-8">
              <Link href="/" className="text-white/90 hover:text-white transition-colors">Home</Link>
              <Link href="/como-funciona" className="text-white/90 hover:text-white transition-colors">Como Funciona</Link>
              <Link href="/faq" className="text-white/90 hover:text-white transition-colors">FAQ</Link>
              <Link href="/contato" className="text-white/90 hover:text-white transition-colors">Contato</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="card-premium">
              <h1 className="text-4xl font-bold text-white mb-8 font-poppins">Termos de Uso</h1>
              
              <div className="space-y-6 text-blue-100">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">1. Aceitação dos Termos</h2>
                  <p className="mb-4">
                    Ao utilizar os serviços da Fly2Any, você concorda com estes termos de uso. 
                    Se não concordar com qualquer parte destes termos, não utilize nossos serviços.
                  </p>
                  <p>
                    Estes termos constituem um acordo legal entre você e a Fly2Any e governam 
                    o uso de nossos serviços de consultoria e intermediação de viagens.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">2. Descrição dos Serviços</h2>
                  <p className="mb-4">A Fly2Any oferece serviços de:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Consultoria e intermediação para passagens aéreas</li>
                    <li>Reservas de hotéis e acomodações</li>
                    <li>Aluguel de veículos</li>
                    <li>Seguro viagem e assistência</li>
                    <li>Pacotes de passeios e tours</li>
                    <li>Suporte e atendimento ao cliente</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">3. Responsabilidades do Cliente</h2>
                  <p className="mb-4">Ao utilizar nossos serviços, você se compromete a:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Fornecer informações precisas e atualizadas</li>
                    <li>Verificar documentação necessária para viagem</li>
                    <li>Cumprir prazos de pagamento acordados</li>
                    <li>Seguir políticas das companhias aéreas e hotéis</li>
                    <li>Comunicar alterações ou cancelamentos em tempo hábil</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibent text-white mb-4 font-poppins">4. Políticas de Pagamento</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">4.1 Formas de Pagamento</h3>
                      <p>Aceitamos pagamentos via cartão de crédito, débito, transferência bancária e PIX.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">4.2 Prazos</h3>
                      <p>Pagamentos devem ser realizados conforme cronograma acordado na cotação.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">4.3 Reembolsos</h3>
                      <p>Reembolsos seguem políticas específicas de cada fornecedor (companhias aéreas, hotéis, etc.).</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">5. Cancelamentos e Alterações</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">5.1 Cancelamentos pelo Cliente</h3>
                      <p>Cancelamentos estão sujeitos às políticas dos fornecedores e podem incorrer em taxas.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">5.2 Alterações de Reserva</h3>
                      <p>Alterações dependem de disponibilidade e podem resultar em diferenças tarifárias.</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-300 mb-2">5.3 Cancelamentos pela Fly2Any</h3>
                      <p>Reservamos o direito de cancelar serviços em casos excepcionais, com reembolso integral.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">6. Limitação de Responsabilidade</h2>
                  <p className="mb-4">A Fly2Any atua como intermediária e não é responsável por:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Alterações ou cancelamentos pelos fornecedores</li>
                    <li>Atrasos, perdas de conexão ou problemas operacionais</li>
                    <li>Questões de visto, documentação ou imigração</li>
                    <li>Condições climáticas ou casos fortuitos</li>
                    <li>Bagagens perdidas ou danificadas</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">7. Propriedade Intelectual</h2>
                  <p className="mb-4">
                    Todo conteúdo do site, incluindo textos, imagens, logos e design, é propriedade da Fly2Any 
                    ou licenciado por terceiros. É proibida a reprodução sem autorização prévia.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">8. Suporte ao Cliente</h2>
                  <p className="mb-4">Oferecemos suporte através de:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Formulário de contato: /contato</li>
                    <li>WhatsApp: https://wa.me/551151944717</li>
                    <li>Horário: Segunda a sexta, 9h às 18h (EST)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">9. Modificações dos Termos</h2>
                  <p className="mb-4">
                    Estes termos podem ser alterados a qualquer momento. Alterações significativas 
                    serão comunicadas com antecedência de 30 dias.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">10. Lei Aplicável</h2>
                  <p className="mb-4">
                    Estes termos são regidos pelas leis brasileiras e americanas, conforme aplicável. 
                    Disputas serão resolvidas preferencialmente por mediação ou arbitragem.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">11. Contato</h2>
                  <p className="mb-4">
                    Para questões sobre estes termos, entre em contato:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Formulário de contato: /contato</li>
                    <li>CNPJ: [Número do CNPJ]</li>
                  </ul>
                </section>

                <div className="mt-8 p-4 bg-blue-600/20 rounded-lg">
                  <p className="text-sm text-blue-200">
                    <strong>Última atualização:</strong> 8 de julho de 2024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}