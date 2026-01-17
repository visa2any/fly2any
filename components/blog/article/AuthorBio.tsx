'use client';

import { motion } from 'framer-motion';
import { User, Twitter, Linkedin, Mail } from 'lucide-react';

interface AuthorBioProps {
  author: {
    name: string;
    role: string;
    bio: string;
  };
}

export function AuthorBio({ author }: AuthorBioProps) {
  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-white shadow-2xl"
      >
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl">
            <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
          </div>

          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-2xl sm:text-3xl font-black mb-1">{author.name}</h3>
              <p className="text-blue-100 text-base sm:text-lg">{author.role}</p>
            </div>
            <p className="text-white/90 text-base sm:text-lg leading-relaxed mb-6">{author.bio}</p>

            <div className="flex gap-3">
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-all active:scale-95 sm:hover:scale-110"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-all active:scale-95 sm:hover:scale-110"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-11 h-11 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-all active:scale-95 sm:hover:scale-110"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
