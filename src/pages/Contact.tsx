import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function Contact() {
  useEffect(() => {
    document.title = "Contact Support | PixelMart Helpdesk";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Contact PixelMart's 24/7 customer experience team for hardware assistance, shipment tracking, or warranty inquiries.");
    }
    window.scrollTo(0, 0);
  }, []);

  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      setError('Please fill in all fields before submitting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, subject, message })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contact message.');
      }

      setSuccess(true);
      toast.success('Your message has been successfully sent to PixelMart support.');
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      toast.error(err.message || 'Error sending contact message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact-page" className="bg-neutral-50/50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-semibold tracking-wider uppercase mb-3 shadow-xs">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span>Support Specialist</span>
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Connect with PixelMart</h1>
            <p className="mt-2 text-xs text-neutral-500">
              Have questions about our premium hardware devices, orders, or warranties? Our elite support team is ready to guide you.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Details Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xs space-y-6">
              <h2 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-neutral-500" />
                <span>Contact Channels</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0 text-neutral-600">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">Direct Support Email</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">support@pixelmart.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0 text-neutral-600">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">Toll-Free Phone Support</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">1-800-555-PXLM (7956)</p>
                    <p className="text-[9px] text-neutral-400 mt-0.5">Mon - Fri: 9 AM to 6 PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-neutral-50 border border-neutral-150 flex items-center justify-center shrink-0 text-neutral-600">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-900">Corporate HQ</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      PixelMart Inc. <br />
                      100 Silicon Boulevard, Suite 500 <br />
                      Mountain View, CA 94043
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick response banner */}
            <div className="bg-neutral-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]"></div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Guaranteed Response</h3>
              <p className="text-[11px] text-neutral-400 mt-2 leading-relaxed">
                We respect your time. All contact queries submitted through our web system are reviewed and answered within <span className="text-white font-semibold">12 business hours</span>, guaranteed.
              </p>
            </div>
          </div>

          {/* Contact Form Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900 mb-6">Send Us a Direct Message</h2>
              
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="inline-flex p-3 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 mb-2">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-900">Message Received!</h3>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                    Thank you for connecting with us. We have successfully registered your message under reference ID <span className="font-mono text-neutral-800">#PX-{Math.floor(Math.random() * 90000 + 10000)}</span>. A specialist will reply to your registered email soon.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSuccess(false)}
                      className="px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-full text-xs font-semibold transition-all cursor-pointer"
                    >
                      Send Another Message
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form className="space-y-5" onSubmit={handleSubmit}>
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex items-start gap-2 animate-fade-in">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        placeholder="Julian Vance"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Your Email Address</label>
                      <input
                        type="email"
                        required
                        disabled={loading}
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Inquiry Subject</label>
                    <select
                      disabled={loading}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all cursor-pointer"
                    >
                      <option value="General Inquiry">General Product Inquiry</option>
                      <option value="Order Tracking">Order & Shipping Status</option>
                      <option value="Warranty claim">Warranty & Return request</option>
                      <option value="Partnerships">Business Partnerships</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Detailed Message</label>
                    <textarea
                      required
                      disabled={loading}
                      rows={5}
                      placeholder="Describe your query in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 transition-all resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white rounded-full text-xs font-semibold flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                    >
                      {loading ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span>Submit Message</span>
                          <Send className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
