import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, ChevronUp, Search, ShieldAlert, Truck, RefreshCw } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: 'Shipping' | 'Warranty' | 'Products' | 'Security';
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How long does the complimentary shipping take?',
    answer: 'Our free standard shipping typically takes 3 to 5 business days. We dispatch orders within 24 hours of successful payment authorization. Express shipping option is available during checkout (1-2 business days).',
    category: 'Shipping'
  },
  {
    question: 'What is your return and refund policy?',
    answer: 'We offer a hassle-free 30-day return policy. Devices must be returned in their original box with all accessories, free of physical damage, and logged out of any active personal accounts.',
    category: 'Shipping'
  },
  {
    question: 'Are these devices covered under official warranty?',
    answer: 'Absolutely. Every phone, watch, and accessory sold on PixelMart is 100% authentic and carries the official 1-Year manufacturer warranty, which can be serviced at any authorized center globally.',
    category: 'Warranty'
  },
  {
    question: 'How do I claim a warranty repair after 30 days?',
    answer: 'Simply carry your original PixelMart invoice receipt to your nearest authorized Brand Service Center. Alternatively, you can open a support ticket on our Contact page and our specialists will help guide the factory claim process.',
    category: 'Warranty'
  },
  {
    question: 'Are your devices unlocked for all carriers?',
    answer: 'Yes, all premium smartphones sold on our storefront are fully factory unlocked. They support both physical SIM cards and eSIM profiles, making them compatible with any major network carrier worldwide.',
    category: 'Products'
  },
  {
    question: 'What is the software experience like?',
    answer: 'Devices purchased here come directly with the default clean stock OS. There is no carrier bloatware, heavy third-party shells, or slow pre-installed duplicate apps. You get instant access to monthly security patches.',
    category: 'Products'
  },
  {
    question: 'Is my credit card checkout secure?',
    answer: 'Yes, our systems never store or see your complete credit card digits. Checkout is brokered by Cashfree Payments APIs using secure SSL encrow and end-to-end payment encryption.',
    category: 'Security'
  }
];

export default function FAQ() {
  useEffect(() => {
    document.title = "Frequently Asked Questions | PixelMart Support";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Find quick answers to common questions about PixelMart shipping times, device warranties, returns, and secured payment options.");
    }
    window.scrollTo(0, 0);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredItems = FAQ_ITEMS.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div id="faq-page" className="bg-neutral-50/40 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-neutral-900 text-white mb-4 shadow-sm">
              <HelpCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Help & FAQs</h1>
            <p className="mt-2 text-xs text-neutral-500">
              Find immediate answers about orders, warranties, unlocking, and technical support.
            </p>
          </motion.div>
        </div>

        {/* Search bar & Category filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all shadow-xs"
            />
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-neutral-400" />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {['All', 'Shipping', 'Warranty', 'Products', 'Security'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                    : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordion FAQ List */}
        <div className="space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-neutral-50/50"
                  >
                    <span className="text-xs font-bold text-neutral-900 pr-4">{item.question}</span>
                    <span className="text-neutral-500 shrink-0">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 border-t border-neutral-50 text-xs text-neutral-500 leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200/80 space-y-2">
              <p className="text-xs font-semibold text-neutral-700">No help articles found</p>
              <p className="text-[10px] text-neutral-400">Try searching for other terms or pick another category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
