import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade | Fly2Any",
  description: "Conheça nossa política de privacidade e como protegemos seus dados pessoais na Fly2Any.",
  robots: "index, follow",
  openGraph: {
    title: "Política de Privacidade | Fly2Any",
    description: "Conheça nossa política de privacidade e como protegemos seus dados pessoais na Fly2Any.",
    url: "https://fly2any.com/politica-privacidade",
  },
};

export default function PoliticaPrivacidade() {
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
              <h1 className="text-4xl font-bold text-white mb-8 font-poppins">Política de Privacidade</h1>
              
              <div className="space-y-6 text-blue-100">
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">1. Informações Gerais</h2>
                  <p className="mb-4">
                    A Fly2Any está comprometida com a proteção da privacidade e dos dados pessoais de nossos clientes. 
                    Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações.
                  </p>
                  <p>
                    Esta política aplica-se a todos os serviços oferecidos pela Fly2Any e está em conformidade com 
                    a Lei Geral de Proteção de Dados (LGPD) e regulamentações internacionais de privacidade.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">2. Informações Coletadas</h2>
                  <p className="mb-4">Coletamos as seguintes informações:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Dados pessoais: nome, sobrenome, email, telefone</li>
                    <li>Informações de viagem: destinos, datas, preferências</li>
                    <li>Dados de navegação: cookies, IP, comportamento no site</li>
                    <li>Comunicações: mensagens, chamadas, feedbacks</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">3. Uso das Informações</h2>
                  <p className="mb-4">Utilizamos suas informações para:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Processar cotações e reservas de viagem</li>
                    <li>Fornecer atendimento ao cliente personalizado</li>
                    <li>Enviar comunicações sobre seus serviços</li>
                    <li>Melhorar nossos serviços e experiência do usuário</li>
                    <li>Cumprir obrigações legais e regulatórias</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">4. Compartilhamento de Dados</h2>
                  <p className="mb-4">
                    Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                    exceto quando necessário para:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Processar reservas com companhias aéreas e hotéis</li>
                    <li>Cumprir obrigações legais</li>
                    <li>Proteger nossos direitos e segurança</li>
                    <li>Prestadores de serviços sob acordo de confidencialidade</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">5. Proteção de Dados</h2>
                  <p className="mb-4">
                    Implementamos medidas técnicas e organizacionais para proteger suas informações:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Criptografia SSL para transmissão de dados</li>
                    <li>Acesso restrito a dados pessoais</li>
                    <li>Backups seguros e regulares</li>
                    <li>Monitoramento de segurança contínuo</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">6. Seus Direitos</h2>
                  <p className="mb-4">Você tem direito a:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Acessar suas informações pessoais</li>
                    <li>Corrigir dados incorretos ou incompletos</li>
                    <li>Solicitar exclusão de seus dados</li>
                    <li>Revogar consentimento a qualquer momento</li>
                    <li>Receber informações sobre o tratamento de dados</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">7. Cookies</h2>
                  <p className="mb-4">
                    Utilizamos cookies para melhorar sua experiência no site, personalizar conteúdo e 
                    analisar tráfego. Você pode gerenciar suas preferências de cookies nas configurações 
                    do navegador.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">8. Contato</h2>
                  <p className="mb-4">
                    Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Formulário de contato: /contato</li>
                    <li>WhatsApp: https://wa.me/551151944717</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 font-poppins">9. Alterações</h2>
                  <p>
                    Esta política pode ser atualizada periodicamente. Alterações significativas serão 
                    comunicadas por email ou através do site. A versão mais recente estará sempre 
                    disponível nesta página.
                  </p>
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

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-blue-300">&copy; 2024 Fly2Any. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
