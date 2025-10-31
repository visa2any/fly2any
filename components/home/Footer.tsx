'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FooterContent {
  company: string;
  about: string;
  careers: string;
  press: string;
  blog: string;
  support: string;
  help: string;
  contact: string;
  faq: string;
  destinations: string;
  legal: string;
  privacy: string;
  terms: string;
  cookies: string;
  newsletter: string;
  emailPlaceholder: string;
  subscribe: string;
  copyright: string;
  payments: string;
}

interface Props {
  content: FooterContent;
}

export function Footer({ content }: Props) {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                📬 {content.newsletter}
              </h3>
              <p className="text-gray-400">Get exclusive deals and travel inspiration</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Input
                placeholder={content.emailPlaceholder}
                className="bg-gray-800 border-gray-700 text-white w-full md:w-80"
              />
              <Button variant="primary">
                {content.subscribe}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '48px 24px' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Company Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">{content.company}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {content.about}
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-400 hover:text-white transition-colors">
                  {content.careers}
                </a>
              </li>
              <li>
                <a href="/press" className="text-gray-400 hover:text-white transition-colors">
                  {content.press}
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-400 hover:text-white transition-colors">
                  {content.blog}
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">{content.support}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/help" className="text-gray-400 hover:text-white transition-colors">
                  {content.help}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {content.contact}
                </a>
              </li>
              <li>
                <a href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  {content.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Destinations Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">{content.destinations}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/destinations/paris" className="text-gray-400 hover:text-white transition-colors">
                  Paris
                </a>
              </li>
              <li>
                <a href="/destinations/tokyo" className="text-gray-400 hover:text-white transition-colors">
                  Tokyo
                </a>
              </li>
              <li>
                <a href="/destinations/new-york" className="text-gray-400 hover:text-white transition-colors">
                  New York
                </a>
              </li>
              <li>
                <a href="/destinations/dubai" className="text-gray-400 hover:text-white transition-colors">
                  Dubai
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-lg mb-4">{content.legal}</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {content.privacy}
                </a>
              </li>
              <li>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {content.terms}
                </a>
              </li>
              <li>
                <a href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                  {content.cookies}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Image
                src="/fly2any-logo.png"
                alt="Fly2Any"
                width={120}
                height={36}
                className="h-8 w-auto brightness-0 invert"
              />
            </div>

            {/* Payment Methods */}
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400 mb-2">{content.payments}</p>
              <div className="flex gap-2">
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">💳 Visa</span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">💳 Mastercard</span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">💳 Amex</span>
                <span className="bg-gray-800 px-3 py-1 rounded text-xs">💳 PayPal</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors text-2xl">
                📘
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors text-2xl">
                🐦
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-white transition-colors text-2xl">
                📷
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-gray-400 text-sm">
            {content.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
