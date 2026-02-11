'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-white/5 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.png"
            alt="Fly2Any Travel Logo"
            width={400}
            height={120}
            className="w-full h-auto max-w-[125px] md:max-w-[160px] drop-shadow-2xl"
            priority
          />
        </div>

        {/* Main Content */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 bg-amber-100 text-amber-800 px-6 py-3 rounded-full font-semibold">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{t("underConstruction")}</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h1>

          <h2 className="text-2xl md:text-3xl font-semibold text-sky-600 mb-6">
            {t("subtitle")}
          </h2>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-10">
            <a href="/flights" className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">✈️</div>
              <h3 className="font-bold text-base text-gray-800">{t("flights")}</h3>
              <p className="text-gray-600 text-xs mt-1">{t("flightsDesc")}</p>
            </a>
            <a href="/hotels" className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              <div className="text-4xl mb-3">🏨</div>
              <h3 className="font-bold text-base text-gray-800">{t("hotels")}</h3>
              <p className="text-gray-600 text-xs mt-1">{t("hotelsDesc")}</p>
            </a>
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl opacity-60">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="font-bold text-base text-gray-800">{t("carRentals")}</h3>
              <p className="text-gray-600 text-xs mt-1">{t("carRentalsDesc")}</p>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl opacity-60">
              <div className="text-4xl mb-3">🎫</div>
              <h3 className="font-bold text-base text-gray-800">{t("tours")}</h3>
              <p className="text-gray-600 text-xs mt-1">{t("toursDesc")}</p>
            </div>
            <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5 rounded-2xl opacity-60">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-bold text-base text-gray-800">{t("insurance")}</h3>
              <p className="text-gray-600 text-xs mt-1">{t("insuranceDesc")}</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-200 pt-8">
            <p className="text-gray-700 font-semibold mb-4">{t("contactTitle")}</p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-6">
              <a
                href="https://wa.me/551151944717"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {t("whatsappButton")}
              </a>

              <a
                href="tel:+13153061646"
                className="flex items-center gap-3 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 00-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/>
                </svg>
                US: +1 (315) 306-1646
              </a>
            </div>

            <a
              href="mailto:fly2any.travel@gmail.com"
              className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              Email Us
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            🚀 {t("techFooter")}
          </p>
        </div>

        {/* Footer */}
        <p className="text-white/90 mt-8 text-sm">
          {t("footer")}
        </p>
      </div>
    </div>
  );
}
