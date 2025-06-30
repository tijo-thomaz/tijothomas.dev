"use client";

import { useState, useEffect } from 'react';

interface CookieConsentProps {
  onConsentChange: (consent: boolean) => void;
}

export default function CookieConsent({ onConsentChange }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem('tijothomas-cookie-consent');
    if (savedConsent === null) {
      setShowBanner(true);
    } else {
      const consentValue = savedConsent === 'true';
      setConsent(consentValue);
      onConsentChange(consentValue);
    }
  }, [onConsentChange]);

  const handleAccept = () => {
    setConsent(true);
    setShowBanner(false);
    localStorage.setItem('tijothomas-cookie-consent', 'true');
    onConsentChange(true);
  };

  const handleDecline = () => {
    setConsent(false);
    setShowBanner(false);
    localStorage.setItem('tijothomas-cookie-consent', 'false');
    onConsentChange(false);
  };

  const handleManage = () => {
    // Show detailed preferences
    alert('Cookie preferences: You can change your mind anytime by clearing browser data or contacting tijo1293@gmail.com');
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-green-400/30 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-green-400 font-mono font-bold mb-2">🍪 Privacy Notice</h3>
            <p className="text-gray-300 text-sm font-mono leading-relaxed">
              This portfolio collects anonymous analytics to improve user experience. 
              We track terminal commands, page visits, and technical data. 
              <strong className="text-green-400"> No personal information is stored.</strong>
            </p>
            <p className="text-gray-400 text-xs mt-2 font-mono">
              Data is stored securely and never shared. You can opt out anytime.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
            <button
              onClick={handleAccept}
              className="bg-green-500 hover:bg-green-400 text-black px-4 py-2 rounded font-mono text-sm font-bold transition-colors"
            >
              ✓ Accept Analytics
            </button>
            <button
              onClick={handleDecline}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-mono text-sm transition-colors"
            >
              ✗ Decline
            </button>
            <button
              onClick={handleManage}
              className="text-green-400 hover:text-green-300 px-2 py-2 font-mono text-xs underline transition-colors"
            >
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
