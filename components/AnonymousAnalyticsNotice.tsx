"use client";

import { useState } from 'react';

export default function AnonymousAnalyticsNotice() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-blue-500/20 border border-blue-400/50 rounded-lg p-4 max-w-2xl mx-auto mb-4">
      <div className="flex items-start gap-3">
        <span className="text-blue-400 text-xl">ℹ️</span>
        <div className="flex-1">
          <h3 className="text-blue-400 font-mono font-bold mb-2">
            Truly Anonymous Analytics
          </h3>
          <p className="text-blue-300 text-sm font-mono mb-3">
            This portfolio uses <strong>genuinely anonymous</strong> analytics. 
            No personal data, tracking, or behavioral profiling.
          </p>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-400 hover:text-blue-300 text-xs font-mono underline"
          >
            {showDetails ? 'Hide Details' : 'Show What We Actually Track'}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 text-xs font-mono">
              <div className="bg-blue-900/30 rounded p-3">
                <h4 className="text-blue-300 font-bold mb-2">✅ What We Track:</h4>
                <ul className="space-y-1 text-blue-200">
                  <li>• Daily visitor count (anonymous number only)</li>
                  <li>• Device type (mobile/tablet/desktop for UX)</li>
                  <li>• Popular commands (help, about, skills - no personal context)</li>
                  <li>• Session duration (how long people explore)</li>
                </ul>
              </div>
              
              <div className="bg-red-900/30 rounded p-3">
                <h4 className="text-red-300 font-bold mb-2">❌ What We DON'T Track:</h4>
                <ul className="space-y-1 text-red-200">
                  <li>• No IP addresses or location data</li>
                  <li>• No personal information or identifiers</li>
                  <li>• No chat content or questions you ask</li>
                  <li>• No browser fingerprinting</li>
                  <li>• No cross-site tracking or cookies</li>
                  <li>• No behavioral profiling or user identification</li>
                </ul>
              </div>

              <div className="bg-green-900/30 rounded p-3">
                <h4 className="text-green-300 font-bold mb-2">🎯 Why This Matters:</h4>
                <p className="text-green-200">
                  Traditional analytics create detailed profiles of users. 
                  Ours just helps improve the portfolio experience without 
                  compromising your privacy.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
