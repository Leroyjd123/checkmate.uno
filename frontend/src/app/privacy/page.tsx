'use client';

import Link from 'next/link';

export default function Privacy() {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-sm mb-8">
            Last updated: May 2026
          </p>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p>
                Checkmate (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the checkmate.game website and service. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Data We Collect</h2>
              <ul className="space-y-2 ml-4">
                <li>• Email address and password (for account creation)</li>
                <li>• Game history and statistics</li>
                <li>• IP address and device information</li>
                <li>• Usage patterns and preferences</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">How We Use Your Data</h2>
              <p>
                We use collected data to:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                <li>• Provide and maintain the service</li>
                <li>• Notify you about changes to our service</li>
                <li>• Allow you to participate in interactive features</li>
                <li>• Provide customer support</li>
                <li>• Gather analysis or valuable information to improve the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Security</h2>
              <p>
                The security of your data is important to us but remember that no method of transmission over the Internet is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top of this page.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@checkmate.game" className="text-blue-400 hover:text-blue-300">
                  privacy@checkmate.game
                </a>
              </p>
            </section>
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
