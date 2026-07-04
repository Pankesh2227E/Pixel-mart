import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, Lock, FileText } from 'lucide-react';

export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | PixelMart Security";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Read the PixelMart Privacy Policy to understand how we protect your personal information and transactions with military-grade security.");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="privacy-page" className="bg-white min-h-screen py-12">
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
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">Privacy Policy</h1>
              <p className="text-xs text-neutral-500 mt-1">Last Updated: July 4, 2026</p>
            </div>
          </motion.div>
        </div>

        {/* Content Block */}
        <div className="space-y-8 text-xs text-neutral-600 leading-relaxed">
          
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Eye className="h-4 w-4 text-neutral-500" />
              <span>1. Information We Collect</span>
            </h2>
            <p>
              At PixelMart, we are committed to protecting your privacy. We collect data essential to fulfill your Google ecosystem device orders and improve your shopping experience.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Personal Identifiers:</strong> Name, shipping/billing address, phone number, and email.</li>
              <li><strong>Account Credentials:</strong> Hashed passwords for secure client logins.</li>
              <li><strong>Usage Data:</strong> Anonymized interaction logs with our store filters and categories.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <Lock className="h-4 w-4 text-neutral-500" />
              <span>2. How We Secure Your Data</span>
            </h2>
            <p>
              Your sensitive data is protected using state-of-the-art secure socket layers (SSL/TLS), industry-standard password hashing algorithms (bcryptjs), and secure sandboxed databases (MongoDB Atlas/local fallbacks). We strictly never store complete credit card details on our own servers. Payment authorization is brokered securely via Cashfree Online.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="h-4 w-4 text-neutral-500" />
              <span>3. Data Sharing and Third Parties</span>
            </h2>
            <p>
              PixelMart does not sell, lease, or distribute your personal details to advertising agencies. We only share critical transaction data with:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Logistics Partners:</strong> To dispatch, route, and deliver official Pixel shipments.</li>
              <li><strong>Payment gateways:</strong> Cashfree Payments API for secure billing authorization.</li>
              <li><strong>Regulatory Authorities:</strong> Only when strictly compelled by state or federal mandate.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-neutral-500" />
              <span>4. Your Rights and Controls</span>
            </h2>
            <p>
              You retain absolute legal authority over your personal digital records. You may log into your secure PixelMart profile page at any time to update your address fields, review previous checkout history, edit your wishlist, or submit a request to completely delete your client credentials.
            </p>
            <p className="mt-2">
              For any privacy inquiries or to make data requests, please connect with our Data Protection Officer directly via email at <span className="font-semibold text-neutral-900">privacy@pixelmart.com</span>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}
