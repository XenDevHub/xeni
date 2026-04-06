'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useRouter } from '@/i18n/routing';
import { useThemeStore } from '@/store/theme';
import {
  Sparkles, ArrowRight, Check, ChevronDown, Star, Zap, Shield, Globe,
  Sun, Moon, Menu, X, TrendingUp, Quote, Send,
  MessageCircle, ShoppingBag, Package, Wand2, BarChart3,
  Rocket, Bot, CreditCard, Truck
} from 'lucide-react';

/* ──────── DATA ──────── */
const agents = [
  { key: 'conversation', icon: MessageCircle, color: 'from-violet-500 to-purple-600', tier: 'Starter+' },
  { key: 'order', icon: ShoppingBag, color: 'from-emerald-500 to-green-600', tier: 'Professional+' },
  { key: 'inventory', icon: Package, color: 'from-cyan-500 to-blue-600', tier: 'Professional+' },
  { key: 'creative', icon: Wand2, color: 'from-pink-500 to-rose-600', tier: 'Premium' },
  { key: 'intelligence', icon: BarChart3, color: 'from-amber-500 to-orange-600', tier: 'Premium' },
];

const plans = [
  {
    tier: 'starter', price: 1000, popular: false,
    features: ['💬 Conversation Agent', '200 orders/month', '1 Facebook Page', '2 GB storage', 'Email support'],
  },
  {
    tier: 'professional', price: 2500, popular: true,
    features: ['💬 Conversation Agent', '📦 Order Processing Agent', '📊 Inventory Agent', '1,000 orders/month', '3 Facebook Pages', '10 GB storage', 'Priority support'],
  },
  {
    tier: 'premium', price: 5000, popular: false,
    features: ['All 5 AI Agents', 'Unlimited orders', '10 Facebook Pages', '50 GB storage', '🎨 AI Image Generation', '🧠 Sales Intelligence', 'Dedicated support'],
  },
  {
    tier: 'enterprise', price: 0, popular: false,
    features: ['All 5 AI Agents', 'Unlimited everything', 'White-label branding', 'Custom API access', 'ERP Integration', 'Dedicated account manager', 'SLA guarantee'],
  },
];

const steps = [
  { icon: Rocket, title: 'Sign Up Free', description: 'Create your account in 30 seconds. No credit card required.' },
  { icon: Bot, title: 'Connect Facebook Page', description: 'Link your Facebook Page so the AI can manage Messenger conversations.' },
  { icon: CreditCard, title: 'Subscribe & Configure', description: 'Choose a plan, set up bKash/Nagad, and configure your AI agents.' },
  { icon: Truck, title: 'Automate & Scale', description: 'AI handles conversations, orders, and deliveries while you focus on growth.' },
];

const testimonials = [
  { name: 'Rahim Uddin', role: 'Owner', company: 'FashionBD', avatar: 'RU', text: 'XENI transformed my F-commerce! The Conversation Agent handles 500+ Messenger DMs daily while I focus on sourcing new products.' },
  { name: 'Fatima Akter', role: 'Founder', company: 'BeautyCorner BD', avatar: 'FA', text: 'The Order Processing Agent with bKash verification saved me hours of manual payment checking. My order processing is now 10x faster.' },
  { name: 'Kamal Hossain', role: 'CEO', company: 'TechMart BD', avatar: 'KH', text: 'Inventory Agent stopped our overselling problem completely. Low-stock alerts and auto-restock suggestions are game changing.' },
];

const faqs = [
  { q: 'What is XENI?', a: 'XENI is an AI-powered e-commerce operating system built for Bangladeshi F-commerce sellers. It automates Messenger conversations, order processing with bKash/Nagad verification, inventory management, content creation, and sales intelligence.' },
  { q: 'How does Messenger automation work?', a: 'Connect your Facebook Page to XENI, and our Conversation Agent will automatically reply to customer messages 24/7 in Bangla and English. It handles product inquiries, order status checks, and can escalate to you when needed.' },
  { q: 'What payment methods does XENI support?', a: 'XENI supports bKash and Nagad payment verification for your customers. For your subscription, you can pay via SSLCommerz (bKash, Nagad, bank cards). All pricing is in BDT.' },
  { q: 'Can I switch plans anytime?', a: 'Absolutely. Upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing via SSLCommerz.' },
  { q: 'Which courier services are supported?', a: 'XENI integrates with Pathao and Steadfast courier services for automated pickup booking and delivery tracking across Bangladesh.' },
  { q: 'Does XENI support Bangla?', a: 'Yes! XENI fully supports both English and বাংলা. The AI agents can converse with customers in Bangla, and the entire dashboard is bilingual.' },
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

function AgentCard({ agent, index, t, isExpanded, onToggle }: { agent: any; index: number; t: any; isExpanded: boolean; onToggle: () => void }) {
  const Icon = agent.icon;
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

/* ──────── MAIN PAGE ──────── */
export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { theme, toggleTheme } = useThemeStore();
  const router = useRouter();
  const [mobileMenu, setMobileMenu] = useState(false);
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
            <a href="#agents" className="btn-ghost text-sm">{t('nav.your_team')}</a>
            <a href="#pricing" className="btn-ghost text-sm">{t('nav.pricing')}</a>
            <a href="#how-it-works" className="btn-ghost text-sm">{t('nav.how_i_work')}</a>
            <a href="#faq" className="btn-ghost text-sm">{t('nav.faq')}</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'var(--bg-card)' }}>
              <Link href="/" locale="en" className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${locale === 'en' ? 'bg-primary text-white' : ''}`} style={locale !== 'en' ? { color: 'var(--text-muted)' } : undefined}>EN</Link>
              <Link href="/" locale="bn" className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${locale === 'bn' ? 'bg-primary text-white' : ''}`} style={locale !== 'bn' ? { color: 'var(--text-muted)' } : undefined}>বাং</Link>
            </div>
            <button onClick={toggleTheme} className="p-2 rounded-lg transition-all" style={{ background: 'var(--bg-card)' }}>
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </button>
            <Link href="/login" prefetch={true} className="btn-ghost text-sm font-medium">{t('nav.login')}</Link>
            <Link href="/register" prefetch={true} className="btn-primary text-sm py-2 px-5">{t('nav.register')}</Link>
          </div>

          <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden p-2">
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileMenu && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t" style={{ borderColor: 'var(--border-color)' }}>
              <div className="section-container py-4 flex flex-col gap-2">
                <a href="#agents" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>{t('nav.your_team')}</a>
                <a href="#pricing" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>{t('nav.pricing')}</a>
                <a href="#how-it-works" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>{t('nav.how_i_work')}</a>
                <a href="#faq" className="btn-ghost text-sm" onClick={() => setMobileMenu(false)}>{t('nav.faq')}</a>
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
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />
        <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] animate-float pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] animate-float pointer-events-none" style={{ animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="section-container relative text-center z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2 mb-10 shadow-glow cursor-pointer hover:bg-primary/20 transition-colors">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-primary tracking-wide">🇧🇩 Built for Bangladesh F-Commerce</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-heading font-extrabold mb-8 leading-[1.15] tracking-tight">
            <span className="gradient-text drop-shadow-xl">{t('landing.hero_title')}</span>
          </h1>
          <p className="text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed font-medium drop-shadow-sm italic" style={{ color: 'var(--text-secondary)' }}>
            {t('landing.hero_subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/register" prefetch={true} className="btn-primary text-lg px-10 py-5 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(124,58,237,0.4)] hover:shadow-[0_0_40px_rgba(124,58,237,0.6)]">
              {t('landing.cta')} <ArrowRight className="w-6 h-6" />
            </Link>
            <a href="#agents" className="btn-secondary text-lg px-10 py-5 flex items-center justify-center gap-3 border-primary/20 hover:border-primary/50 bg-white/5 backdrop-blur-md">
              {t('landing.cta_secondary')} <Bot className="w-5 h-5 opacity-70" />
            </a>
          </div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-12 mt-20 pt-10 border-t border-white/10" style={{ borderColor: 'var(--border-color)' }}>
            {[{ n: '5', l: 'Smart Agents' }, { n: '24/7', l: 'Messenger Auto-Reply' }, { n: '99.9%', l: 'Uptime' }, { n: 'বাংলা', l: '& English Support' }].map(s => (
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
          <p className="section-subtitle">Start automating your F-commerce in 4 simple steps</p>

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
            <p className="section-subtitle text-xl max-w-3xl leading-relaxed italic">{t('landing.features_subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            {agents.slice(0, 3).map((agent, i) => (
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
            {agents.slice(3).map((agent, i) => (
              <AgentCard
                key={agent.key}
                agent={agent}
                index={i + 3}
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
          <p className="section-subtitle">All prices in BDT. Pay with bKash, Nagad, or card via SSLCommerz.</p>

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
                  {plan.price > 0 ? (
                    <>
                      <span className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
                        ৳{plan.price.toLocaleString()}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('billing.month')}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('billing.custom_pricing')}</span>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link href="/register" prefetch={true} className={plan.popular ? 'btn-primary w-full text-center text-sm' : 'btn-secondary w-full text-center text-sm'}>
                  {plan.tier === 'enterprise' ? t('billing.contact_sales') : t('billing.subscribe')}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="section-padding">
        <div className="section-container">
          <h2 className="section-title">Loved by <span className="gradient-text">Sellers</span> Across Bangladesh</h2>
          <p className="section-subtitle">See what F-commerce owners say about XENI</p>

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
                Ready to <span className="gradient-text">Automate</span> Your Shop?
              </h2>
              <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
                Join hundreds of Bangladeshi sellers using XENI to automate their Messenger, orders, and deliveries.
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
            Get F-commerce tips, product updates, and exclusive offers delivered to your inbox.
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
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>AI-powered e-commerce operating system for Bangladeshi F-commerce sellers.</p>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#agents" className="hover:text-primary transition-colors">AI Agents</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Integrations</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><span>Facebook Messenger</span></li>
                <li><span>bKash & Nagad</span></li>
                <li><span>Pathao Courier</span></li>
                <li><span>Steadfast Courier</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Legal</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2026 XENI. All rights reserved.</p>
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
