/**
 * ULTRATHINK BRAZILIAN CITY LANDING PAGE
 * Dynamic pages for Brazilian diaspora communities
 * Trilingual optimization (PT/ES/EN)
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CityLandingGenerator from '@/lib/seo/city-landing-generator';
import { brazilianDiaspora } from '@/lib/data/brazilian-diaspora';

interface CityPageProps {
  params: Promise<{
    cityId: string;
    lang: 'pt' | 'en' | 'es';
  }>;
}

// Generate static params for all city/language combinations
export async function generateStaticParams() {
  const params: Array<{cityId: string; lang: 'pt' | 'en' | 'es'}> = [];
  
  brazilianDiaspora.forEach(city => {
    params.push(
      { cityId: city.id, lang: 'pt' },
      { cityId: city.id, lang: 'en' },
      { cityId: city.id, lang: 'es' }
    );
  });
  
  return params;
}

// Generate metadata for each city page
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { cityId, lang } = await params;
  const cityData = CityLandingGenerator.generateCityPage(cityId, lang);
  
  if (!cityData) {
    return {
      title: 'City Not Found - Fly2Any',
      description: 'The requested city page was not found.'
    };
  }

  return cityData.metadata;
}

export default async function CityPage({ params }: CityPageProps) {
  const { cityId, lang } = await params;
  const cityData = CityLandingGenerator.generateCityPage(cityId, lang);
  
  if (!cityData) {
    notFound();
  }

  const { city, content } = cityData;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(cityData.structuredData)
        }}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {content.hero.title[lang]}
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {content.hero.subtitle[lang]}
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300">
              {content.hero.cta[lang]}
            </button>
          </div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {content.community.title[lang]}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {city.population.brazilian.toLocaleString()}
                </div>
                <div className="text-gray-600">
                  {lang === 'pt' ? 'Brasileiros' : lang === 'en' ? 'Brazilians' : 'Brasileños'}
                </div>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {city.population.percentage.toFixed(1)}%
                </div>
                <div className="text-gray-600">
                  {lang === 'pt' ? 'da População' : lang === 'en' ? 'of Population' : 'de la Población'}
                </div>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {city.neighborhoods.length}
                </div>
                <div className="text-gray-600">
                  {lang === 'pt' ? 'Bairros Principais' : lang === 'en' ? 'Main Areas' : 'Barrios Principales'}
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md">
              <p className="text-gray-700 text-lg mb-4">
                {content.community.description[lang]}
              </p>
              <p className="text-gray-600">
                {content.community.neighborhoods[lang]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {content.services.title[lang]}
            </h2>
            
            <div className="text-center mb-12">
              <p className="text-xl text-gray-700">
                {content.services.description[lang]}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {content.services.features[lang].map((feature, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow duration-300">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-blue-600">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {content.testimonials.title[lang]}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {content.testimonials.reviews.map((review, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <span className="font-semibold text-blue-600">
                        {review.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{review.name}</h4>
                      <p className="text-gray-600 text-sm">{review.location}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{review.text[lang]}"</p>
                  <div className="flex text-yellow-400 mt-4">
                    {'★'.repeat(5)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {content.faq.title[lang]}
            </h2>
            
            <div className="space-y-6">
              {content.faq.questions.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-3 text-blue-600">
                    {faq.question[lang]}
                  </h3>
                  <p className="text-gray-700">
                    {faq.answer[lang]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {lang === 'pt' ? `Pronto para Voar de ${city.name} para o Brasil?` :
               lang === 'en' ? `Ready to Fly from ${city.name} to Brazil?` :
               `¿Listo para Volar de ${city.name} a Brasil?`}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {lang === 'pt' ? 'Especialistas na comunidade brasileira. Cotação grátis em 2 horas!' :
               lang === 'en' ? 'Brazilian community specialists. Free quote in 2 hours!' :
               'Especialistas en la comunidad brasileña. ¡Cotización gratis en 2 horas!'}
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300">
              {content.hero.cta[lang]}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}