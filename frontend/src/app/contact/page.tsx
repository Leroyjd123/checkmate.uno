'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <style jsx>{`
        .subtle-pattern {
          background-image: radial-gradient(circle, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>

      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg">
            ♔ Checkmate
          </Link>
          <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">
            Back home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-16 subtle-pattern">
        <div className="max-w-2xl mx-auto relative z-10">
          <h1 className="text-4xl font-bold mb-4">Contact us</h1>
          <p className="text-slate-300 mb-8">
            Have a question or feedback? We'd love to hear from you.
          </p>

          {submitted ? (
            <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
              <p className="text-center text-green-400">Thank you! We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="w-full px-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white placeholder-slate-500 focus:outline-none focus:border-green-500"
                  placeholder="Your message..."
                />
              </div>

              <button
                type="submit"
                className="w-full px-6 py-3 bg-green-500 text-slate-950 rounded-xl font-semibold transition-colors hover:bg-green-400"
              >
                Send message
              </button>
            </form>
          )}

          <div className="mt-12 pt-12 border-t border-slate-800">
            <h2 className="text-xl font-bold mb-4">Other ways to reach us</h2>
            <ul className="space-y-3 text-slate-300">
              <li>
                <strong>GitHub:</strong>{' '}
                <a href="https://github.com" className="text-blue-400 hover:text-blue-300">
                  github.com/checkmate
                </a>
              </li>
              <li>
                <strong>Email:</strong>{' '}
                <a href="mailto:hello@checkmate.game" className="text-blue-400 hover:text-blue-300">
                  hello@checkmate.game
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 bg-slate-950">
        <div className="max-w-6xl mx-auto text-center text-xs text-slate-600">
          <p>© 2026 Checkmate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
