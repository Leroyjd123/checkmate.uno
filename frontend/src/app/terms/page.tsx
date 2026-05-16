'use client';

import Link from 'next/link';

export default function Terms() {
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
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-slate-400 text-sm mb-8">
            Last updated: May 2026
          </p>

          <div className="space-y-8 text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p>
                By accessing and using this website and service, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the materials (information or software) on Checkmate's service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                <li>• Modifying or copying the materials</li>
                <li>• Using the materials for any commercial purpose or for any public display</li>
                <li>• Attempting to decompile or reverse engineer any software contained on the service</li>
                <li>• Removing any copyright or other proprietary notations from the materials</li>
                <li>• Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
              <p>
                The materials on Checkmate's service are provided on an 'as is' basis. Checkmate makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Limitations</h2>
              <p>
                In no event shall Checkmate or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Checkmate's website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">User Conduct</h2>
              <p>
                You agree not to:
              </p>
              <ul className="space-y-2 ml-4 mt-3">
                <li>• Harass, threaten, embarrass, or cause distress or discomfort to any individual</li>
                <li>• Engage in any form of cheating or unfair play</li>
                <li>• Use automated tools to gain an unfair advantage</li>
                <li>• Violate any applicable laws or regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p>
                Checkmate may revise these terms of service at any time without notice. By using this service, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which Checkmate operates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at{' '}
                <a href="mailto:legal@checkmate.game" className="text-blue-400 hover:text-blue-300">
                  legal@checkmate.game
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
