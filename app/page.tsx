'use client';

import { useState, useEffect } from 'react';
import { FAQ } from '@/components/conversion/FAQ';
import { MobileHomeSearchWrapper } from '@/components/home/MobileHomeSearchWrapper';
import { HotelsSectionEnhanced } from '@/components/home/HotelsSectionEnhanced';
// TEMPORARILY HIDDEN - Uncomment when ready to launch
// import { CarRentalsSectionEnhanced } from '@/components/home/CarRentalsSectionEnhanced';
// import { ToursSection } from '@/components/home/ToursSection';
import { DestinationsSectionEnhanced } from '@/components/home/DestinationsSectionEnhanced';
import { FlashDealsSectionEnhanced } from '@/components/home/FlashDealsSectionEnhanced';
import { RecentlyViewedSection } from '@/components/home/RecentlyViewedSection';
// TEMPORARILY HIDDEN - Uncomment when ready to launch TripMatch
// import { TripMatchPreviewSection } from '@/components/home/TripMatchPreviewSection';
import { WorldCupHeroSectionEnhanced } from '@/components/world-cup/WorldCupHeroSectionEnhanced';
import { MaxWidthContainer } from '@/components/layout/MaxWidthContainer';
import { CompactTrustBar } from '@/components/conversion/CompactTrustBar';
import { CreditCard, Plane, Hotel, Car, Shield, HeadphonesIcon } from 'lucide-react';

type Language = 'en' | 'pt' | 'es';

const content = {
  en: {
    pageTitle: 'FLY2ANY - Find Cheap Flights, Hotels, Cars & Tours',
    sectionTitle: 'Explore the World with Smart Travel Deals',
    subtitle: 'Best value across all travel services',
  },
  pt: {
    pageTitle: 'FLY2ANY - Encontre Voos, Hotéis, Carros e Passeios Baratos',
    sectionTitle: 'Explore o Mundo com Ofertas Inteligentes de Viagem',
    subtitle: 'Melhor valor em todos os serviços',
  },
  es: {
    pageTitle: 'FLY2ANY - Encuentra Vuelos, Hoteles, Autos y Tours Baratos',
    sectionTitle: 'Explora el Mundo con Ofertas Inteligentes de Viaje',
    subtitle: 'Mejor valor en todos los servicios',
  },
};

// Comprehensive FAQ data (30+ questions across 6 categories)
const faqCategories = {
  en: [
    {
      id: 'booking-payments',
      icon: CreditCard,
      title: 'Booking & Payments',
      items: [
        { question: 'How does the best price guarantee work?', answer: 'If you find a lower price for the same flight, hotel, or package within 24 hours of booking, we\'ll refund the difference plus give you a $50 credit toward your next booking. Simply contact our support team with proof of the lower price.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay, and Venmo. For select bookings, we also accept cryptocurrency payments.' },
        { question: 'Is my payment information secure?', answer: 'Absolutely! We use 256-bit SSL encryption and are PCI DSS Level 1 compliant. Your payment information is never stored on our servers and is processed through secure, certified payment gateways.' },
        { question: 'Are there any hidden fees?', answer: 'No hidden fees ever! The price you see is the final price you pay. We display all taxes, fees, and charges upfront before you confirm your booking.' },
        { question: 'Do you offer group booking discounts?', answer: 'Yes! For groups of 10 or more travelers, contact our group booking specialists for exclusive rates and personalized service. We offer special pricing for corporate travel, weddings, and events.' },
        { question: 'Can I book now and pay later?', answer: 'Select hotels and vacation packages offer flexible payment plans. Look for the "Pay Later" badge on search results. Final payment is typically due 14-30 days before travel.' },
      ]
    },
    {
      id: 'flights-travel',
      icon: Plane,
      title: 'Flights & Travel',
      items: [
        { question: 'Can I cancel or change my flight booking?', answer: 'Most flight bookings can be changed or cancelled, but fees may apply depending on the airline and fare type. Basic Economy fares typically have the strictest rules. We always display cancellation terms before you book.' },
        { question: 'How do I track flight prices?', answer: 'Click the "Track Prices" button on any search result. We\'ll monitor prices 24/7 and send you email alerts when they drop, helping you book at the perfect time. You can track up to 10 routes simultaneously.' },
        { question: 'What are the baggage allowances?', answer: 'Baggage allowances vary by airline and fare class. Standard economy typically includes 1 carry-on and 1 personal item. Checked bag fees range from $30-$100 per bag. We display exact allowances for your specific flight.' },
        { question: 'Can I select my seat?', answer: 'Yes! Most airlines allow seat selection during booking or anytime before departure. Some airlines charge for seat selection, while others offer it free. Premium seats cost $15-$150 extra.' },
        { question: 'Do you offer special assistance?', answer: 'Yes! We can arrange wheelchair assistance, special meals, unaccompanied minor service, and pet travel. Contact us at least 48 hours before departure with your requirements.' },
        { question: 'What happens with connecting flights?', answer: 'Your bags are typically checked through to your final destination. Minimum connection times vary by airport (45-90 minutes domestic, 60-120 minutes international). We only show connections with safe transfer times.' },
      ]
    },
    {
      id: 'hotels-accommodations',
      icon: Hotel,
      title: 'Hotels & Accommodations',
      items: [
        { question: 'What is your hotel cancellation policy?', answer: 'Most hotels offer free cancellation up to 24-48 hours before check-in. Non-refundable rates save 10-30% but cannot be cancelled. We always show the exact cancellation deadline before you book.' },
        { question: 'Can I request early check-in or late checkout?', answer: 'Yes! You can request early check-in (usually after 12pm) or late checkout (usually until 2pm) during booking. Availability is subject to hotel confirmation and may incur additional fees of $25-$75.' },
        { question: 'Are room upgrades available?', answer: 'Room upgrades can often be arranged at check-in or pre-booked for $20-$150 per night depending on availability. Elite loyalty members may receive complimentary upgrades.' },
        { question: 'What amenities are included?', answer: 'Standard amenities include WiFi, toiletries, and towels. Many hotels offer pools, fitness centers, and breakfast. Check the property details for a complete amenity list. Premium amenities vary by hotel category.' },
        { question: 'Are pets allowed?', answer: 'Many hotels accept pets with advance notice. Pet fees range from $25-$75 per night. Weight and breed restrictions may apply. Always filter for "Pet-Friendly" properties during search.' },
      ]
    },
    {
      id: 'cars-transfers',
      icon: Car,
      title: 'Cars & Transfers',
      items: [
        { question: 'What insurance do I need for car rentals?', answer: 'Basic insurance is usually included. Optional coverage includes Collision Damage Waiver ($15-$40/day), theft protection, and liability. Your personal auto insurance may already cover rentals - check before purchasing.' },
        { question: 'What is the fuel policy?', answer: 'Most rentals use "Full-to-Full" - you receive a full tank and return it full. Prepaid fuel options save time but cost 10-20% more. Returning empty incurs $8-12 per gallon plus service fees.' },
        { question: 'What are the driver requirements?', answer: 'Minimum age is 21 (25 for some car categories). Drivers under 25 pay young driver fees ($25-$35/day). You need a valid license held for at least 1 year and a major credit card.' },
        { question: 'Where do I pick up and drop off the car?', answer: 'Airport locations offer the most convenience. Off-airport locations may offer lower rates but require shuttle service. 24/7 locations provide flexible pickup times. One-way rentals incur drop-off fees.' },
        { question: 'Can I drive across borders?', answer: 'International border crossings require advance authorization and additional insurance. Popular routes (US-Canada, EU countries) are typically allowed with proper documentation. Always declare your travel plans.' },
      ]
    },
    {
      id: 'insurance-protection',
      icon: Shield,
      title: 'Insurance & Protection',
      items: [
        { question: 'Should I buy travel insurance?', answer: 'Travel insurance is highly recommended and costs 4-10% of trip cost. It covers trip cancellation, medical emergencies, lost baggage, and travel delays. Essential for international trips and expensive bookings.' },
        { question: 'What does travel insurance cover?', answer: 'Standard coverage includes trip cancellation/interruption, emergency medical, emergency evacuation, baggage loss/delay, and travel delays. Premium plans add "Cancel For Any Reason" coverage.' },
        { question: 'What if I have a medical emergency abroad?', answer: 'Contact your travel insurance provider immediately. They provide 24/7 assistance, coordinate medical care, and arrange payment. Keep all receipts and medical documents for reimbursement claims.' },
        { question: 'How do refunds work?', answer: 'Refundable bookings are processed to your original payment method within 7-14 business days. Travel insurance claims require documentation and take 15-30 days. Credit card chargebacks are a last resort.' },
        { question: 'What if travel advisories are issued?', answer: 'Level 3-4 State Department warnings may trigger insurance coverage. Airlines and hotels may waive change fees during declared emergencies. Check official travel advisories at travel.state.gov.' },
      ]
    },
    {
      id: 'support-account',
      icon: HeadphonesIcon,
      title: 'Support & Account',
      items: [
        { question: 'How do I contact customer support?', answer: 'We offer 24/7 support via phone (1-305-797-1087), email (support@fly2any.com), WhatsApp chat, and live chat. Average response time is under 5 minutes for urgent matters.' },
        { question: 'How do I manage my account?', answer: 'Access your account dashboard to view bookings, update payment methods, manage traveler profiles, track rewards, and set notification preferences. Enable two-factor authentication for security.' },
        { question: 'Do you have a loyalty program?', answer: 'Yes! Fly2Any Rewards members earn 5 points per dollar spent. Redeem for discounts, upgrades, and exclusive deals. Elite tiers offer priority support, bonus points, and special perks.' },
        { question: 'How do I file a complaint?', answer: 'Contact our Customer Relations team via email or phone. We respond to all complaints within 24 hours and aim for resolution within 5-7 business days. Serious issues are escalated to management.' },
      ]
    },
  ],
  pt: [
    {
      id: 'booking-payments',
      icon: CreditCard,
      title: 'Reservas e Pagamentos',
      items: [
        { question: 'Como funciona a garantia de melhor preço?', answer: 'Se você encontrar um preço mais baixo para o mesmo voo, hotel ou pacote dentro de 24 horas após a reserva, reembolsaremos a diferença e daremos um crédito de $50 para sua próxima reserva. Entre em contato com nossa equipe com comprovação do preço mais baixo.' },
        { question: 'Quais métodos de pagamento vocês aceitam?', answer: 'Aceitamos todos os principais cartões de crédito (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay e Venmo. Para reservas selecionadas, também aceitamos criptomoedas.' },
        { question: 'Minhas informações de pagamento estão seguras?', answer: 'Absolutamente! Usamos criptografia SSL de 256 bits e somos compatíveis com PCI DSS Nível 1. Suas informações de pagamento nunca são armazenadas em nossos servidores e são processadas através de gateways de pagamento certificados.' },
        { question: 'Existem taxas ocultas?', answer: 'Nunca! O preço que você vê é o preço final que você paga. Exibimos todos os impostos, taxas e encargos antecipadamente antes de confirmar sua reserva.' },
        { question: 'Vocês oferecem descontos para grupos?', answer: 'Sim! Para grupos de 10 ou mais viajantes, entre em contato com nossos especialistas em reservas de grupo para tarifas exclusivas e serviço personalizado.' },
        { question: 'Posso reservar agora e pagar depois?', answer: 'Hotéis e pacotes selecionados oferecem planos de pagamento flexíveis. Procure o selo "Pagar Depois" nos resultados. O pagamento final geralmente vence 14-30 dias antes da viagem.' },
      ]
    },
    {
      id: 'flights-travel',
      icon: Plane,
      title: 'Voos e Viagens',
      items: [
        { question: 'Posso cancelar ou alterar minha reserva de voo?', answer: 'A maioria das reservas de voo pode ser alterada ou cancelada, mas taxas podem ser aplicadas dependendo da companhia aérea e tipo de tarifa. Tarifas Economy Básica têm as regras mais restritas.' },
        { question: 'Como rastreio os preços dos voos?', answer: 'Clique no botão "Rastrear Preços" em qualquer resultado. Monitoraremos os preços 24/7 e enviaremos alertas por e-mail quando caírem. Você pode rastrear até 10 rotas simultaneamente.' },
        { question: 'Quais são as franquias de bagagem?', answer: 'Franquias variam por companhia aérea e classe tarifária. Economy padrão inclui 1 bagagem de mão e 1 item pessoal. Taxas de bagagem despachada variam de $30-$100 por mala.' },
        { question: 'Posso selecionar meu assento?', answer: 'Sim! A maioria das companhias permite seleção de assento durante a reserva ou antes da partida. Algumas cobram pela seleção, outras oferecem gratuitamente.' },
        { question: 'Vocês oferecem assistência especial?', answer: 'Sim! Podemos providenciar assistência em cadeira de rodas, refeições especiais, serviço para menor desacompanhado e viagem com animais. Entre em contato 48 horas antes.' },
        { question: 'O que acontece com voos de conexão?', answer: 'Suas malas geralmente são despachadas até o destino final. Tempos mínimos de conexão variam (45-90 min doméstico, 60-120 min internacional).' },
      ]
    },
    {
      id: 'hotels-accommodations',
      icon: Hotel,
      title: 'Hotéis e Acomodações',
      items: [
        { question: 'Qual é a política de cancelamento de hotel?', answer: 'A maioria dos hotéis oferece cancelamento gratuito até 24-48 horas antes do check-in. Tarifas não reembolsáveis economizam 10-30% mas não podem ser canceladas.' },
        { question: 'Posso solicitar check-in antecipado ou checkout tardio?', answer: 'Sim! Você pode solicitar check-in antecipado (geralmente após 12h) ou checkout tardio (geralmente até 14h). Sujeito à confirmação do hotel.' },
        { question: 'Upgrades de quarto estão disponíveis?', answer: 'Upgrades podem ser arranjados no check-in ou pré-reservados por $20-$150 por noite, dependendo da disponibilidade.' },
        { question: 'Quais comodidades estão incluídas?', answer: 'Comodidades padrão incluem WiFi, artigos de higiene e toalhas. Muitos hotéis oferecem piscinas, academias e café da manhã.' },
        { question: 'Animais de estimação são permitidos?', answer: 'Muitos hotéis aceitam animais com aviso prévio. Taxas variam de $25-$75 por noite. Restrições de peso e raça podem ser aplicadas.' },
      ]
    },
    {
      id: 'cars-transfers',
      icon: Car,
      title: 'Carros e Transfers',
      items: [
        { question: 'Que seguro preciso para alugar carro?', answer: 'Seguro básico geralmente está incluído. Cobertura opcional inclui isenção de danos ($15-$40/dia), proteção contra roubo e responsabilidade civil.' },
        { question: 'Qual é a política de combustível?', answer: 'A maioria usa "Cheio-a-Cheio" - você recebe tanque cheio e devolve cheio. Opções pré-pagas economizam tempo mas custam 10-20% a mais.' },
        { question: 'Quais são os requisitos para motorista?', answer: 'Idade mínima é 21 (25 para algumas categorias). Menores de 25 pagam taxas de motorista jovem ($25-$35/dia). Precisa de carteira válida há pelo menos 1 ano.' },
        { question: 'Onde pego e devolvo o carro?', answer: 'Localizações no aeroporto oferecem mais conveniência. Locais fora do aeroporto podem ter tarifas menores mas requerem serviço de shuttle.' },
        { question: 'Posso dirigir através de fronteiras?', answer: 'Cruzamentos internacionais requerem autorização prévia e seguro adicional. Rotas populares (EUA-Canadá, países da UE) são tipicamente permitidas.' },
      ]
    },
    {
      id: 'insurance-protection',
      icon: Shield,
      title: 'Seguro e Proteção',
      items: [
        { question: 'Devo comprar seguro viagem?', answer: 'Seguro viagem é altamente recomendado e custa 4-10% do custo da viagem. Cobre cancelamento, emergências médicas, bagagem perdida e atrasos.' },
        { question: 'O que o seguro viagem cobre?', answer: 'Cobertura padrão inclui cancelamento/interrupção de viagem, emergência médica, evacuação de emergência, perda/atraso de bagagem e atrasos de viagem.' },
        { question: 'E se eu tiver emergência médica no exterior?', answer: 'Entre em contato com seu provedor de seguro viagem imediatamente. Eles fornecem assistência 24/7, coordenam cuidados médicos e organizam pagamento.' },
        { question: 'Como funcionam os reembolsos?', answer: 'Reservas reembolsáveis são processadas para seu método de pagamento original em 7-14 dias úteis. Reivindicações de seguro requerem documentação.' },
        { question: 'E se avisos de viagem forem emitidos?', answer: 'Avisos de Nível 3-4 do Departamento de Estado podem acionar cobertura de seguro. Companhias aéreas e hotéis podem dispensar taxas de mudança.' },
      ]
    },
    {
      id: 'support-account',
      icon: HeadphonesIcon,
      title: 'Suporte e Conta',
      items: [
        { question: 'Como entro em contato com o suporte?', answer: 'Oferecemos suporte 24/7 via telefone (1-305-797-1087), email (support@fly2any.com), WhatsApp e chat ao vivo. Tempo médio de resposta é 5 minutos.' },
        { question: 'Como gerencio minha conta?', answer: 'Acesse seu painel de conta para ver reservas, atualizar métodos de pagamento, gerenciar perfis de viajantes, rastrear recompensas e definir preferências.' },
        { question: 'Vocês têm programa de fidelidade?', answer: 'Sim! Membros Fly2Any Rewards ganham 5 pontos por dólar gasto. Resgate por descontos, upgrades e ofertas exclusivas.' },
        { question: 'Como faço uma reclamação?', answer: 'Entre em contato com nossa equipe de Relações com Cliente via email ou telefone. Respondemos todas reclamações em 24 horas.' },
      ]
    },
  ],
  es: [
    {
      id: 'booking-payments',
      icon: CreditCard,
      title: 'Reservas y Pagos',
      items: [
        { question: '¿Cómo funciona la garantía de mejor precio?', answer: 'Si encuentras un precio más bajo para el mismo vuelo, hotel o paquete dentro de 24 horas de la reserva, reembolsaremos la diferencia y te daremos un crédito de $50 para tu próxima reserva.' },
        { question: '¿Qué métodos de pago aceptan?', answer: 'Aceptamos todas las tarjetas de crédito principales (Visa, Mastercard, Amex, Discover), PayPal, Apple Pay, Google Pay y Venmo. Para reservas seleccionadas, también aceptamos criptomonedas.' },
        { question: '¿Mi información de pago está segura?', answer: '¡Absolutamente! Usamos encriptación SSL de 256 bits y cumplimos con PCI DSS Nivel 1. Tu información de pago nunca se almacena en nuestros servidores.' },
        { question: '¿Hay cargos ocultos?', answer: '¡Nunca! El precio que ves es el precio final que pagas. Mostramos todos los impuestos, tarifas y cargos por adelantado antes de confirmar tu reserva.' },
        { question: '¿Ofrecen descuentos para grupos?', answer: 'Sí! Para grupos de 10 o más viajeros, contacta a nuestros especialistas en reservas de grupo para tarifas exclusivas y servicio personalizado.' },
        { question: '¿Puedo reservar ahora y pagar después?', answer: 'Hoteles y paquetes seleccionados ofrecen planes de pago flexibles. Busca el distintivo "Pagar Después" en los resultados. El pago final generalmente vence 14-30 días antes del viaje.' },
      ]
    },
    {
      id: 'flights-travel',
      icon: Plane,
      title: 'Vuelos y Viajes',
      items: [
        { question: '¿Puedo cancelar o cambiar mi reserva de vuelo?', answer: 'La mayoría de las reservas de vuelo pueden cambiarse o cancelarse, pero pueden aplicarse cargos según la aerolínea y tipo de tarifa. Las tarifas Economy Básica tienen las reglas más estrictas.' },
        { question: '¿Cómo rastro los precios de vuelos?', answer: 'Haz clic en el botón "Rastrear Precios" en cualquier resultado. Monitorearemos los precios 24/7 y te enviaremos alertas cuando bajen. Puedes rastrear hasta 10 rutas simultáneamente.' },
        { question: '¿Cuáles son las franquicias de equipaje?', answer: 'Las franquicias varían según la aerolínea y clase tarifaria. Economy estándar incluye 1 equipaje de mano y 1 artículo personal. Cargos por maletas facturadas varían de $30-$100.' },
        { question: '¿Puedo seleccionar mi asiento?', answer: 'Sí! La mayoría de las aerolíneas permiten selección de asiento durante la reserva o antes de la partida. Algunas cobran por la selección, otras la ofrecen gratis.' },
        { question: '¿Ofrecen asistencia especial?', answer: 'Sí! Podemos organizar asistencia en silla de ruedas, comidas especiales, servicio para menor no acompañado y viaje con mascotas. Contáctanos 48 horas antes.' },
        { question: '¿Qué pasa con los vuelos de conexión?', answer: 'Tus maletas generalmente se despachan hasta el destino final. Tiempos mínimos de conexión varían (45-90 min doméstico, 60-120 min internacional).' },
      ]
    },
    {
      id: 'hotels-accommodations',
      icon: Hotel,
      title: 'Hoteles y Alojamiento',
      items: [
        { question: '¿Cuál es la política de cancelación de hotel?', answer: 'La mayoría de los hoteles ofrecen cancelación gratuita hasta 24-48 horas antes del check-in. Tarifas no reembolsables ahorran 10-30% pero no pueden cancelarse.' },
        { question: '¿Puedo solicitar check-in temprano o checkout tardío?', answer: 'Sí! Puedes solicitar check-in temprano (generalmente después de 12pm) o checkout tardío (generalmente hasta 2pm). Sujeto a confirmación del hotel.' },
        { question: '¿Están disponibles las mejoras de habitación?', answer: 'Las mejoras pueden organizarse en el check-in o reservarse por adelantado por $20-$150 por noche, dependiendo de disponibilidad.' },
        { question: '¿Qué comodidades están incluidas?', answer: 'Comodidades estándar incluyen WiFi, artículos de aseo y toallas. Muchos hoteles ofrecen piscinas, gimnasios y desayuno.' },
        { question: '¿Se permiten mascotas?', answer: 'Muchos hoteles aceptan mascotas con aviso previo. Cargos varían de $25-$75 por noche. Pueden aplicarse restricciones de peso y raza.' },
      ]
    },
    {
      id: 'cars-transfers',
      icon: Car,
      title: 'Autos y Transfers',
      items: [
        { question: '¿Qué seguro necesito para alquilar un auto?', answer: 'El seguro básico generalmente está incluido. Cobertura opcional incluye exención de daños ($15-$40/día), protección contra robo y responsabilidad civil.' },
        { question: '¿Cuál es la política de combustible?', answer: 'La mayoría usa "Lleno-a-Lleno" - recibes tanque lleno y lo devuelves lleno. Opciones prepagadas ahorran tiempo pero cuestan 10-20% más.' },
        { question: '¿Cuáles son los requisitos para conductor?', answer: 'Edad mínima es 21 (25 para algunas categorías). Menores de 25 pagan cargos de conductor joven ($25-$35/día). Necesitas licencia válida por al menos 1 año.' },
        { question: '¿Dónde recojo y devuelvo el auto?', answer: 'Ubicaciones en aeropuerto ofrecen más conveniencia. Ubicaciones fuera del aeropuerto pueden tener tarifas menores pero requieren servicio de shuttle.' },
        { question: '¿Puedo conducir a través de fronteras?', answer: 'Cruces internacionales requieren autorización previa y seguro adicional. Rutas populares (EE.UU.-Canadá, países UE) están típicamente permitidas.' },
      ]
    },
    {
      id: 'insurance-protection',
      icon: Shield,
      title: 'Seguro y Protección',
      items: [
        { question: '¿Debo comprar seguro de viaje?', answer: 'El seguro de viaje es altamente recomendado y cuesta 4-10% del costo del viaje. Cubre cancelación, emergencias médicas, equipaje perdido y retrasos.' },
        { question: '¿Qué cubre el seguro de viaje?', answer: 'Cobertura estándar incluye cancelación/interrupción de viaje, emergencia médica, evacuación de emergencia, pérdida/retraso de equipaje y retrasos de viaje.' },
        { question: '¿Qué pasa si tengo emergencia médica en el extranjero?', answer: 'Contacta a tu proveedor de seguro de viaje inmediatamente. Proporcionan asistencia 24/7, coordinan atención médica y organizan el pago.' },
        { question: '¿Cómo funcionan los reembolsos?', answer: 'Reservas reembolsables se procesan a tu método de pago original en 7-14 días hábiles. Reclamos de seguro requieren documentación.' },
        { question: '¿Qué pasa si se emiten avisos de viaje?', answer: 'Advertencias de Nivel 3-4 del Departamento de Estado pueden activar cobertura de seguro. Aerolíneas y hoteles pueden exentar cargos de cambio.' },
      ]
    },
    {
      id: 'support-account',
      icon: HeadphonesIcon,
      title: 'Soporte y Cuenta',
      items: [
        { question: '¿Cómo contacto al soporte al cliente?', answer: 'Ofrecemos soporte 24/7 vía teléfono (1-305-797-1087), email (support@fly2any.com), WhatsApp y chat en vivo. Tiempo promedio de respuesta es 5 minutos.' },
        { question: '¿Cómo administro mi cuenta?', answer: 'Accede a tu panel de cuenta para ver reservas, actualizar métodos de pago, administrar perfiles de viajeros, rastrear recompensas y establecer preferencias.' },
        { question: '¿Tienen programa de lealtad?', answer: 'Sí! Los miembros Fly2Any Rewards ganan 5 puntos por dólar gastado. Canjea por descuentos, mejoras y ofertas exclusivas.' },
        { question: '¿Cómo presento una queja?', answer: 'Contacta a nuestro equipo de Relaciones con el Cliente vía email o teléfono. Respondemos a todas las quejas en 24 horas.' },
      ]
    },
  ],
};

export default function Home() {
  const [lang, setLang] = useState<Language>('en');
  const [animationKey, setAnimationKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const t = content[lang];

  // Trigger initial animation on mount with delay to prevent hydration issues
  useEffect(() => {
    // Add small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Restart letter animation every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationKey(prev => prev + 1);
    }, 12000); // 12 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================
          PAGE TITLE - Level-6 Apple-Class Hero Section
          REBUILT: Official color system, 8pt grid, premium shadows
          ============================================ */}
      <div className="relative bg-layer-0 border-b border-neutral-200/60 overflow-hidden">
        {/* Animated floating orbs - Official Fly2Any colors */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-orb floating-orb-1"></div>
          <div className="floating-orb floating-orb-2"></div>
          <div className="floating-orb floating-orb-3"></div>
        </div>

        {/* Subtle dot pattern - Official primary red */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E74035 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }}></div>

        <MaxWidthContainer
          className="relative"
          noPadding={true}
          style={{ padding: '8px 0' }}
        >
          {/* Text padding on mobile */}
          <div className="px-4 md:px-6">
            {/* Title Container - stacked on mobile, inline on desktop */}
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-4">
              {/* Main Title - Level-6: prominent on mobile */}
              <h1
                key={`title-${animationKey}`}
                className="hero-title text-lg md:text-[32px] font-bold tracking-[0.01em] text-neutral-800"
              >
                {t.sectionTitle.split('').map((char, index) => (
                  <span
                    key={index}
                    className="letter-elastic"
                    style={{
                      animationDelay: `${index * 0.038}s`,
                      display: 'inline-block',
                      minWidth: char === ' ' ? '0.25em' : 'auto',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </h1>

              {/* Separator - Hidden on mobile */}
              <span className="hidden md:block text-primary-500 text-2xl font-bold flex-shrink-0">•</span>

              {/* Subtitle - Level-6: visible on separate row on mobile */}
              <p
                key={`subtitle-${animationKey}`}
                className="hero-subtitle text-sm md:text-lg font-medium text-neutral-500 tracking-[0.005em]"
              >
                {t.subtitle.split('').map((char, index) => (
                  <span
                    key={index}
                    className="letter-elastic"
                    style={{
                      animationDelay: `${2.0 + (index * 0.028)}s`,
                      display: 'inline-block',
                      minWidth: char === ' ' ? '0.25em' : 'auto',
                    }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </MaxWidthContainer>
      </div>

      {/* Premium CSS Animations */}
      <style jsx>{`
        /* ===== REMOVED: Airplane animation (user request) ===== */

        /* ===== FLOATING BACKGROUND ORBS ===== */
        /* MOBILE OPTIMIZED: Constrained positioning to prevent overflow */
        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
          animation: float 20s ease-in-out infinite;
          z-index: 0; /* Keep orbs BEHIND content */
        }

        .floating-orb-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, #E74035, #F7C928);
          top: -80px;
          left: 5%;
          animation-delay: 0s;
          animation-duration: 25s;
        }

        .floating-orb-2 {
          width: 180px;
          height: 180px;
          background: linear-gradient(135deg, #D43B31, #DEB423);
          top: -60px;
          right: 10%;
          animation-delay: 5s;
          animation-duration: 30s;
        }

        .floating-orb-3 {
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, #F7C928, #E74035);
          bottom: -50px;
          left: 50%;
          animation-delay: 10s;
          animation-duration: 28s;
        }

        /* Desktop: Larger orbs */
        @media (min-width: 768px) {
          .floating-orb-1 {
            width: 300px;
            height: 300px;
            top: -150px;
            left: 10%;
          }

          .floating-orb-2 {
            width: 250px;
            height: 250px;
            top: -100px;
            right: 15%;
          }

          .floating-orb-3 {
            width: 200px;
            height: 200px;
            bottom: -100px;
          }
        }

        /* MOBILE: Constrained float animation to prevent overflow */
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(10px, -8px) scale(1.02);
          }
          50% {
            transform: translate(-8px, 5px) scale(0.98);
          }
          75% {
            transform: translate(6px, -6px) scale(1.01);
          }
        }

        /* Desktop: More dynamic float animation */
        @media (min-width: 768px) {
          @keyframes float {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(30px, -20px) scale(1.05);
            }
            50% {
              transform: translate(-20px, 10px) scale(0.95);
            }
            75% {
              transform: translate(15px, -15px) scale(1.02);
            }
          }
        }

        /* ===== LEVEL-6 HERO TITLE (Apple-Class Typography) ===== */
        .hero-title {
          /* Anti-eye-strain: neutral-800 per spec */
          color: #1B1C20;

          /* Multi-layer text shadow - Official Fly2Any Red #E74035 */
          text-shadow:
            0 1px 2px rgba(27, 28, 32, 0.06),
            0 2px 6px rgba(231, 64, 53, 0.08);

          position: relative;
          z-index: 10;

          /* GPU rendering for smooth animations */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          isolation: isolate;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;

          /* Level-6 Typography: 700 weight, positive tracking */
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        /* ===== SEPARATOR DOT PULSE ===== */
        .separator-dot {
          animation:
            fadeIn 0.8s ease-out,
            dotPulse 2s ease-in-out infinite;
          display: inline-block;
          position: relative;
          z-index: 10; /* Keep separator ABOVE background orbs */
          /* CROSS-BROWSER: Force proper rendering */
          transform: translateZ(0);
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          -moz-backface-visibility: hidden;
        }

        @keyframes dotPulse {
          0%, 100% {
            transform: scale(1) translateZ(0);
            opacity: 0.7;
          }
          50% {
            transform: scale(1.2) translateZ(0);
            opacity: 1;
          }
        }

        /* ===== LEVEL-6 LETTER ANIMATION (Apple Physics) ===== */
        .letter-elastic {
          opacity: 0;
          /* Apple cubic-bezier for smooth entrance */
          animation: elasticLetterEntrance 0.26s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          transform-origin: center center;
          position: relative;
          z-index: 1;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        @keyframes elasticLetterEntrance {
          0% {
            opacity: 0;
            transform: translateY(8px) scale(0.95) translateZ(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) translateZ(0);
          }
        }

        /* ===== SUBTITLE - Now uses letter-elastic (unified with title) ===== */
        .hero-subtitle {
          /* No parent animation - individual letters animate with letter-elastic */
          position: relative;
          z-index: 10; /* Keep subtitle ABOVE background orbs */
          /* CHROME/EDGE FIX: Force proper rendering */
          transform: translateZ(0);
          backface-visibility: hidden;
          isolation: isolate;
          /* Anti-eye-strain: neutral-500 for secondary text */
          color: #5F6368;
          font-weight: 500;
        }

        /* ===== BASE ANIMATIONS ===== */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px) translateZ(0);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        /* ===== ACCESSIBILITY: REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .hero-title,
          .separator-dot,
          .letter-elastic,
          .floating-orb {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* ============================================
          UNIFIED SEARCH BAR - Flights, Hotels, Cars, Tours
          MOBILE OPTIMIZED: Collapsible wrapper on mobile (≤768px)
          ============================================ */}
      <MobileHomeSearchWrapper lang={lang} />

      {/* ============================================
          COMPACT TRUST BAR - Sticky Trust Signals
          STRATEGIC: 100% visibility, 48px height, always visible
          ============================================ */}
      <CompactTrustBar sticky />

      {/* ============================================
          TRIPMATCH - Social Travel Network - TEMPORARILY HIDDEN
          Uncomment when ready to launch TripMatch
          ============================================ */}
      {/* <div className="mt-2 sm:mt-3 md:mt-6">
        <TripMatchPreviewSection />
      </div> */}

      {/* ============================================
          MAIN CONTENT - Max Width 1600px
          MOBILE OPTIMIZED: 100% width on mobile, standard padding on desktop
          Sticky trust bar removed for cleaner, more compact design
          Trust badges integrated into Trust Indicators section below
          ============================================ */}
      <main>
        {/* Level-6: Edge-to-edge on mobile, padded on desktop */}
        <MaxWidthContainer className="px-0 md:px-6" noPadding={true}>
          {/* ============================================
              RECENTLY VIEWED - Personalized Recommendations
              ============================================ */}
          {/* Compact spacing: 12px mobile, 16px desktop */}
          <div className="mt-3 md:mt-4">
            <RecentlyViewedSection lang={lang} />
          </div>

        {/* ============================================
            FLASH DEALS SECTION - Time-Limited Offers
            ENHANCED with Real Duffel Flash Deals, ML/AI, Marketing
            ============================================ */}
        {/* Compact spacing */}
        <div className="mt-3 md:mt-4">
          <FlashDealsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            DESTINATIONS SECTION - Explore by Continent
            ENHANCED with Real Duffel Flight Data, ML/AI, Marketing
            ============================================ */}
        {/* Compact spacing */}
        <div className="mt-3 md:mt-4">
          <DestinationsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            HOTELS SECTION - ML/AI Powered with Duffel Photos
            ============================================ */}
        {/* Compact spacing */}
        <div className="mt-3 md:mt-4">
          <HotelsSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            FIFA WORLD CUP 2026 - Prominent Hero Section
            STRATEGIC: High-visibility placement for major event
            ============================================ */}
        <div className="mt-3 md:mt-4">
          <WorldCupHeroSectionEnhanced lang={lang} />
        </div>

        {/* ============================================
            CAR RENTALS SECTION - TEMPORARILY HIDDEN
            Uncomment when ready to launch car rentals
            ============================================ */}
        {/* <div className="mt-2 sm:mt-3 md:mt-5">
          <CarRentalsSectionEnhanced lang={lang} />
        </div> */}

        {/* ============================================
            TOURS & ACTIVITIES SECTION - TEMPORARILY HIDDEN
            Uncomment when ready to launch tours
            ============================================ */}
        {/* <div className="mt-2 sm:mt-3 md:mt-5">
          <ToursSection lang={lang} />
        </div> */}

        {/* ============================================
            POPULAR ROUTES
            MOVED: Relocated to /flights page for better context
            Saved ~220px vertical space on homepage
            ============================================ */}

        {/* ============================================
            TRUST INDICATORS / WHY CHOOSE US
            REMOVED: Replaced by sticky CompactTrustBar at top (100% visibility)
            Saved ~500px vertical space
            ============================================ */}

        {/* ============================================
            CUSTOMER TESTIMONIALS
            MOVED: Now in Footer as compact testimonials
            Saved ~437px vertical space on homepage
            ============================================ */}

        {/* ============================================
            FAQ - Answer Common Questions
            Level-6: Compact spacing
            ============================================ */}
        {/* Compact spacing */}
        <div className="mt-4 md:mt-6 mb-4 md:mb-6">
          <FAQ
            title={lang === 'en' ? '❓ Frequently Asked Questions' : lang === 'pt' ? '❓ Perguntas Frequentes' : '❓ Preguntas Frecuentes'}
            subtitle={lang === 'en' ? 'Everything you need to know about booking with Fly2Any' : lang === 'pt' ? 'Tudo o que você precisa saber sobre reservas com Fly2Any' : 'Todo lo que necesitas saber sobre reservas con Fly2Any'}
            categories={faqCategories[lang]}
            language={lang}
          />
        </div>
        </MaxWidthContainer>
      </main>
    </div>
  );
}
