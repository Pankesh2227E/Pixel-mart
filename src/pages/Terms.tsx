import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, ShieldCheck, Scale, AlertOctagon } from 'lucide-react';

export default function Terms() {
  useEffect(() => {
    document.title = "Terms of Service | PixelMart Agreement";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Review the official Terms and Conditions governing user purchases, product usage, and warranty registrations at PixelMart.");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="terms-page" className="bg-white min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="border-b border-neutral-100 pb-8 mb-10 text-center sm:text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">Terms & Conditions</h1>
              <p className="text-xs text-neutral-500 mt-1">Last Updated: July 4, 2026</p>
            </div>
          </motion.div>
        </div>

        {/* Content Block */}
        <div className="space-y-8 text-xs text-neutral-600 leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <span>1. Terms of Agreement</span>
            </h2>
            <p>
              By accessing, browsing, or placing orders on PixelMart, you acknowledge that you have read, understood, and agreed to remain legally bound by these terms. If you do not accept these policies, you must immediately terminate your session on the store.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neutral-500" />
              <span>2. Product Listings and Catalog Specs</span>
            </h2>
            <p>
              We strive to display exact, real-time specifications for all premium devices. In rare instances, manufacturer specs, colors, or storages may vary due to global supply fluctuations. PixelMart reserves the right to cancel orders or refund complete payments if products are listed with incorrect pricing due to systemic errors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <AlertOctagon className="h-4 w-4 text-neutral-500" />
              <span>3. Return and Replacement Policies</span>
            </h2>
            <p>
              We provide a premium, hassle-free 30-day return policy on all eligible purchases. Returned devices must be factory reset, free of physical damage, and packaged inside their original manufacturing box with all included accessories. Warranty claims beyond 30 days are serviced directly by Authorized Service Centers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Scale className="h-4 w-4 text-neutral-500" />
              <span>4. Limitation of Liability</span>
            </h2>
            <p>
              PixelMart shall not be held liable for any indirect, incidental, or consequential damages resulting from device configuration, data loss during transfer, or hardware setup. Our maximum legal liability is strictly capped at the original invoice total paid for the specific device in question.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
