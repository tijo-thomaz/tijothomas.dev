"use client";

export default function TrulyAnonymousNotice() {
  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-green-500/20 border border-green-400/50 rounded-lg p-4 z-50">
      <div className="flex items-start gap-3">
        <span className="text-green-400 text-lg">🔒</span>
        <div>
          <h3 className="text-green-400 font-mono font-bold text-sm mb-1">
            Privacy First
          </h3>
          <p className="text-green-300 text-xs font-mono">
            This site uses truly anonymous analytics. No personal data collected, 
            no tracking, no behavioral profiling.
          </p>
          <p className="text-green-400 text-xs font-mono mt-2 font-bold">
            Your privacy is protected.
          </p>
        </div>
      </div>
    </div>
  );
}
