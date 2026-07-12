import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Sparkles, Cpu, Award, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  useEffect(() => {
    document.title = "About Us | PixelMart Premium Devices";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Discover PixelMart's mission to curate the world's most premium, authentic devices with ultimate security and express shipping.");
    }
    window.scrollTo(0, 0);
  }, []);

  return (
    <div id="about-page" className="bg-white min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative py-20 bg-neutral-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-semibold tracking-wider uppercase mb-4">
              Our Vision
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-sans">
              Pure Engineering. <br />
              <span className="text-neutral-400">Pixel-Perfect Experience.</span>
            </h1>
            <p className="mt-6 text-sm text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              At PixelMart, we are dedicated to bringing you the finest selection of premium hardware devices and official accessories, curated for performance and reliability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Corporate Values (Bento Grid Style) */}
      <section className="py-16 bg-neutral-50/50 border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Why Customers Trust PixelMart</h2>
            <p className="mt-2 text-xs text-neutral-500">Every decision we make is guided by three core philosophies.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-2xl border border-neutral-150 shadow-sm flex flex-col space-y-4"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Pure Operating Philosophy</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We believe in devices without bloatware. Experience clean, fluid, and incredibly powerful software exactly as it was meant to be.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-2xl border border-neutral-150 shadow-sm flex flex-col space-y-4"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Guaranteed Authenticity</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                All products in our storefront are sourced directly from authorized channels. Each device is protected by official warrants and passes thorough hardware quality control.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-2xl border border-neutral-150 shadow-sm flex flex-col space-y-4"
            >
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">Elite Customer Care</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                From pre-sale advisory services to post-purchase setup tutorials, our expert tech specialists are available round-the-clock to guide your premium digital journey.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest font-mono">Our Journey</span>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Curating the Future of Mobile Hardware</h2>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Founded in 2024, PixelMart arose from a simple realization: premium hardware deserves a premium shopping experience. Instead of clunky, bloated e-commerce templates, we set out to build an elegant storefront that matches our sleek, minimalist design ethos.
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We design and maintain specialized pipelines that secure official warranty packages, rapid premium delivery routes, and custom trade-in solutions. Today, we serve over 50,000 Android enthusiasts across the continent.
              </p>
              <div className="pt-2">
                <Link to="/" className="inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-700 gap-1">
                  <span>Explore our Catalog</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80" 
                alt="Our creative workspace" 
                className="rounded-2xl border border-neutral-100 shadow-lg object-cover h-80 w-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-4 -left-4 bg-white border border-neutral-100 p-4 rounded-xl shadow-md hidden sm:flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold font-mono text-sm">50K</div>
                <div>
                  <div className="text-[10px] font-bold text-neutral-900">Happy Users</div>
                  <div className="text-[8px] text-neutral-500">Global Customer Base</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
