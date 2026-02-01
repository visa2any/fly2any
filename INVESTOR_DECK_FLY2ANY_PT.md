# MEMORANDO DE INVESTIMENTO: FLY2ANY

**Data:** 1 de Fevereiro de 2026  
**Empresa:** Fly2Any  
**Setor:** TravelTech / AI / SaaS  
**Estágio:** Seed / Early Growth  
**Confidencialidade:** Estritamente Confidencial

---

## 1. RESUMO EXECUTIVO

**A Fly2Any não é apenas mais uma plataforma de viagens; é a primeira TravelTech verdadeiramente "AI-Native" projetada para resolver a fragmentação e a falta de personalização do mercado de viagens global.**

Enquanto as OTAs (Online Travel Agencies) tradicionais como Expedia e Booking.com operam como meros agregadores de inventário baseados em busca estática, a Fly2Any introduz um paradigma de **Agentes Autônomos Proativos**. Nossa plataforma não espera o usuário buscar; ela antecipa, planeja e executa jornadas completas combinando voos, hotéis e experiências com inteligência emocional e financeira em tempo real.

**A Oportunidade:**
O mercado global de viagens online deve atingir US$ 1 trilhão até 2030, mas a experiência do usuário estagnou na última década. O consumidor moderno enfrenta paralisia de escolha, taxas ocultas e suporte inexistente. A Fly2Any ataca exatamente essa lacuna com uma infraestrutura proprietária que reduz o tempo de planejamento de horas para minutos e aumenta a conversão em até 5x a média da indústria através de hiper-personalização.

**Por que Agora?**
A convergência de LLMs (Large Language Models) acessíveis, APIs de inventário abertas (NDC) e a demanda pós-pandemia por experiências flexíveis criou a tempesta perfeita. A Fly2Any já possui a tecnologia validada para capturar essa demanda com custos operacionais marginais, posicionando-se como o "Sistema Operacional" da nova era de viagens.

---

## 2. O PROBLEMA

O mercado de viagens atual opera sobre uma infraestrutura legada e modelos de negócio hostis ao consumidor:

1.  **Fragmentação Extrema:** O viajante precisa abrir 15+ abas para alinhar voos, hotéis e logística local. Não há "memória" de uma sessão para outra.
2.  **Falta de Inteligência no Atendimento:** Chatbots atuais são glorificados sistemas de FAQ. Eles não possuem contexto, não resolvem problemas complexos e não têm autonomia para reemitir bilhetes ou negociar compensações.
3.  **Má Experiência do Usuário (UX):** Interfaces poluídas, "dark patterns" para forçar vendas e falta de transparência em preços e taxas (bagagem, assento, impostos).
4.  **Baixa Personalização:** Um viajante de negócios de 50 anos recebe os mesmos resultados de busca que um mochileiro de 20 anos. As OTAs ignoram preferências implícitas e histórico.
5.  **Dependência de OTAs Legadas:** O duopólio atual inova pouco e cobra comissões altas (15-25%) sem entregar valor proporcional ao fornecedor ou ao cliente.

**A Consequência:** Taxas de abandono de carrinho superiores a 85% e um NPS (Net Promoter Score) médio da indústria deprimente.

---

## 3. A SOLUÇÃO: FLY2ANY

A Fly2Any é uma **Plataforma de Viagens Assistida por IA** que funde a inventividade de um agente humano experiente com a eficiência de um algoritmo.

### Os 3 Pilares da Solução:

1.  **Assistente Conversacional com Inteligência Emocional:**
    Ao contrário de buscas baseadas em filtros rígidos ("SP para Rio, dia 10"), nossa IA entende intenção e emoção ("Preciso relaxar em uma praia tranquila no nordeste, mas meu orçamento é curto"). O agente detecta frustração ou ansiedade e adapta o tom e as soluções, atuando proativamente (ex: sugerindo remarcação automática antecipada ao detectar risco de cancelamento de voo).

2.  **Unificação da Jornada (End-to-End):**
    Integramos voos (via Duffel e Amadeus), hotéis (via LiteAPI e Duffel Stays), aluguel de carros e seguros em uma única transação fluida. O sistema gerencia conflitos de agenda e conexões automaticamente.

3.  **Conversão Conversacional (Commerce-ready):**
    Não é apenas chat. É um terminal de vendas. O agente pode segurar preços ("Price Freeze"), aplicar garantias de queda de preço e processar pagamentos complexos (split de pagamento para grupos) dentro da própria conversa.

### A Experiência do Usuário:
O usuário não "usa" a Fly2Any; ele "delegam" para a Fly2Any.
_"Encontre um voo para Miami em dezembro, classe executiva, usando meus pontos se valer a pena, e reserve um hotel perto do centro de convenções."_
A Fly2Any executa, compara preços em tempo real, valida vistos e passaportes, e apresenta opções curadas com "Score de Valor", não apenas preço.

---

## 4. ARQUITETURA & TECNOLOGIA

Construímos uma infraestrutura proprietária, segura e escalável, pronta para processar milhões de requisições.

*   **Arquitetura Híbrida Inteligente:** Utilizamos Next.js 14 e Serverless para o frontend, garantindo carregamento em <3s globalmente. O backend combina PostgreSQL para integridade transacional e Redis para cache de alta performance e baixo custo.
*   **Camadas de IA (The "Brain"):**
    *   *Roteamento:* Classifica intenção do usuário para ativar o agente especialista correto (Ex: Agente de Remarcação vs. Agente de Vendas).
    *   *Raciocínio:* Utiliza LLMs (Llama 70B/Groq) para planejamento de ações complexas com custo próximo de zero.
    *   *Compliance:* Guardrails rigorosos impedem alucinações de preços ou políticas. A IA nunca inventa um voo que não existe.
*   **Segurança Enterprise-Grade:** Criptografia AES-256-GCM para dados sensíveis (PII), conformidade com PCI-DSS para pagamentos via Stripe, e isolamento total de dados de pagamento.
*   **Aprendizado Contínuo (Privacy-First):** O sistema aprende padrões de preço e preferências de usuário sem comprometer a privacidade, utilizando dados anonimizados para treinar modelos de predição de demanda.

---

## 5. DIFERENCIAIS COMPETITIVOS

Por que a Fly2Any vence onde outros falharam?

1.  **IA com Governança (Trust):** Enquanto concorrentes lançam "wrappers" de ChatGPT que alucinam, nós construímos uma camada de verificação de fatos em tempo real integradas às APIs globais (GDS). Só vendemos o que é confirmável.
2.  **Conversational Conversion Intelligence:** Nossa IA é treinada para vender. Ela utiliza gatilhos psicológicos éticos (escassez real, prova social, urgência) para aumentar a conversão, algo que chatbots de suporte não fazem.
3.  **Custo de Aquisição (CAC) Otimizado via SEO Programático:** Nossa engine de crescimento gera automaticamente milhares de páginas de aterrissagem (Landing Pages) para cauda longa ("voos baratos de campinas para lisboa em março"), capturando tráfego orgânico de alta intenção a custo zero.
4.  **Predição de Voos ML:** Temos um algoritmo proprietário (nota 11/10 em testes internos) que prevê rotas e preços, permitindo cache inteligente que economiza 90% em custos de API e entrega resultados instantâneos.
5.  **Travel Buddy & Social:** Recursos exclusivos de formação de grupos e divisão de custos, criando um efeito de rede natural e viralidade.

---

## 6. MODELO DE NEGÓCIO

Operamos um modelo híbrido e diversificado, maximizando o *Take Rate* e o *Lifetime Value (LTV)*.

1.  **Comissões Transacionais (Core):**
    *   Voos: 3-5% sobre o valor do bilhete.
    *   Hotéis: 10-15% (margens superiores).
    *   Seguros e Carros: 15-20%.

2.  **Receitas Auxiliares (Ancillaries):**
    *   Markup em seleção de assentos e bagagens (Take rate de 100% sobre o serviço).
    *   "Price Freeze": Taxa de $5-$15 para congelar preço por 48h. Se o usuário não comprar, é lucro puro.
    *   Garantia de Queda de Preço: Seguro opcional com alta margem.

3.  **B2B e Afiliados:**
    *   Monetização de tráfego via cartões de crédito (foco em milhas/pontos).
    *   API para agentes de viagem humanos usarem nossa IA ("Copilot").

**Escalabilidade:** Nossa estrutura de custos é variável. Custos de servidor e API crescem linearmente com a receita, mas nossos custos de IA são deflacionários. Margens brutas projetadas acima de 60% em escala.

---

## 7. MERCADO & ESCALA

**Mercado Endereçável (TAM):** US$ 1 Trilhão (Mercado Global de Viagens Online).
**Mercado Endereçável Servível (SAM):** US$ 300 Bilhões (Viajantes Digitais nas Américas e Europa).
**Mercado Obtenível (SOM):** US$ 3 Bilhões (Segmento "Budget & Experience" focado em Millenials/GenZ nos próximos 3 anos).

**Estratégia de Expansão:**
1.  **Foco Inicial:** Viajantes sensíveis a preço (Budget) nos EUA e Brasil. Este segmento é mal servido e tem alto volume.
2.  **Expansion:** Adicionar camadas Premium/Business conforme a IA amadurece para lidar com complexidades corporativas.
3.  **Efeito de Rede:** O "Crowdsourcing de Preços" (usuários buscando alimentam nosso cache de preços para outros usuários) cria uma barreira de entrada defensável. Quanto mais usuários, mais precisos e baratos são nossos dados.

---

## 8. TRAÇÃO & VALIDAÇÕES

A Fly2Any não é apenas um PowerPoint. É uma plataforma viva.

*   **Produto Funcional:** Buscador completo, reserva, pagamento e emissão de bilhetes operando em produção.
*   **Parcerias Estratégicas:** Integrações ativas e certificadas com **Amadeus** (GDS líder global), **Duffel** (Líder em NDC) e **Stripe** (Pagamentos).
*   **Engenharia Validada:** Plataforma testada com 700+ testes end-to-end, conformidade total WCAG 2.1 (Acessibilidade) e auditoria de segurança.
*   **Growth Engine:** Infraestrutura de SEO programático pronta para escalar de 1.000 para 100.000 páginas indexadas automaticamente.
*   **Cobertura Global:** Inventário de 300+ companhias aéreas e 1M+ de hotéis desde o dia 1.

---

## 9. VISÃO DE FUTURO

Nossa visão é tornar a Fly2Any o **"Travel OS" (Sistema Operacional de Viagens)** pessoal de cada usuário.

*   **Curto Prazo (6-12 meses):** Dominar o nicho de viagens econômicas com a melhor IA de barganhas do mercado.
*   **Médio Prazo (18-24 meses):** Lançar o "Travel Buddy" (Social Travel) e expandir para experiências locais (tours, jantares), capturando maior share of wallet.
*   **Longo Prazo (3-5 anos):** Agentes totalmente autônomos que negociam preços diretamente com hotéis e resolvem problemas (perda de mala, cancelamento) em tempo real sem intervenção humana, via voz e integração total com dispositivos móveis.

---

## 10. TESE DE INVESTIMENTO

**Por que Investir na Fly2Any Agora?**

1.  **Ativo Estratégico em IA:** Não é apenas código; é um dataset proprietário de comportamento de viagem e interações conversacionais. Em um mundo pós-IA, quem detém o relacionamento com o cliente e o contexto da transação vence.
2.  **Defensibilidade:** A combinação de *Cache Inteligente Proprietário* + *Integrações Profundas (Hard Tech)* + *UX Emocional* cria um fosso que clones rápidos de GPT não conseguem cruzar.
3.  **Eficiência de Capital:** Construída por um time sênior e enxuto, com mentalidade de "Profit First". A tecnologia permite escalar receita sem escalar headcount de suporte proporcionalmente.
4.  **Timing Perfeito:** O ciclo de hype da IA está passando; agora entra o ciclo de utilidade real e geração de caixa. A Fly2Any está posicionada exatamente aqui.

**Perfil de Investidor Ideal:**
Buscamos parceiros que entendam teses de Marketplace/SaaS, tenham visão de longo prazo sobre a transformação da IA em verticais específicas e possam abrir portas para parcerias globais de distribuição.

---
*Documento preparado exclusivamente para fins de análise de investimento.*
