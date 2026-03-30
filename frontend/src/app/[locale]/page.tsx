'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useThemeStore } from '@/store/theme';
import {
  Sparkles, Search, Users, FileText, Mail, BarChart3, Share2,
  ArrowRight, Check, ChevronDown, Star, Zap, Shield, Globe,
  Sun, Moon, Menu, X, Rocket, Brain, Clock, TrendingUp,
  Quote, Send
} from 'lucide-react';

/* ──────── DATA ──────── */
const agents = [
  { key: 'seo_audit', icon: Search, color: 'from-violet-500 to-purple-600', tier: 'Free+' },
  { key: 'content_writing', icon: FileText, color: 'from-emerald-500 to-green-600', tier: 'Basic+' },
  { key: 'lead_generation', icon: Users, color: 'from-cyan-500 to-blue-600', tier: 'Pro+' },
  { key: 'social_media', icon: Share2, color: 'from-pink-500 to-rose-600', tier: 'Pro+' },
  { key: 'email_marketing', icon: Mail, color: 'from-amber-500 to-orange-600', tier: 'Pro+' },
  { key: 'analytics', icon: BarChart3, color: 'from-indigo-500 to-blue-700', tier: 'Enterprise' },
];

const plans = [
  { tier: 'free', agents: 1, tasks: 2, storage: '100MB', bdt: 0, usd: 0, popular: false, features: ['1 AI Agent (SEO)', '2 tasks/day', '100MB storage', 'Community support'] },
  { tier: 'basic', agents: 2, tasks: 10, storage: '1GB', bdt: 999, usd: 9, popular: false, features: ['2 AI Agents', '10 tasks/day', '1GB storage', 'Email support', 'Export reports'] },
  { tier: 'pro', agents: 5, tasks: 50, storage: '10GB', bdt: 2499, usd: 24, popular: true, features: ['5 AI Agents', '50 tasks/day', '10GB storage', 'Priority support', 'API access', 'Team sharing'] },
  { tier: 'enterprise', agents: 6, tasks: -1, storage: '100GB', bdt: 5999, usd: 59, popular: false, features: ['All 6 Agents', 'Unlimited tasks', '100GB storage', 'Dedicated support', 'Custom integrations', 'SSO & RBAC', 'SLA guarantee'] },
];

const steps = [
  { icon: Rocket, title: 'Sign Up Free', description: 'Create your account in 30 seconds. No credit card required.' },
  { icon: Brain, title: 'Choose Your Agent', description: 'Pick from 6 specialized AI agents tailored for your business needs.' },
  { icon: Zap, title: 'Get AI Results', description: 'Submit tasks and receive professional-grade output in seconds.' },
  { icon: TrendingUp, title: 'Scale & Grow', description: 'Upgrade your plan as your business grows. Unlock more agents.' },
];

const testimonials = [
  { name: 'Sarah Chen', role: 'Marketing Director', company: 'TechFlow', avatar: 'SC', text: 'XENI transformed our content workflow. The SEO agent alone saved us 20 hours per week. Absolutely game-changing.' },
  { name: 'Ahmed Rahman', role: 'CEO', company: 'DigiShop BD', avatar: 'AR', text: 'SSLCommerz integration made it seamless for our Bangladeshi team. The lead gen agent is incredibly accurate.' },
  { name: 'Emily Rodriguez', role: 'Growth Lead', company: 'ScaleUp', avatar: 'ER', text: 'We went from manually writing social posts to having AI generate an entire month of content in minutes.' },
];

const faqs = [
  { q: 'What is XENI?', a: 'XENI is an AI-powered business operating system with 6 specialized agents for SEO, lead generation, social media, content writing, email marketing, and analytics.' },
  { q: 'Is there a free plan?', a: 'Yes! Our Free plan includes the SEO Audit agent with 2 tasks per day. No credit card required to start.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major payments through SSLCommerz including bKash, Nagad, and local/international bank cards.' },
  { q: 'Can I switch plans anytime?', a: 'Absolutely. Upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.' },
  { q: 'Is my data secure?', a: 'Yes. We use AES-256 encryption, JWT with Redis blocklist, 2FA support, and all data is stored in SOC 2 compliant infrastructure.' },
  { q: 'Do you support Bangla?', a: 'Yes! XENI fully supports both English and বাংলা. Switch languages anytime from the navbar or settings.' },
];

/* ──────── COMPONENTS ──────── */
function FAQItem({ q, a, isOpen, onClick }: { q: string; a: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="glass-card overflow-hidden">
      <button onClick={onClick} className="w-full flex justify-between items-center p-5 text-left">
        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <p className="px-5 pb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────── MAIN PAGE ──────── */
function AgentCard({ agent, index, t, isExpanded, onToggle }: { agent: any; index: number; t: any; isExpanded: boolean; onToggle: () => void }) {
  const Icon = agent.icon;
  // Get array of features from translations
  const features: string[] = t.raw(`agents.${agent.key}.features`) || [];
  
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} viewport={{ once: true }} className="glass-card-hover p-7 flex flex-col h-full cursor-pointer relative overflow-hidden group border border-white/10" onClick={onToggle}>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: `linear-gradient(to right, var(--glow-primary), var(--glow-accent))` }}></div>
      <div className="flex items-start justify-between mb-5">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="badge bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider border border-primary/20 shadow-sm">{agent.tier}</span>
      </div>
      <h3 className="text-xl md:text-2xl font-heading font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{t(`agents.${agent.key}.name`)}</h3>
      <p className="text-[15px] mb-6 leading-relaxed flex-grow" style={{ color: 'var(--text-muted)' }}>{t(`agents.${agent.key}.description`)}</p>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between border-t pt-5 transition-colors duration-300" style={{ borderColor: 'var(--border-color)' }}>
          <span className="text-sm font-semibold gradient-text tracking-wide uppercase">{t('landing.learn_more')}</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner group-hover:bg-primary/20">
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </div>
        
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="overflow-hidden">
              <ul className="pt-5 space-y-3 pb-2">
                {features.map((feature, idx) => (
                  <motion.li initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + (idx * 0.05) }} key={idx} className="flex items-start gap-3 text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="leading-snug">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [pricingCurrency] = useState<'bdt'>('bdt');
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ═══ NAVBAR ═══ */}
      <nav className="fixed top-0 w-full z-50 glass-card border-none border-b" style={{ borderColor: 'var(--border-color)' }}>
        <div className="section-container py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-heading font-bold gradient-text">XENI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            <a href="#agents" className="btn-ghost text-sm">Agents</a>
            <a href="#pricing" className="btn-ghost text-sm">Pricing</a>
            <a href="#how-it-works" className="btn-ghost text-sm">How It Works</a>
            <a href="#faq" className="btn-ghost text-sm">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-card)' }}>
              <Link href="/" locale="en" className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${locale === 'en' ? 'bg-primary text-white' : ''}`} style={locale !== 'en' ? { color: 'var(--text-muted)' } : undefined}>EN</Link>
              <Link href="/" locale="bn" className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${locale === 'bn' ? 'bg-primary text-white' : ''}`} style={locale !== 'bn' ? { color: 'var(--text-muted)' } : undefined}>বাং</Link>
            </div>

            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-all" style={{ background: 'var(--bg-card)' }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>

            <Link href="/login" prefetch={true} className="btn-ghost text-sm font-medium">{t('nav.login')}</Link>
            <Link href="/register" prefetch={true} className="btn-primary text-sm py-2 px-5">{t('nav.register')}</Link>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="section-container py-4 flex flex-col gap-2">
                <a href="#agents" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>Agents</a>
                <a href="#pricing" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>Pricing</a>
                <a href="#how-it-works" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>How It Works</a>
                <a href="#faq" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>FAQ</a>
                <div className="flex gap-2 pt-2">
                  <button onClick={toggleTheme} className="btn-ghost p-2 rounded-lg">{theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
                  <Link href="/login" prefetch={true} className="btn-secondary text-sm py-2 flex-1 text-center">{t('nav.login')}</Link>
                  <Link href="/register" prefetch={true} className="btn-primary text-sm py-2 flex-1 text-center">{t('nav.register')}</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-36 overflow-hidden">
        {/* Glowing Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="section-container relative text-center z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-10 shadow-glow cursor-pointer hover:bg-primary/20 transition-colors">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">Powered by Advanced Core Agents</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-8 leading-[1.15] tracking-tight">
            <span className="gradient-text drop-shadow-xl">{t('landing.hero_title')}</span>
          </h1>
          <p className="text-lg md:text-2xl max-w-4xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/register" prefetch={true} className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]">
              {t('landing.cta')} <ArrowRight className="w-6 h-6" />
            </Link>
            <a href="#agents" className="btn-secondary text-lg px-10 py-5 flex items-center justify-center gap-3 border-primary/20 hover:border-primary/50 bg-white/5 backdrop-blur-md">
              {t('landing.cta_secondary')} <Search className="w-5 h-5 opacity-70" />
            </a>
          </div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-12 mt-20 pt-10 border-t border-white/10" style={{ borderColor: 'var(--border-color)' }}>
            {[{ n: '6', l: 'AI Agents' }, { n: '10K+', l: 'Tasks Processed' }, { n: '99.9%', l: 'Uptime' }, { n: '<2s', l: 'Avg Response' }].map(s => (
              <div key={s.l} className="text-center group">
                <div className="text-3xl md:text-4xl font-heading font-black gradient-text group-hover:scale-110 transition-transform duration-300">{s.n}</div>
                <div className="text-sm md:text-base mt-2 font-medium" style={{ color: 'var(--text-muted)' }}>{s.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
          <p className="section-subtitle">Get started in minutes with our simple 4-step process</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div key={step.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6 text-center relative">
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-bold">{i + 1}</div>
                <step.icon className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ AGENTS ═══ */}
      <section id="agents" className="relative section-padding">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
        
        <div className="section-container relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="section-title text-5xl mb-6">{t('landing.features_title')}</h2>
            <p className="section-subtitle text-xl max-w-3xl leading-relaxed">Each agent is highly specialized to execute specific workflows completely autonomously.</p>
          </motion.div>

          {/* 3-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            {agents.map((agent, i) => (
              <AgentCard
                key={agent.key}
                agent={agent}
                index={i}
                t={t}
                isExpanded={expandedAgent === agent.key}
                onToggle={() => setExpandedAgent(expandedAgent === agent.key ? null : agent.key)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section id="pricing" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container">
          <h2 className="section-title">Simple, Transparent <span className="gradient-text">Pricing</span></h2>
          <p className="section-subtitle">Start free. Upgrade when you&apos;re ready. No hidden fees.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {plans.map((plan, i) => (
              <motion.div key={plan.tier} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                className={`glass-card p-6 relative ${plan.popular ? 'ring-2 ring-primary shadow-glow' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-heading font-bold capitalize mb-1" style={{ color: 'var(--text-primary)' }}>{t(`billing.${plan.tier}`)}</h3>
                <div className="mb-5">
                  <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {`৳${plan.bdt.toLocaleString()}`}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('billing.month')}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" prefetch={true} className={plan.popular ? 'btn-primary w-full text-center text-sm' : 'btn-secondary w-full text-center text-sm'}>
                  {plan.tier === 'free' ? 'Start Free' : 'Get Started'}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="section-title">Loved by <span className="gradient-text">Teams</span> Worldwide</h2>
          <p className="section-subtitle">See what our customers say about XENI</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="glass-card p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-white text-sm font-bold">{t.avatar}</div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.role}, {t.company}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container max-w-3xl">
          <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
          <p className="section-subtitle">Everything you need to know about XENI</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openFAQ === i} onClick={() => setOpenFAQ(openFAQ === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="section-padding">
        <div className="section-container">
          <div className="glass-card p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Ready to <span className="gradient-text">Supercharge</span> Your Business?
              </h2>
              <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                Join thousands of businesses using XENI to automate their marketing, content, and analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register" prefetch={true} className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2 shadow-glow">
                  {t('landing.cta')} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/login" prefetch={true} className="btn-secondary text-lg px-8 py-4">{t('landing.cta_login')}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
        <div className="section-container max-w-2xl text-center">
          <Send className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            Stay in the <span className="gradient-text">Loop</span>
          </h2>
          <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
            Get AI tips, product updates, and exclusive offers delivered to your inbox.
          </p>
          <form onSubmit={(e) => { e.preventDefault(); setNewsletterEmail(''); }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="input-field flex-1 text-sm"
            />
            <button type="submit" className="btn-primary text-sm px-6 py-3 flex items-center justify-center gap-2 whitespace-nowrap">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs mt-4" style={{ color: 'var(--text-muted)' }}>No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
                <span className="text-lg font-heading font-bold gradient-text">XENI</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI-powered business operating system for the modern enterprise.</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#agents" className="hover:text-primary transition-colors">AI Agents</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2024 XENI. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="/" locale="en" className="text-xs font-medium hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>English</Link>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <Link href="/" locale="bn" className="text-xs font-medium hover:text-primary transition-colors" style={{ color: 'var(--text-muted)' }}>বাংলা</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
