"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Command, X, Shield } from "lucide-react";
import { getAnalyticsSummary } from "@/lib/simple-analytics";

const SimpleAnalyticsDisplay = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localStats, setLocalStats] = useState({
    visits: 0,
    commands: 0,
    questions: 0,
    sessionTime: "<1m",
    lastCommand: "none",
  });
  const [globalStats, setGlobalStats] = useState({
    totalVisits: 0,
    totalCommands: 0,
    totalQuestions: 0,
    error: null as string | null,
  });

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = async () => {
    // Get local data
    const localData = getAnalyticsSummary();
    setLocalStats(localData);

    // Get global Supabase data
    try {
      const response = await fetch("/api/analytics");
      const globalData = await response.json();
      setGlobalStats({
        totalVisits: globalData.totalVisits || 0,
        totalCommands: globalData.totalCommands || 0,
        totalQuestions: globalData.totalQuestions || 0,
        error: globalData.error || null,
      });
    } catch (error) {
      setGlobalStats((prev) => ({
        ...prev,
        error: "Failed to fetch global stats",
      }));
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="bg-gray-800 border-green-400 text-green-300 hover:bg-gray-700 p-2 h-8 w-8"
        title="View Anonymous Analytics"
      >
        <BarChart3 className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-4 z-50 overflow-auto">
        <Card
          className="max-w-lg mx-auto border transition-colors duration-300"
          style={{
            backgroundColor: "var(--theme-card)",
            borderColor: "var(--theme-border)",
          }}
        >
          <CardHeader
            className="border-b flex flex-row items-center justify-between transition-colors duration-300"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <CardTitle
              className="font-mono flex items-center gap-2"
              style={{ color: "var(--theme-accent)" }}
            >
              <Shield className="w-5 h-5" />
              Analytics
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-green-300 hover:bg-green-400/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Privacy Notice */}
            <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 font-mono font-bold text-sm">
                <Shield className="w-3 h-3" />
                Truly Anonymous
              </div>
              <p className="text-green-300 text-xs font-mono mt-1">
                No personal data, no tracking, just basic usage patterns.
              </p>
            </div>

            {/* Your Session Stats */}
            <div>
              <div className="text-green-400 font-mono text-sm font-bold mb-2">
                📱 Your Session
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-green-400 font-mono text-xs mb-1">
                    Visits
                  </div>
                  <div className="text-white text-lg font-bold font-mono">
                    {localStats.visits}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-green-400 font-mono text-xs mb-1">
                    Commands
                  </div>
                  <div className="text-white text-lg font-bold font-mono">
                    {localStats.commands}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-green-400 font-mono text-xs mb-1">
                    Questions
                  </div>
                  <div className="text-white text-lg font-bold font-mono">
                    {localStats.questions}
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                  <div className="text-green-400 font-mono text-xs mb-1">
                    Time
                  </div>
                  <div className="text-white text-lg font-bold font-mono">
                    {localStats.sessionTime}
                  </div>
                </div>
              </div>

              {/* Last Command */}
              {localStats.lastCommand !== "none" && (
                <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 mt-3">
                  <div className="text-green-400 font-mono text-xs mb-1">
                    Last Command
                  </div>
                  <div className="text-gray-300 font-mono text-sm">
                    {localStats.lastCommand}
                  </div>
                </div>
              )}
            </div>

            {/* Global Portfolio Stats */}
            <div>
              <div className="text-blue-400 font-mono text-sm font-bold mb-2">
                🌍 Portfolio Totals
              </div>
              {globalStats.error ? (
                <div className="text-red-400 text-xs font-mono">
                  {globalStats.error}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="text-blue-400 font-mono text-xs mb-1">
                      Total Visits
                    </div>
                    <div className="text-white text-lg font-bold font-mono">
                      {globalStats.totalVisits}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="text-blue-400 font-mono text-xs mb-1">
                      Commands
                    </div>
                    <div className="text-white text-lg font-bold font-mono">
                      {globalStats.totalCommands}
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                    <div className="text-blue-400 font-mono text-xs mb-1">
                      Questions
                    </div>
                    <div className="text-white text-lg font-bold font-mono">
                      {globalStats.totalQuestions}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-center text-gray-400 text-xs font-mono border-t border-gray-700 pt-3">
              <span className="text-green-400">
                Anonymous counts only • No personal data
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SimpleAnalyticsDisplay;
