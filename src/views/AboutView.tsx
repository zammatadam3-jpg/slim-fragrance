import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ATELIER_STORY_IMAGE, Language, PageView } from '../data/fragrances';
import { Translations } from '../data/translations';
import { buildConciergeWhatsAppUrl } from '../utils/storeLogic';
import { LuxuryImage } from '../components/LuxuryImage';
import { ScrollReveal } from '../components/ScrollReveal';

interface AboutViewProps {
  lang: Language;
  t: Translations;
  onNavigate: (page: PageView) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, t, onNavigate }) => {
  return (
    <div className="pb-28 space-y-20 sm:space-y-24">
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20">
        <div className="space-y-7 sm:space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium"
          >
            {t.story.kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-editorial text-[42px] sm:text-6xl text-[#1E150F] leading-[1.08] text-balance"
          >
            <span>{t.story.titlePart1} </span>
            <span className="italic text-[#8C6239] font-normal">
              {t.story.titleItalic}
            </span>
          </motion.h1>

          <ScrollReveal
            delay={0.12}
            scale={0.98}
            className="rounded-[26px] sm:rounded-[28px] overflow-hidden border border-[#E6DDD0] aspect-[4/3] sm:aspect-[16/10] bg-[#FAF7F2] shadow-[0_18px_45px_rgba(30,21,15,0.1)] my-6 sm:my-8"
          >
            <LuxuryImage
              src={ATELIER_STORY_IMAGE}
              alt="SALIM FRAGRANCE Atelier Ksar El Kebir"
              fallbackLabel="Maison Ksar El Kebir"
              className="w-full h-full object-cover"
            />
          </ScrollReveal>

          <div className="max-w-3xl space-y-5 sm:space-y-6 text-[15px] sm:text-lg text-[#6B5748] leading-relaxed">
            <ScrollReveal delay={0.1} distance={20}>
              <p>{t.story.p1}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.18} distance={20}>
              <p>{t.story.p2}</p>
            </ScrollReveal>
            <ScrollReveal delay={0.24} distance={20}>
              <p>{t.story.p3}</p>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.28} distance={18} className="pt-2 sm:pt-4">
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-3 transition-colors whitespace-nowrap shadow-sm"
            >
              <span>{t.story.cta}</span>
              <ArrowRight
                className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`}
              />
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* Let Us Help You Choose CTA */}
      <section className="border-t border-[#E6DDD0] pt-16 sm:pt-20 max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <div className="space-y-6">
          <ScrollReveal distance={18}>
            <p className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium">
              {t.conciergeCta.kicker}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.08} distance={24}>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-[#1E150F] leading-[1.12] text-balance">
              <span>{t.conciergeCta.titlePart1} </span>
              <span className="italic text-[#8C6239] font-normal">
                {t.conciergeCta.titleItalic}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal
            delay={0.16}
            distance={18}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5 sm:gap-4"
          >
            <a
              href={buildConciergeWhatsAppUrl(lang)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-9 py-4 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase transition-colors whitespace-nowrap text-center shadow-sm"
            >
              {t.conciergeCta.primaryBtn}
            </a>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto px-8 py-4 rounded-full border border-[#D4C2AC] bg-[#FAF7F2] hover:bg-[#F5EFE6] hover:border-[#8C6239] text-xs font-medium tracking-[0.2em] uppercase text-[#1E150F] transition-colors whitespace-nowrap"
            >
              {t.conciergeCta.secondaryBtn}
            </button>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};
