"use client";

import { useState } from "react";

export const PrivacyPolicy = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-xs text-gray-400 hover:text-green-400 font-mono underline transition-colors"
      >
        Privacy Notice
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-green-400/30 rounded-xl max-w-2xl max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-green-400 font-mono">
            🔒 Privacy First
          </h1>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-red-400 font-mono text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 text-gray-300 font-mono text-sm leading-relaxed">
          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">
              ✅ What We Do
            </h2>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong>Truly Anonymous Analytics:</strong> Basic usage
                patterns only
              </li>
              <li>
                • <strong>No Personal Data:</strong> Zero collection of
                identifiable information
              </li>
              <li>
                • <strong>No Tracking:</strong> No cross-site tracking or
                behavioral profiling
              </li>
              <li>
                • <strong>Local Storage Only:</strong> Data stays in your
                browser
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">
              ❌ What We DON'T Do
            </h2>
            <ul className="space-y-2 ml-4">
              <li>
                • <strong>No Cookies:</strong> Zero tracking cookies
              </li>
              <li>
                • <strong>No IP Tracking:</strong> Your location stays private
              </li>
              <li>
                • <strong>No Fingerprinting:</strong> No device identification
              </li>
              <li>
                • <strong>No Data Selling:</strong> Your data is never monetized
              </li>
              <li>
                • <strong>No Cross-Site Tracking:</strong> This site only
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">
              🎯Analytics
            </h2>
            <p className="text-green-300">
              We only track basic usage patterns to improve the portfolio
              experience:
            </p>
            <ul className="space-y-1 ml-4 mt-2 text-sm">
              <li>• Terminal commands used</li>
              <li>• Pages visited</li>
              <li>• Time spent on site</li>
            </ul>
            <p className="text-green-400 font-bold mt-3">
              Your privacy is protected. Period.
            </p>
          </section>

          <section>
            <h2 className="text-lg text-green-400 font-bold mb-3">
              📞 Questions?
            </h2>
            <p>
              Contact:{" "}
              <a
                href="mailto:tijo1293@gmail.com"
                className="text-green-400 hover:text-green-300 underline"
              >
                tijo1293@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
