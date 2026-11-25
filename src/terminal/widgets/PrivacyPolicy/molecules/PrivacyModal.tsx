"use client";

import { CloseButton } from '../atoms/CloseButton';
import { PolicySection } from '../atoms/PolicySection';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal = ({ onClose }: PrivacyModalProps) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-400/30 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-400 font-mono">
            🔒 Privacy First
          </h1>
          <CloseButton onClick={onClose} />
        </div>

        <div className="space-y-6 text-gray-300 font-mono text-sm leading-relaxed">
          <PolicySection title="✅ What This Terminal Stores">
            <ul className="space-y-2 ml-4">
              <li>• <strong>Your settings:</strong> theme, zoom and sound, saved in your browser storage</li>
              <li>• <strong>Local usage counters:</strong> kept in your browser and never sent anywhere</li>
              <li>• <strong>Daily counts:</strong> a date and a number of visits and commands, with nothing that identifies you</li>
            </ul>
          </PolicySection>

          <PolicySection title="🌐 What the Host Sees">
            <ul className="space-y-2 ml-4">
              <li>• <strong>Request logs:</strong> Vercel, which hosts this site, processes your IP address and browser details</li>
              <li>• <strong>Web Analytics:</strong> page views counted without cookies; the visitor hash is discarded after 24 hours</li>
            </ul>
          </PolicySection>

          <PolicySection title="❌ What We DON'T Do">
            <ul className="space-y-2 ml-4">
              <li>• <strong>No Cookies:</strong> this site sets none</li>
              <li>• <strong>No Profiling:</strong> no cross-site tracking or behavioural profiling</li>
              <li>• <strong>No Data Selling:</strong> your data is never sold</li>
            </ul>
          </PolicySection>

          <PolicySection title="📄 Full Details">
            <p>
              Lawful basis, processors, retention and your rights:{" "}
              <a href="/privacy" className="text-green-400 hover:text-green-300 underline">
                Read the full privacy notice
              </a>
            </p>
          </PolicySection>

          <PolicySection title="📞 Questions?">
            <p>
              Contact:{" "}
              <a
                href="https://linkedin.com/in/tijo-j-thomaz93"
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline"
              >
                LinkedIn
              </a>
            </p>
          </PolicySection>
        </div>
      </div>
    </div>
  );
};
