import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Instagram, MessageCircle, Send } from 'lucide-react';
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  Language,
  WHATSAPP_DISPLAY,
} from '../data/fragrances';
import { Translations } from '../data/translations';
import {
  assertSafeExternalUrl,
  buildConciergeWhatsAppUrl,
  MAX_EMAIL_LENGTH,
  MAX_MESSAGE_LENGTH,
  MAX_NAME_LENGTH,
  sanitizeUserText,
  validateContactForm,
} from '../utils/storeLogic';
import { ScrollReveal } from '../components/ScrollReveal';

interface ContactViewProps {
  lang: Language;
  t: Translations;
}

const MIN_SUBMIT_COOLDOWN_MS = 4000;

export const ContactView: React.FC<ContactViewProps> = ({ lang, t }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<{
    name: string;
    message: string;
  } | null>(null);
  const lastSubmitTimeRef = useRef<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Anti-spam client rate limit (4s cooldown)
    const now = Date.now();
    if (now - lastSubmitTimeRef.current < MIN_SUBMIT_COOLDOWN_MS) {
      return;
    }

    if (!validateContactForm({ name, email, message, honeypot })) {
      setError(t.contact.validationError);
      return;
    }

    lastSubmitTimeRef.current = now;
    setError(null);
    setSubmittedMessage({
      name: sanitizeUserText(name, MAX_NAME_LENGTH, false),
      message: sanitizeUserText(message, MAX_MESSAGE_LENGTH, true),
    });
    setName('');
    setEmail('');
    setMessage('');
    setHoneypot('');
  };

  const safeInstagramHref = assertSafeExternalUrl(INSTAGRAM_URL);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-20 pb-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Direct Channels */}
        <div className="lg:col-span-5 space-y-7 sm:space-y-8">
          <div className="space-y-3.5 sm:space-y-4">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-[11px] sm:text-xs tracking-[0.26em] uppercase text-[#8C6239] font-medium"
            >
              {t.contact.kicker}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.68,
                delay: 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif-editorial text-[42px] sm:text-6xl text-[#1E150F] leading-[1.08]"
            >
              <span className="block">{t.contact.titlePart1}</span>
              <span className="block italic text-[#8C6239] font-normal">
                {t.contact.titleItalic}
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.65,
                delay: 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-[15px] sm:text-base text-[#6B5748] leading-relaxed"
            >
              {t.contact.subtitle}
            </motion.p>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            {/* WhatsApp Card */}
            <ScrollReveal delay={0.12} distance={20}>
              <a
                href={buildConciergeWhatsAppUrl(lang)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border border-[#E6DDD0] hover:border-[#8C6239] transition-colors group"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-[#E6DDD0] bg-white flex items-center justify-center text-[#8C6239] group-hover:bg-[#2B1D14] group-hover:text-[#FAF7F2] group-hover:border-[#2B1D14] transition-colors shrink-0">
                  <MessageCircle className="w-5 h-5 stroke-[1.7]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.14em] text-[#6B5748]">
                    {t.contact.whatsappLabel}
                  </p>
                  <p className="mt-1 font-serif-editorial text-2xl sm:text-[26px] text-[#1E150F] lining-nums tabular-nums">
                    {WHATSAPP_DISPLAY}
                  </p>
                </div>
              </a>
            </ScrollReveal>

            {/* Instagram Card */}
            <ScrollReveal delay={0.18} distance={20}>
              <a
                href={safeInstagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 sm:gap-5 p-5 sm:p-6 rounded-3xl bg-[#FAF7F2] border border-[#E6DDD0] hover:border-[#8C6239] transition-colors group"
              >
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border border-[#E6DDD0] bg-white flex items-center justify-center text-[#8C6239] group-hover:bg-[#2B1D14] group-hover:text-[#FAF7F2] group-hover:border-[#2B1D14] transition-colors shrink-0">
                  <Instagram className="w-5 h-5 stroke-[1.7]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs tracking-[0.14em] text-[#6B5748]">
                    {t.contact.instagramLabel}
                  </p>
                  <p className="mt-1 font-serif-editorial text-2xl sm:text-[26px] text-[#1E150F] truncate">
                    {INSTAGRAM_HANDLE}
                  </p>
                </div>
              </a>
            </ScrollReveal>
          </div>
        </div>

        {/* Right Column: Write to the house Form */}
        <ScrollReveal
          delay={0.15}
          distance={26}
          className="lg:col-span-7"
        >
          <div className="rounded-[28px] bg-[#FAF7F2] border border-[#E6DDD0] p-6 sm:p-10">
            <h2 className="font-serif-editorial text-3xl text-[#1E150F] mb-6 sm:mb-7">
              {t.contact.formTitle}
            </h2>

            {submittedMessage && (
              <div
                role="status"
                className="mb-6 rounded-2xl border border-[#B08455]/50 bg-white p-5 space-y-3"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#8C6239] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#1E150F] leading-relaxed">
                    {t.contact.sentSuccess}
                  </p>
                </div>
                <a
                  href={buildConciergeWhatsAppUrl(
                    lang,
                    `Hello SALIM FRAGRANCE, my name is ${submittedMessage.name}. ${submittedMessage.message}`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.18em] uppercase text-[#8C6239] hover:underline"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{t.hero.orderWhatsapp}</span>
                </a>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              autoComplete="on"
              className="space-y-5 sm:space-y-6"
            >
              {/* Hidden anti-bot honeypot field */}
              <div className="sr-only" aria-hidden="true">
                <label htmlFor="contact-company-website">Website</label>
                <input
                  id="contact-company-website"
                  name="company_website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs tracking-[0.12em] text-[#6B5748] mb-2"
                >
                  {t.contact.nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  maxLength={MAX_NAME_LENGTH}
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contact.namePlaceholder}
                  className="w-full h-12 sm:h-13 px-4 rounded-2xl bg-white border border-[#E6DDD0] text-sm text-[#1E150F] placeholder:text-[#6B5748]/60 focus:outline-none focus:border-[#8C6239] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs tracking-[0.12em] text-[#6B5748] mb-2"
                >
                  {t.contact.emailLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  maxLength={MAX_EMAIL_LENGTH}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.contact.emailPlaceholder}
                  className="w-full h-12 sm:h-13 px-4 rounded-2xl bg-white border border-[#E6DDD0] text-sm text-[#1E150F] placeholder:text-[#6B5748]/60 focus:outline-none focus:border-[#8C6239] transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs tracking-[0.12em] text-[#6B5748] mb-2"
                >
                  {t.contact.messageLabel}
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  maxLength={MAX_MESSAGE_LENGTH}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full p-4 rounded-2xl bg-white border border-[#E6DDD0] text-sm text-[#1E150F] placeholder:text-[#6B5748]/60 focus:outline-none focus:border-[#8C6239] transition-colors resize-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-[#B91C1C] font-medium">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-full bg-[#2B1D14] hover:bg-[#3E2A1E] active:scale-[0.99] text-[#FAF7F2] text-xs font-semibold tracking-[0.2em] uppercase inline-flex items-center justify-center gap-2.5 transition-all shadow-sm"
              >
                <Send className="w-4 h-4 stroke-[1.9]" />
                <span>{t.contact.sendBtn}</span>
              </button>
            </form>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};
