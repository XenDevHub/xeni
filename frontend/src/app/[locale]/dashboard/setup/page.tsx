'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, ChevronDown, ChevronRight, ExternalLink,
  MessageCircle, CreditCard, Truck, Wand2, BarChart3,
  Globe2, Shield, Check, Copy, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface GuideSection {
  id: string;
  title: string;
  icon: typeof Settings;
  color: string;
  status: 'required' | 'recommended' | 'optional';
  steps: { title: string; description: string; action?: string; link?: string }[];
}

const guideSections: GuideSection[] = [
  {
    id: 'facebook',
    title: 'Connect Facebook Page',
    icon: Globe2,
    color: 'from-blue-500 to-indigo-600',
    status: 'required',
    steps: [
      {
        title: 'Step 1: Go to FB Pages section',
        description: 'Navigate to "FB Pages" in the sidebar menu. Click "Connect Page" to begin the Facebook authorization process.',
        action: 'Go to FB Pages',
        link: '/dashboard/pages',
      },
      {
        title: 'Step 2: Authorize XENI',
        description: 'A Facebook popup will appear. Log in with your Facebook account (the one that manages your Business Page). Grant XENI permission to manage messages on your Page.',
      },
      {
        title: 'Step 3: Select Your Page',
        description: 'After authorization, select which Facebook Page you want to connect. The Conversation Agent will automatically start responding to messages on this page.',
      },
      {
        title: 'Step 4: Test It',
        description: 'Send a test message to your Facebook Page from another account. Within seconds, the AI should automatically reply. If it doesn\'t, check the Inbox section for AI/Human mode toggle.',
      },
    ],
  },
  {
    id: 'shop',
    title: 'Set Up Your Shop',
    icon: Settings,
    color: 'from-emerald-500 to-green-600',
    status: 'required',
    steps: [
      {
        title: 'Step 1: Create your shop',
        description: 'Go to "My Shop" and fill in your shop name, phone number, address, and other details. This information is used for order processing and courier booking.',
        action: 'Go to My Shop',
        link: '/dashboard/shop',
      },
      {
        title: 'Step 2: Add products',
        description: 'Go to "Products" and add your product catalog. Include product name, price (in BDT), stock quantity, and a clear description. The AI uses this information to recommend products to customers.',
        action: 'Go to Products',
        link: '/dashboard/products',
      },
      {
        title: 'Step 3: Set up categories',
        description: 'Organize products into categories for easier management. The Conversation Agent references categories when helping customers find products.',
      },
    ],
  },
  {
    id: 'payment',
    title: 'Payment Verification (bKash/Nagad)',
    icon: CreditCard,
    color: 'from-pink-500 to-rose-600',
    status: 'recommended',
    steps: [
      {
        title: 'How bKash/Nagad verification works',
        description: 'When a customer sends a payment via bKash or Nagad, they share the Transaction ID (TrxID) with you via Messenger. The Order Processing Agent can verify this payment automatically.',
      },
      {
        title: 'For automatic verification (Professional+ plan)',
        description: 'If you have the Professional plan or above, the Order Processing Agent will automatically detect payment messages, extract the TrxID, and verify it against bKash/Nagad APIs. Contact support to set up your merchant credentials.',
      },
      {
        title: 'For manual verification',
        description: 'You can manually verify payments in the Orders section. Click on an order, enter the TrxID, and mark it as "verified". The system will then proceed to courier booking if auto-courier is enabled.',
      },
    ],
  },
  {
    id: 'courier',
    title: 'Courier Integration (Pathao/Steadfast)',
    icon: Truck,
    color: 'from-cyan-500 to-blue-600',
    status: 'recommended',
    steps: [
      {
        title: 'Pathao Courier',
        description: 'XENI integrates with Pathao for automated courier pickup booking. When an order is verified, the system can automatically book a Pathao pickup from your shop address.',
      },
      {
        title: 'Steadfast Courier',
        description: 'For Steadfast integration, you\'ll need your Steadfast API key and Secret Key. Contact Steadfast to get your merchant credentials, then share them with XENI support for configuration.',
      },
      {
        title: 'How it works',
        description: 'Once configured, the Order Processing Agent will: 1) Detect a verified payment 2) Auto-create the courier booking 3) Share the tracking number with the customer via Messenger 4) Update the order status in your dashboard.',
      },
    ],
  },
  {
    id: 'creative',
    title: 'Creative Agent Setup',
    icon: Wand2,
    color: 'from-purple-500 to-violet-600',
    status: 'optional',
    steps: [
      {
        title: 'What the Creative Agent does',
        description: 'The Creative Agent generates product descriptions, social media captions, and promotional ad images using AI. It works in both Bangla and English and is optimized for Facebook/Instagram.',
      },
      {
        title: 'How to use it',
        description: 'Go to "Creative" in the sidebar. Select the type of content you want (caption, product description, or image). Enter your product details and click "Generate". The AI will create multiple options for you to choose from.',
        action: 'Go to Creative Studio',
        link: '/dashboard/creative',
      },
      {
        title: 'Requirements',
        description: 'The Creative Agent requires the Premium plan. It uses AI language models to generate text and image content. No additional API keys are needed from you — it\'s all handled by XENI\'s infrastructure.',
      },
    ],
  },
  {
    id: 'intelligence',
    title: 'Sales Intelligence Setup',
    icon: BarChart3,
    color: 'from-amber-500 to-orange-600',
    status: 'optional',
    steps: [
      {
        title: 'What the Intelligence Agent does',
        description: 'The Sales Intelligence Agent analyzes your sales data to identify trends, peak selling hours, top-performing products, and provides AI recommendations to grow your business.',
      },
      {
        title: 'How to use it',
        description: 'Go to "Analytics" in the sidebar. Click "Generate AI Insights" to run the Intelligence Agent. It will analyze your orders, conversations, and products to provide data-driven recommendations.',
        action: 'Go to Analytics',
        link: '/dashboard/analytics',
      },
      {
        title: 'Requirements',
        description: 'Requires the Premium plan and at least some order history for meaningful insights. The more data you have, the better the recommendations will be.',
      },
    ],
  },
  {
    id: 'subscription',
    title: 'Subscription & Billing',
    icon: Shield,
    color: 'from-rose-500 to-pink-600',
    status: 'required',
    steps: [
      {
        title: 'Choose your plan',
        description: 'Go to "Billing" to see available plans. Starter (৳2,500/mo) includes the Conversation Agent. Professional (৳7,500/mo) adds Order Processing and Inventory. Premium (৳25,000/mo) includes all 5 agents.',
        action: 'Go to Billing',
        link: '/billing',
      },
      {
        title: 'Payment methods',
        description: 'Pay via SSLCommerz which supports bKash, Nagad, bank cards (Visa/Mastercard), and internet banking. All pricing is in BDT. Your subscription renews monthly.',
      },
      {
        title: 'Upgrade or downgrade',
        description: 'You can switch plans anytime. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle. Contact support for enterprise pricing.',
      },
    ],
  },
];

function SetupCard({ section, isOpen, onToggle }: { section: GuideSection; isOpen: boolean; onToggle: () => void }) {
  const Icon = section.icon;
  const statusColors = {
    required: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    recommended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    optional: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-white/5 transition-colors"
      >
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
            {section.title}
          </h3>
          <span className={`inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border mt-1 ${statusColors[section.status]}`}>
            {section.status}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              <div className="border-t pt-4" style={{ borderColor: 'var(--border-color)' }} />
              {section.steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary text-sm font-bold">{i + 1}</span>
                    </div>
                    {i < section.steps.length - 1 && (
                      <div className="w-0.5 flex-1 mt-1 rounded-full" style={{ background: 'var(--border-color)' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h4 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
                      {step.title}
                    </h4>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {step.description}
                    </p>
                    {step.action && step.link && (
                      <a
                        href={step.link}
                        className="inline-flex items-center gap-1.5 mt-2 text-sm text-primary font-medium hover:underline"
                      >
                        {step.action} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SetupGuidePage() {
  const [openSection, setOpenSection] = useState<string | null>('facebook');

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
          <Settings className="w-7 h-7 text-primary" /> Setup Guide
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Follow these steps to set up your XENI AI agents and integrations
        </p>
      </div>

      {/* Progress */}
      <div className="glass-card p-5 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Required <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(3 steps)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Recommended <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(2 steps)</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Optional <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>(2 steps)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Guide Sections */}
      <div className="space-y-3">
        {guideSections.map(section => (
          <SetupCard
            key={section.id}
            section={section}
            isOpen={openSection === section.id}
            onToggle={() => setOpenSection(openSection === section.id ? null : section.id)}
          />
        ))}
      </div>

      {/* Help Footer */}
      <div className="glass-card p-6 mt-8 text-center">
        <h3 className="font-heading font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          Need help?
        </h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          If you encounter any issues during setup, our support team is here to help.
        </p>
        <a
          href="mailto:support@xeni.xentroinfotech.com"
          className="btn-primary inline-flex items-center gap-2 text-sm"
        >
          <MessageCircle className="w-4 h-4" /> Contact Support
        </a>
      </div>
    </div>
  );
}
