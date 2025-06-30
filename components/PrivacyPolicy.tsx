"use client";

import { useState } from 'react';

export default function PrivacyPolicy() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-green-400 font-mono underline transition-colors"
      >
        Privacy Policy
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-400/30 rounded-xl max-w-4xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-400 font-mono">Privacy Policy</h1>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-400 font-mono text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-300 font-mono text-sm leading-relaxed">
          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">📊 Data We Collect</h2>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Usage Analytics:</strong> Terminal commands, page visits, session duration</li>
              <li>• <strong>Technical Data:</strong> Browser type, device type, screen resolution</li>
              <li>• <strong>Performance Data:</strong> Page load times, interaction patterns</li>
              <li>• <strong>Chat Interactions:</strong> Questions asked to AI assistant (anonymized)</li>
            </ul>
            <p className="text-red-300 text-xs mt-2">
              ⚠️ We do NOT collect: Names, emails, IP addresses, or any personally identifiable information
            </p>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">🔒 How We Use Data</h2>
            <ul className="space-y-2 ml-4">
              <li>• Improve portfolio user experience</li>
              <li>• Understand which features are most useful</li>
              <li>• Optimize performance and loading times</li>
              <li>• Generate anonymous usage statistics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">🛡️ Data Protection</h2>
            <ul className="space-y-2 ml-4">
              <li>• Data stored securely in Supabase (EU-compliant)</li>
              <li>• No data sharing with third parties</li>
              <li>• Automatic data retention: 12 months</li>
              <li>• You can request data deletion anytime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">⚖️ Your Rights (GDPR)</h2>
            <ul className="space-y-2 ml-4">
              <li>• <strong>Right to Access:</strong> Request your data</li>
              <li>• <strong>Right to Delete:</strong> Request data removal</li>
              <li>• <strong>Right to Opt-out:</strong> Disable analytics anytime</li>
              <li>• <strong>Right to Portability:</strong> Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">🗑️ Delete Your Data</h2>
            <p className="mb-3">
              You can delete your session data instantly using the "Delete My Data" button 
              in the footer. This will permanently remove:
            </p>
            <ul className="space-y-1 ml-4 mb-3">
              <li>• Your session information</li>
              <li>• Commands executed during your visit</li>
              <li>• Theme preferences</li>
              <li>• Any stored interaction data</li>
            </ul>
            <p className="text-yellow-400 text-sm">
              ⚠️ Only anonymous visitor count remains for site statistics.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">📧 Contact</h2>
            <p>
              For any privacy concerns or data requests:
              <br />
              <strong className="text-green-400">Email:</strong> tijo1293@gmail.com
              <br />
              <strong className="text-green-400">Response time:</strong> Within 48 hours
            </p>
          </section>

          <section className="border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-400">
              Last updated: {new Date().toLocaleDateString()} | 
              This portfolio is GDPR compliant and respects your privacy.
            </p>
          </section>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-green-500 hover:bg-green-400 text-black px-6 py-2 rounded font-mono font-bold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
